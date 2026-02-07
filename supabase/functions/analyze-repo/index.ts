import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Config ────────────────────────────────────────────────────────────────────

const MAX_FILES = 30;
const MAX_LINES_PER_FILE = 500;

const SOURCE_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".rs", ".java",
  ".cpp", ".c", ".h", ".hpp", ".rb", ".swift", ".kt", ".kts",
  ".scala", ".clj", ".ex", ".exs", ".zig", ".lua", ".php",
  ".cs", ".fs", ".ml", ".hs", ".erl", ".sh", ".bash",
]);

const EXCLUDED_DIRS = new Set([
  "node_modules", "vendor", "dist", "build", ".git", "__pycache__",
  ".next", ".nuxt", "target", "out", "coverage", ".cache",
  ".vscode", ".idea", "bin", "obj", "venv", "env", ".env",
  "assets", "static", "public/assets", "docs",
]);

const EXCLUDED_PATTERNS = [
  /\.test\./i, /\.spec\./i, /\.d\.ts$/i, /\.min\./i,
  /lock\./i, /\.lock$/i, /\.map$/i, /\.snap$/i,
  /\.config\./i, /\.conf\./i, /tsconfig/i, /eslint/i,
  /prettier/i, /jest/i, /vitest/i, /webpack/i, /vite\.config/i,
  /babel/i, /postcss/i, /tailwind\.config/i,
];

// Identity files we always want
const IDENTITY_FILES = [
  "README.md", "readme.md", "package.json", "Cargo.toml",
  "pyproject.toml", "go.mod", "pom.xml", "build.gradle",
  "Gemfile", "composer.json", "setup.py", "setup.cfg",
];

// ─── GitHub helpers ────────────────────────────────────────────────────────────

function getGitHubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "CodeTale-Analyzer",
  };
  const token = Deno.env.get("GITHUB_TOKEN");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

interface TreeItem {
  path: string;
  type: "blob" | "tree";
  size?: number;
}

async function fetchFileTree(owner: string, repo: string): Promise<TreeItem[]> {
  const headers = getGitHubHeaders();

  // First get the default branch
  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
  if (!repoRes.ok) {
    const errText = await repoRes.text();
    const remaining = repoRes.headers.get("x-ratelimit-remaining");
    const resetTime = repoRes.headers.get("x-ratelimit-reset");

    if (repoRes.status === 403 || repoRes.status === 429) {
      const resetDate = resetTime ? new Date(parseInt(resetTime) * 1000) : null;
      const minutesLeft = resetDate ? Math.ceil((resetDate.getTime() - Date.now()) / 60000) : null;
      const waitMsg = minutesLeft ? ` Try again in ~${minutesLeft} minute(s).` : " Try again later.";
      throw new Error(`RATE_LIMIT:GitHub API rate limit exceeded.${waitMsg}`);
    }
    if (repoRes.status === 404) {
      throw new Error("REPO_NOT_FOUND:Repository not found or is private. Add a GitHub token for private repos.");
    }
    throw new Error(`GitHub API error (${repoRes.status}): ${errText}`);
  }

  const repoInfo = await repoRes.json();
  const defaultBranch = repoInfo.default_branch || "main";

  // Fetch recursive tree
  const treeRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
    { headers }
  );

  if (!treeRes.ok) {
    const errText = await treeRes.text();
    throw new Error(`Failed to fetch file tree: ${treeRes.status} ${errText}`);
  }

  const treeData = await treeRes.json();
  return (treeData.tree || []).filter((item: TreeItem) => item.type === "blob");
}

function isExcludedDir(path: string): boolean {
  const parts = path.split("/");
  return parts.some((part) => EXCLUDED_DIRS.has(part));
}

function isExcludedPattern(filename: string): boolean {
  return EXCLUDED_PATTERNS.some((rx) => rx.test(filename));
}

function getExtension(path: string): string {
  const idx = path.lastIndexOf(".");
  return idx >= 0 ? path.substring(idx).toLowerCase() : "";
}

interface PrioritizedFile {
  path: string;
  priority: number; // lower = higher priority
}

function prioritizeFiles(files: TreeItem[]): PrioritizedFile[] {
  const result: PrioritizedFile[] = [];

  for (const file of files) {
    const filename = file.path.split("/").pop() || "";
    const ext = getExtension(filename);

    // Skip excluded dirs and patterns
    if (isExcludedDir(file.path)) continue;
    if (isExcludedPattern(filename)) continue;

    // Priority 1: Identity files
    if (IDENTITY_FILES.includes(filename)) {
      result.push({ path: file.path, priority: 1 });
      continue;
    }

    // Must be a source code file from here
    if (!SOURCE_EXTENSIONS.has(ext)) continue;

    const lowerPath = file.path.toLowerCase();
    const lowerName = filename.toLowerCase().replace(ext, "");

    // Priority 2: Files with key names
    if (["main", "index", "app", "server", "core", "mod", "lib"].some((k) => lowerName.includes(k))) {
      result.push({ path: file.path, priority: 2 });
      continue;
    }

    // Priority 3: Files in key directories
    if (/^(src|lib|pkg|app|core|internal|cmd)\//i.test(lowerPath)) {
      result.push({ path: file.path, priority: 3 });
      continue;
    }

    // Priority 4: Everything else matching filter
    result.push({ path: file.path, priority: 4 });
  }

  // Sort by priority, then by path length (shorter = more important)
  result.sort((a, b) => a.priority - b.priority || a.path.length - b.path.length);

  return result.slice(0, MAX_FILES);
}

async function fetchFileContent(
  owner: string,
  repo: string,
  path: string
): Promise<string> {
  const headers = getGitHubHeaders();
  headers.Accept = "application/vnd.github.raw";

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`,
    { headers }
  );

  if (!res.ok) {
    console.warn(`  Failed to fetch ${path}: ${res.status}`);
    return `// Failed to fetch: ${res.status}`;
  }

  const text = await res.text();
  const lines = text.split("\n");
  if (lines.length > MAX_LINES_PER_FILE) {
    return lines.slice(0, MAX_LINES_PER_FILE).join("\n") + "\n\n// ... truncated (file has " + lines.length + " lines) ...";
  }
  return text;
}

// ─── AI Analysis ───────────────────────────────────────────────────────────────

async function analyzeWithAI(
  owner: string,
  repo: string,
  filesContent: { path: string; content: string }[]
): Promise<Record<string, unknown>> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

  if (!LOVABLE_API_KEY && !OPENAI_API_KEY) {
    throw new Error("No AI API key configured");
  }

  // Build file block
  const fileBlock = filesContent
    .map((f) => `--- ${f.path} ---\n${f.content}`)
    .join("\n\n");

  const systemPrompt = `You are an expert software architect. Analyze the entire codebase provided and return a comprehensive analysis as structured JSON.

Be precise and factual. Extract real data from the code — don't make up metrics.`;

  const userPrompt = `Analyze this entire codebase for the repository ${owner}/${repo}.

FILES:
${fileBlock}

Return a JSON object with this EXACT structure:
{
  "project_name": "string",
  "summary": "2-3 sentence description of what this project does",
  "main_language": "string",
  "languages": ["array of all languages detected"],
  "framework": "string or null (React, Django, Express, etc.)",
  "architecture_type": "monolith | microservices | serverless | library | CLI | API | fullstack",
  "key_components": [
    { "name": "string", "purpose": "string", "files": ["paths"] }
  ],
  "patterns_detected": ["Observer", "MVC", "Singleton", etc.],
  "dependencies_highlight": [
    { "name": "string", "why": "string" }
  ],
  "complexity_score": 1-10,
  "interesting_facts": [
    "string — something surprising or impressive about this codebase"
  ],
  "mermaid_architecture": "graph TD\\n  A[Component] --> B[Component]\\n  ...",
  "suggested_narrative": {
    "hook": "Opening line to grab attention",
    "chapters": [
      { "title": "string", "content": "string", "duration_seconds": 15 }
    ],
    "closing": "Final memorable statement"
  },
  "target_audiences": {
    "developer": "Why a dev would care about this repo",
    "manager": "Why a PM/CTO would care",
    "investor": "Why this tech matters for business"
  }
}`;

  // AI provider cascade (same as generate-presentation)
  interface AIProvider {
    name: string;
    endpoint: string;
    key: string;
    model: string;
  }

  const providers: AIProvider[] = [];

  if (LOVABLE_API_KEY) {
    providers.push({
      name: "Lovable AI (gpt-5.2)",
      endpoint: "https://ai.gateway.lovable.dev/v1/chat/completions",
      key: LOVABLE_API_KEY,
      model: "openai/gpt-5.2",
    });
  }

  if (OPENAI_API_KEY) {
    providers.push({
      name: "OpenAI Direct (gpt-4.1)",
      endpoint: "https://api.openai.com/v1/chat/completions",
      key: OPENAI_API_KEY,
      model: "gpt-4.1",
    });
    providers.push({
      name: "OpenAI Mini (gpt-4.1-mini)",
      endpoint: "https://api.openai.com/v1/chat/completions",
      key: OPENAI_API_KEY,
      model: "gpt-4.1-mini",
    });
  }

  console.log(`AI cascade: ${providers.map((p) => p.name).join(" → ")}`);

  const toolsPayload = {
    tools: [
      {
        type: "function",
        function: {
          name: "return_analysis",
          description: "Return the structured repository analysis",
          parameters: {
            type: "object",
            properties: {
              project_name: { type: "string" },
              summary: { type: "string" },
              main_language: { type: "string" },
              languages: { type: "array", items: { type: "string" } },
              framework: { type: ["string", "null"] },
              architecture_type: { type: "string" },
              key_components: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    purpose: { type: "string" },
                    files: { type: "array", items: { type: "string" } },
                  },
                  required: ["name", "purpose", "files"],
                },
              },
              patterns_detected: { type: "array", items: { type: "string" } },
              dependencies_highlight: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    why: { type: "string" },
                  },
                  required: ["name", "why"],
                },
              },
              complexity_score: { type: "number" },
              interesting_facts: { type: "array", items: { type: "string" } },
              mermaid_architecture: { type: "string" },
              suggested_narrative: {
                type: "object",
                properties: {
                  hook: { type: "string" },
                  chapters: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        content: { type: "string" },
                        duration_seconds: { type: "number" },
                      },
                      required: ["title", "content", "duration_seconds"],
                    },
                  },
                  closing: { type: "string" },
                },
                required: ["hook", "chapters", "closing"],
              },
              target_audiences: {
                type: "object",
                properties: {
                  developer: { type: "string" },
                  manager: { type: "string" },
                  investor: { type: "string" },
                },
                required: ["developer", "manager", "investor"],
              },
            },
            required: [
              "project_name", "summary", "main_language", "languages",
              "framework", "architecture_type", "key_components",
              "patterns_detected", "dependencies_highlight",
              "complexity_score", "interesting_facts",
              "mermaid_architecture", "suggested_narrative", "target_audiences",
            ],
          },
        },
      },
    ],
    tool_choice: { type: "function", function: { name: "return_analysis" } },
  };

  let lastError: Error | null = null;

  for (const provider of providers) {
    console.log(`► Trying ${provider.name}...`);

    for (let attempt = 0; attempt < 2; attempt++) {
      if (attempt > 0) {
        console.log(`  Retry ${attempt} for ${provider.name}...`);
        await new Promise((r) => setTimeout(r, 2000 * attempt));
      }

      try {
        const response = await fetch(provider.endpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${provider.key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: provider.model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            ...toolsPayload,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error(`  ${provider.name} error:`, response.status, errText);

          if (response.status === 402 || response.status === 401) {
            lastError = new Error(`${provider.name}: ${response.status === 402 ? "credits exhausted" : "auth failed"}`);
            break;
          }
          if (response.status === 429) {
            const isQuotaExhausted = errText.includes("insufficient_quota") || errText.includes("exceeded your current quota");
            if (isQuotaExhausted) {
              lastError = new Error(`${provider.name}: API quota exhausted`);
              break;
            }
            lastError = new Error(`${provider.name} rate limited`);
            continue;
          }
          lastError = new Error(`${provider.name} failed: ${response.status}`);
          continue;
        }

        const data = await response.json();
        const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
        if (!toolCall) {
          lastError = new Error(`${provider.name} did not return structured data`);
          continue;
        }

        const parsed = JSON.parse(toolCall.function.arguments);
        console.log(`✅ Analysis complete with ${provider.name}`);
        return parsed;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.error(`  ${provider.name} exception:`, lastError.message);
        continue;
      }
    }
  }

  throw lastError || new Error("All AI providers failed");
}

// ─── Main Handler ──────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { githubUrl } = await req.json();

    if (!githubUrl) {
      return new Response(
        JSON.stringify({ error: "githubUrl is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
    if (!match) {
      return new Response(
        JSON.stringify({ error: "Invalid GitHub URL" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const owner = match[1];
    const repo = match[2].replace(/\/$/, "");

    console.log(`=== Starting repo analysis: ${owner}/${repo} ===`);

    // Step 1: Fetch file tree
    console.log("Step 1: Scanning repository structure...");
    const allFiles = await fetchFileTree(owner, repo);
    console.log(`  Found ${allFiles.length} total files`);

    // Step 2: Prioritize & filter
    const prioritized = prioritizeFiles(allFiles);
    console.log(`  Selected ${prioritized.length} files for analysis`);

    if (prioritized.length === 0) {
      return new Response(
        JSON.stringify({ error: "NO_SOURCE_FILES:No source code files found in this repository." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 3: Fetch file contents (batched, max 5 concurrent)
    console.log("Step 2: Reading key files...");
    const filesContent: { path: string; content: string }[] = [];
    const BATCH_SIZE = 5;

    for (let i = 0; i < prioritized.length; i += BATCH_SIZE) {
      const batch = prioritized.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map(async (f) => ({
          path: f.path,
          content: await fetchFileContent(owner, repo, f.path),
        }))
      );
      filesContent.push(...results);
      console.log(`  Fetched ${Math.min(i + BATCH_SIZE, prioritized.length)}/${prioritized.length} files`);
    }

    // Step 4: AI analysis
    console.log("Step 3: AI analyzing architecture...");
    const analysis = await analyzeWithAI(owner, repo, filesContent);

    // Add metadata
    const result = {
      ...analysis,
      _meta: {
        owner,
        repo,
        files_scanned: prioritized.length,
        total_files: allFiles.length,
        analyzed_at: new Date().toISOString(),
      },
    };

    console.log(`=== Analysis complete for ${owner}/${repo} ===`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Analysis error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";

    const status =
      message.includes("RATE_LIMIT") ? 429 :
      message.includes("REPO_NOT_FOUND") ? 404 :
      message.includes("NO_SOURCE_FILES") ? 400 :
      message.includes("credits") ? 402 :
      500;

    // Strip error type prefix for user-facing message
    const userMessage = message.replace(/^[A-Z_]+:/, "");

    return new Response(
      JSON.stringify({ error: userMessage }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

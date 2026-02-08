import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ─── Rate Limiting ─────────────────────────────────────────────────────────────

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10; // max requests per window

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  entry.count++;
  return { allowed: true };
}

// Periodic cleanup of stale entries
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now >= entry.resetAt) rateLimitMap.delete(key);
  }
}, 60_000);

// ─── Config ────────────────────────────────────────────────────────────────────

const DEFAULT_MAX_FILES = 30;
const SMART_TRUNCATE_THRESHOLD = 300; // lines
const SMART_TRUNCATE_HEAD = 100;
const SMART_TRUNCATE_TAIL = 50;

const SOURCE_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".rs", ".java",
  ".cpp", ".c", ".h", ".hpp", ".rb", ".swift", ".kt", ".kts",
  ".scala", ".clj", ".ex", ".exs", ".zig", ".lua", ".php",
  ".cs", ".fs", ".ml", ".hs", ".erl", ".sh", ".bash",
  ".yaml", ".yml", ".toml", ".ini", ".cfg",
]);

const EXCLUDED_DIRS = new Set([
  "node_modules", "vendor", "dist", "build", ".git", "__pycache__",
  ".next", ".nuxt", "target", "out", "coverage", ".cache",
  ".vscode", ".idea", "bin", "obj", "venv", "env", ".env",
  "assets", "static", "public/assets", "docs", ".github",
  "migrations", "fixtures", "seeds", "test", "tests", "spec",
  "__tests__", "__mocks__", ".turbo", ".parcel-cache",
]);

const EXCLUDED_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".webp", ".bmp", ".tiff",
  ".woff", ".woff2", ".ttf", ".eot", ".otf",
  ".exe", ".dll", ".so", ".dylib", ".wasm", ".bin", ".o", ".a",
  ".csv", ".parquet", ".sqlite", ".db",
  ".map", ".min.js", ".min.css",
  ".lock",
  ".zip", ".tar", ".gz", ".rar", ".7z",
  ".mp3", ".mp4", ".wav", ".avi", ".mov", ".webm",
]);

const EXCLUDED_FILENAMES = new Set([
  "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "bun.lockb",
  "Gemfile.lock", "Pipfile.lock", "poetry.lock", "composer.lock",
  "go.sum", "Cargo.lock", "flake.lock",
  ".DS_Store", "Thumbs.db", ".gitignore", ".gitattributes",
  ".editorconfig", ".prettierrc", ".eslintignore",
]);

const EXCLUDED_PATTERNS = [
  /\.test\./i, /\.spec\./i, /\.d\.ts$/i, /\.min\./i,
  /\.snap$/i, /\.stories\./i, /\.e2e\./i,
];

const IDENTITY_FILES = [
  "README.md", "readme.md", "README.rst", "README.txt",
  "package.json", "Cargo.toml", "pyproject.toml", "go.mod",
  "pom.xml", "build.gradle", "Gemfile", "composer.json",
  "setup.py", "setup.cfg", "deno.json", "deno.jsonc",
];

const CONFIG_FILES = new Set([
  "tsconfig.json", "vite.config.ts", "vite.config.js",
  "next.config.js", "next.config.mjs", "next.config.ts",
  "webpack.config.js", "webpack.config.ts",
  "rollup.config.js", "rollup.config.ts",
  "Dockerfile", "docker-compose.yml", "docker-compose.yaml",
  ".env.example", "Makefile", "Procfile",
  "nest-cli.json", "angular.json", "nuxt.config.ts",
]);

const HIGH_RELEVANCE_KEYWORDS = [
  "route", "router", "api", "controller", "handler",
  "schema", "model", "type", "interface", "entity",
  "middleware", "guard", "interceptor", "service",
  "store", "context", "provider", "hook",
];

// ─── GitHub helpers ────────────────────────────────────────────────────────────

function getGitHubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "CodeTale-Analyzer",
  };
  const token = Deno.env.get("GITHUB_API_KEY");
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

  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
  if (!repoRes.ok) {
    const errText = await repoRes.text();
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

function isExcludedFile(path: string): boolean {
  const filename = path.split("/").pop() || "";
  const ext = getExtension(filename);

  if (EXCLUDED_FILENAMES.has(filename)) return true;
  if (EXCLUDED_EXTENSIONS.has(ext)) return true;
  if (isExcludedDir(path)) return true;
  if (isExcludedPattern(filename)) return true;

  return false;
}

function getExtension(path: string): string {
  const idx = path.lastIndexOf(".");
  return idx >= 0 ? path.substring(idx).toLowerCase() : "";
}

/** Compute adaptive budget based on repo size */
function getAdaptiveBudget(codeFileCount: number, requestedMax: number): number {
  if (codeFileCount <= 30) return codeFileCount; // small repo: read all
  if (codeFileCount <= 100) return Math.min(25, requestedMax); // medium
  return Math.min(20, requestedMax); // large
}

interface PrioritizedFile {
  path: string;
  priority: number;
}

interface SamplingStats {
  total_files: number;
  code_files: number;
  excluded_files: number;
  selected_files: number;
  budget_strategy: string;
  file_type_distribution: Record<string, number>;
  skipped_categories: { category: string; count: number }[];
}

function prioritizeFiles(files: TreeItem[], maxFiles: number): { selected: PrioritizedFile[]; stats: SamplingStats } {
  const result: PrioritizedFile[] = [];
  const excluded: { path: string; reason: string }[] = [];
  const extCounts: Record<string, number> = {};

  // Count all file types for metadata
  for (const file of files) {
    const ext = getExtension(file.path.split("/").pop() || "");
    extCounts[ext] = (extCounts[ext] || 0) + 1;
  }

  // Filter to candidate files
  const candidates: TreeItem[] = [];
  for (const file of files) {
    if (isExcludedFile(file.path)) {
      excluded.push({ path: file.path, reason: "excluded" });
      continue;
    }
    candidates.push(file);
  }

  // Determine adaptive budget
  const budget = getAdaptiveBudget(candidates.length, maxFiles);
  const budgetStrategy = candidates.length <= 30 ? "small_repo_all"
    : candidates.length <= 100 ? "medium_repo_top25"
    : "large_repo_top20";

  for (const file of candidates) {
    const filename = file.path.split("/").pop() || "";
    const ext = getExtension(filename);
    const lowerName = filename.toLowerCase().replace(ext, "");
    const lowerPath = file.path.toLowerCase();
    const depth = file.path.split("/").length;

    // Priority 1: Identity files (README, package.json, etc.)
    if (IDENTITY_FILES.includes(filename)) {
      result.push({ path: file.path, priority: 1 });
      continue;
    }

    // Priority 2: Config files (Dockerfile, tsconfig, etc.)
    if (CONFIG_FILES.has(filename)) {
      result.push({ path: file.path, priority: 2 });
      continue;
    }

    // Only source code from here
    if (!SOURCE_EXTENSIONS.has(ext)) continue;

    // Priority 3: Entry points
    if (["main", "index", "app", "server", "core", "mod", "lib"].some((k) => lowerName === k || lowerName.startsWith(k + "."))) {
      result.push({ path: file.path, priority: 3 });
      continue;
    }

    // Priority 4: High-relevance keyword files (routes, schemas, models, etc.)
    if (HIGH_RELEVANCE_KEYWORDS.some((kw) => lowerName.includes(kw) || lowerPath.includes(`/${kw}/`))) {
      result.push({ path: file.path, priority: 4 });
      continue;
    }

    // Priority 5: Top-level src/lib/app files
    if (/^(src|lib|pkg|app|core|internal|cmd)\//i.test(lowerPath) && depth <= 3) {
      result.push({ path: file.path, priority: 5 });
      continue;
    }

    // Priority 6: Other source files (deeper or less relevant)
    result.push({ path: file.path, priority: 6 });
  }

  // Sort by priority then by path depth (shallower = more relevant)
  result.sort((a, b) => a.priority - b.priority || a.path.split("/").length - b.path.split("/").length);
  const selected = result.slice(0, budget);

  // Build skipped categories for metadata
  const skippedCategories: { category: string; count: number }[] = [];
  const nodeModulesCount = files.filter((f) => f.path.includes("node_modules/")).length;
  const assetCount = files.filter((f) => {
    const ext = getExtension(f.path.split("/").pop() || "");
    return [".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".webp", ".woff", ".woff2", ".ttf", ".eot"].includes(ext);
  }).length;
  const lockCount = files.filter((f) => {
    const fn = f.path.split("/").pop() || "";
    return EXCLUDED_FILENAMES.has(fn) || fn.endsWith(".lock");
  }).length;

  if (nodeModulesCount > 0) skippedCategories.push({ category: "dependency files (node_modules, vendor)", count: nodeModulesCount });
  if (assetCount > 0) skippedCategories.push({ category: "asset files (images, fonts)", count: assetCount });
  if (lockCount > 0) skippedCategories.push({ category: "lock files", count: lockCount });

  // File type distribution (top extensions)
  const sortedExts = Object.entries(extCounts).sort(([, a], [, b]) => b - a);
  const totalExts = sortedExts.reduce((s, [, c]) => s + c, 0);
  const fileTypeDistribution: Record<string, number> = {};
  for (const [ext, count] of sortedExts.slice(0, 8)) {
    fileTypeDistribution[ext || "(no ext)"] = Math.round((count / totalExts) * 100);
  }

  return {
    selected,
    stats: {
      total_files: files.length,
      code_files: candidates.length,
      excluded_files: excluded.length,
      selected_files: selected.length,
      budget_strategy: budgetStrategy,
      file_type_distribution: fileTypeDistribution,
      skipped_categories: skippedCategories,
    },
  };
}

async function fetchFileContent(owner: string, repo: string, path: string): Promise<string> {
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

  // Smart truncation: for large files, keep head + tail for context
  if (lines.length > SMART_TRUNCATE_THRESHOLD) {
    const head = lines.slice(0, SMART_TRUNCATE_HEAD).join("\n");
    const tail = lines.slice(-SMART_TRUNCATE_TAIL).join("\n");
    return `${head}\n\n// ... [${lines.length - SMART_TRUNCATE_HEAD - SMART_TRUNCATE_TAIL} lines omitted — file has ${lines.length} total lines] ...\n\n${tail}`;
  }
  return text;
}

// ─── AI Analysis ───────────────────────────────────────────────────────────────

interface AnalysisOptions {
  include_narrative?: boolean;
  include_mermaid?: boolean;
  target_audience?: "developer" | "manager" | "investor" | "all";
  sampling_context?: string; // metadata enrichment for the AI
}

async function analyzeWithAI(
  owner: string,
  repo: string,
  filesContent: { path: string; content: string }[],
  options: AnalysisOptions = {}
): Promise<{ analysis: Record<string, unknown>; model_used: string }> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

  if (!LOVABLE_API_KEY && !OPENAI_API_KEY) {
    throw new Error("No AI API key configured");
  }

  const { include_narrative = true, include_mermaid = true, target_audience = "all", sampling_context = "" } = options;

  const fileBlock = filesContent
    .map((f) => `--- ${f.path} ---\n${f.content}`)
    .join("\n\n");

  // Prepend sampling context so the AI knows the full picture
  const contextPrefix = sampling_context ? `REPOSITORY CONTEXT:\n${sampling_context}\n\n` : "";

  const systemPrompt = `You are an expert software architect. Analyze the entire codebase provided and return a comprehensive analysis as structured JSON.

Be precise and factual. Extract real data from the code — don't make up metrics.
When the repository context mentions files that were skipped, factor that into your analysis (e.g., the true scale and complexity of the project).`;

  // Build optional sections
  const optionalFields: string[] = [];
  if (include_mermaid) {
    optionalFields.push(`  "mermaid_architecture": "graph TD\\n  A[\\"Component Name\\"] --> B[\\"Other Component\\"]\\n  ..."`);
  }
  if (include_narrative) {
    optionalFields.push(`  "suggested_narrative": {
    "hook": "Opening line to grab attention",
    "chapters": [
      { "title": "string", "content": "string", "duration_seconds": 15 }
    ],
    "closing": "Final memorable statement"
  }`);
  }

  let audienceField = `  "target_audiences": {
    "developer": "Why a dev would care about this repo",
    "manager": "Why a PM/CTO would care",
    "investor": "Why this tech matters for business"
  }`;
  if (target_audience !== "all") {
    audienceField = `  "target_audiences": {
    "${target_audience}": "Why a ${target_audience} would care about this repo"
  }`;
  }

  const userPrompt = `${contextPrefix}Analyze this entire codebase for the repository ${owner}/${repo}.

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
${optionalFields.join(",\n")},
${audienceField}
}

CRITICAL RULES for "mermaid_architecture":
- Use QUOTED labels for ALL nodes: A["Label text"] not A[Label text]
- NEVER use parentheses () inside brackets [] — Mermaid interprets them as shape syntax
- Use short, clear labels (max 4 words per node)
- Keep the diagram between 5-12 nodes for readability
- Use subgraph blocks to group related components
- Example: graph TD\\n  A["API Gateway"] --> B["Auth Service"]\\n  subgraph Core\\n    B --> C["Database"]\\n  end`;

  // Build required fields for tool schema
  const requiredFields = [
    "project_name", "summary", "main_language", "languages",
    "framework", "architecture_type", "key_components",
    "patterns_detected", "dependencies_highlight",
    "complexity_score", "interesting_facts", "target_audiences",
  ];
  if (include_mermaid) requiredFields.push("mermaid_architecture");
  if (include_narrative) requiredFields.push("suggested_narrative");

  const schemaProperties: Record<string, unknown> = {
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
    target_audiences: { type: "object" },
  };

  if (include_mermaid) {
    schemaProperties.mermaid_architecture = { type: "string" };
  }
  if (include_narrative) {
    schemaProperties.suggested_narrative = {
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
    };
  }

  const toolsPayload = {
    tools: [
      {
        type: "function",
        function: {
          name: "return_analysis",
          description: "Return the structured repository analysis",
          parameters: {
            type: "object",
            properties: schemaProperties,
            required: requiredFields,
          },
        },
      },
    ],
    tool_choice: { type: "function", function: { name: "return_analysis" } },
  };

  // AI provider cascade
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
        return { analysis: parsed, model_used: provider.model };
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

  const startTime = Date.now();

  // Rate limiting
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("cf-connecting-ip")
    || "unknown";

  const rateCheck = checkRateLimit(clientIp);
  if (!rateCheck.allowed) {
    console.warn(`Rate limit exceeded for IP: ${clientIp}`);
    return new Response(
      JSON.stringify({
        status: "error",
        error: `Rate limit exceeded. Max ${RATE_LIMIT_MAX} requests per minute.`,
        code: 429,
        retry_after_seconds: rateCheck.retryAfterSeconds,
      }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Retry-After": String(rateCheck.retryAfterSeconds || 60),
        },
      }
    );
  }

  try {
    const body = await req.json();

    // Support both old format (githubUrl) and new format (repo_url)
    const repoUrl = body.repo_url || body.githubUrl;
    const options = body.options || {};

    if (!repoUrl) {
      return new Response(
        JSON.stringify({ status: "error", error: "repo_url is required", code: 400 }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
    if (!match) {
      return new Response(
        JSON.stringify({ status: "error", error: "Invalid GitHub URL. Expected format: https://github.com/owner/repo", code: 400 }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const owner = match[1];
    const repo = match[2].replace(/\/$/, "");

    const maxFiles = Math.min(Math.max(options.max_files || DEFAULT_MAX_FILES, 1), 50);
    const includeNarrative = options.include_narrative !== false;
    const includeMermaid = options.include_mermaid !== false;
    const targetAudience = options.target_audience || "all";

    console.log(`=== Starting repo analysis: ${owner}/${repo} (max_files=${maxFiles}, audience=${targetAudience}) ===`);

    // Step 1: Fetch file tree
    console.log("Step 1: Scanning repository structure...");
    const allFiles = await fetchFileTree(owner, repo);
    console.log(`  Found ${allFiles.length} total files`);

    // Step 2: Smart prioritize & filter
    const { selected: prioritized, stats: samplingStats } = prioritizeFiles(allFiles, maxFiles);
    console.log(`  Strategy: ${samplingStats.budget_strategy}`);
    console.log(`  Code files: ${samplingStats.code_files} | Excluded: ${samplingStats.excluded_files} | Selected: ${samplingStats.selected_files}`);
    console.log(`  File types: ${JSON.stringify(samplingStats.file_type_distribution)}`);

    if (prioritized.length === 0) {
      return new Response(
        JSON.stringify({
          status: "error",
          error: "No source code files found in this repository.",
          code: 400,
        }),
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

    // Estimate token count
    const estimatedTokens = filesContent.reduce((sum, f) => sum + Math.ceil(f.content.length / 4), 0);
    console.log(`  Estimated tokens: ~${estimatedTokens.toLocaleString()}`);

    // Build metadata enrichment context for AI
    const skippedSummary = samplingStats.skipped_categories
      .map((s) => `${s.count} ${s.category}`)
      .join(", ");
    const typeDistStr = Object.entries(samplingStats.file_type_distribution)
      .map(([ext, pct]) => `${ext} (${pct}%)`)
      .join(", ");

    const samplingContext = [
      `Repository has ${samplingStats.total_files} files total.`,
      `${samplingStats.selected_files} code files were analyzed in detail (strategy: ${samplingStats.budget_strategy}).`,
      skippedSummary ? `Skipped: ${skippedSummary}.` : "",
      `File types present: ${typeDistStr}.`,
      `Estimated context: ~${estimatedTokens.toLocaleString()} tokens.`,
    ].filter(Boolean).join(" ");

    // Step 4: AI analysis
    console.log("Step 3: AI analyzing architecture...");
    const { analysis, model_used } = await analyzeWithAI(owner, repo, filesContent, {
      include_narrative: includeNarrative,
      include_mermaid: includeMermaid,
      target_audience: targetAudience,
      sampling_context: samplingContext,
    });

    const analysisTimeMs = Date.now() - startTime;

    // Build response in public API format
    const result = {
      status: "success",
      analysis: {
        ...analysis,
        _meta: {
          owner,
          repo,
          files_scanned: samplingStats.selected_files,
          total_files: samplingStats.total_files,
          analyzed_at: new Date().toISOString(),
          sampling: {
            strategy: samplingStats.budget_strategy,
            code_files_found: samplingStats.code_files,
            files_excluded: samplingStats.excluded_files,
            estimated_tokens: estimatedTokens,
            file_type_distribution: samplingStats.file_type_distribution,
          },
        },
      },
      metadata: {
        files_scanned: samplingStats.selected_files,
        total_files_in_repo: samplingStats.total_files,
        analysis_time_ms: analysisTimeMs,
        model_used,
        sampling_strategy: samplingStats.budget_strategy,
        estimated_tokens: estimatedTokens,
        timestamp: new Date().toISOString(),
      },
    };

    console.log(`=== Analysis complete for ${owner}/${repo} in ${analysisTimeMs}ms (${samplingStats.selected_files}/${samplingStats.total_files} files, ~${estimatedTokens} tokens) ===`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Analysis error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";

    const code =
      message.includes("RATE_LIMIT") ? 429 :
      message.includes("REPO_NOT_FOUND") ? 404 :
      message.includes("NO_SOURCE_FILES") ? 400 :
      message.includes("credits") ? 402 :
      500;

    const userMessage = message.replace(/^[A-Z_]+:/, "");

    return new Response(
      JSON.stringify({ status: "error", error: userMessage, code }),
      { status: code, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

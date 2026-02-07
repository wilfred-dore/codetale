import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── GitHub fetching ───────────────────────────────────────────────────────────

interface RepoData {
  name: string;
  fullName: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  topics: string[];
  readme: string;
  languages: Record<string, number>;
  openIssues: number;
  license: string;
  mediaUrls: string[];
}

async function fetchGitHubData(url: string): Promise<RepoData> {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
  if (!match) throw new Error("Invalid GitHub URL");

  const owner = match[1];
  const repo = match[2].replace(/\/$/, "");

  console.log(`Fetching GitHub data for ${owner}/${repo}`);

  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "CodeTale-App",
  };

  const [repoRes, readmeRes, langRes] = await Promise.all([
    fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers }),
    fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers: { ...headers, Accept: "application/vnd.github.raw" },
    }).catch(() => null),
    fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, {
      headers,
    }),
  ]);

  if (!repoRes.ok) {
    const errText = await repoRes.text();
    console.error("GitHub API error:", repoRes.status, errText);
    throw new Error(`GitHub API error: ${repoRes.status} - Repository not found or not accessible`);
  }

  const repoInfo = await repoRes.json();
  const readmeContent = readmeRes?.ok ? await readmeRes.text() : "";
  const languages = langRes.ok ? await langRes.json() : {};

  // ── Extract media URLs from README ──
  const mediaUrls = extractMediaUrls(readmeContent, owner, repo);
  console.log(`Found ${mediaUrls.length} media URLs in README`);

  return {
    name: repoInfo.name,
    fullName: repoInfo.full_name,
    description: repoInfo.description || "",
    stars: repoInfo.stargazers_count,
    forks: repoInfo.forks_count,
    language: repoInfo.language || "Unknown",
    topics: repoInfo.topics || [],
    readme: readmeContent.substring(0, 3000),
    languages,
    openIssues: repoInfo.open_issues_count,
    license: repoInfo.license?.spdx_id || "Unknown",
    mediaUrls,
  };
}

// ── Extract images/videos/gifs from README markdown ──
function extractMediaUrls(readme: string, owner: string, repo: string): string[] {
  const urls: string[] = [];

  // Match markdown images: ![alt](url)
  const mdImages = readme.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g);
  for (const m of mdImages) {
    urls.push(resolveGitHubUrl(m[1], owner, repo));
  }

  // Match HTML img tags: <img src="url" />
  const htmlImages = readme.matchAll(/<img[^>]+src=["']([^"']+)["']/gi);
  for (const m of htmlImages) {
    urls.push(resolveGitHubUrl(m[1], owner, repo));
  }

  // Match HTML video/source: <video src="url"> or <source src="url">
  const htmlVideos = readme.matchAll(/<(?:video|source)[^>]+src=["']([^"']+)["']/gi);
  for (const m of htmlVideos) {
    urls.push(resolveGitHubUrl(m[1], owner, repo));
  }

  // Deduplicate and filter to actual media
  const seen = new Set<string>();
  return urls.filter((u) => {
    if (seen.has(u)) return false;
    seen.add(u);
    // Keep only real image/video URLs (not badges/shields)
    const lower = u.toLowerCase();
    if (lower.includes("shields.io") || lower.includes("badge") || lower.includes("img.shields")) return false;
    if (lower.includes("github.com") && lower.includes("/workflows/")) return false;
    return /\.(png|jpg|jpeg|gif|webp|svg|mp4|webm|mov)(\?|$)/i.test(lower) ||
      lower.includes("user-images.githubusercontent.com") ||
      lower.includes("raw.githubusercontent.com");
  }).slice(0, 6); // Max 6 media items
}

function resolveGitHubUrl(url: string, owner: string, repo: string): string {
  if (url.startsWith("http")) return url;
  // Relative path → raw.githubusercontent.com
  const cleanPath = url.replace(/^\.\//, "").replace(/^\//,"");
  return `https://raw.githubusercontent.com/${owner}/${repo}/main/${cleanPath}`;
}

// ─── AI Slide Generation (Lovable AI) ──────────────────────────────────────────

interface StatItem {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
}

interface SlideData {
  title: string;
  content: string;
  visualDescription: string;
  voiceScript: string;
  type: string;
  mermaidDiagram?: string;
  stats?: StatItem[];
}

async function generateSlides(
  repoData: RepoData,
  mode: string,
  language: string = "en"
): Promise<SlideData[]> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

  const languageGuide: Record<string, string> = {
    en: "Write ALL slide content and voice scripts in English.",
    fr: "Write ALL slide content and voice scripts in French (français). Titles, content, and voiceScript MUST be in French. Use natural, idiomatic French.",
    de: "Write ALL slide content and voice scripts in German (Deutsch). Titles, content, and voiceScript MUST be in German. Use natural, idiomatic German.",
  };

  const toneGuide =
    mode === "developer"
      ? "Use a technical, precise tone. Focus on architecture, code patterns, and engineering decisions. Include specific technical details, performance characteristics, and implementation insights."
      : "Use an engaging, storytelling tone. Focus on the problem being solved, the impact, and why developers should care. Make it exciting and accessible. Use metaphors and analogies.";

  const mediaContext = repoData.mediaUrls.length > 0
    ? `\n\nThe repository contains these media files (screenshots, demos, diagrams) from the README:\n${repoData.mediaUrls.map((u, i) => `${i + 1}. ${u}`).join("\n")}\n\nFor each slide, you can assign relevant media URLs in the "repoMediaUrls" field. IMPORTANT RULES:\n- Only assign a media URL to a slide if it is genuinely relevant to that slide's topic (e.g. a screenshot of the UI for a features slide, an architecture diagram for the architecture slide).\n- Do NOT repeat the same media URL across multiple slides.\n- Do NOT assign media if you cannot reasonably infer what the image shows from its URL/filename.\n- It's better to assign NO media than to assign irrelevant media.\n- Maximum 2 media URLs per slide.`
    : "";

  const systemPrompt = `You are a world-class documentary narrator and storytelling expert. You transform dry technical repositories into compelling cinematic narratives. Think Ken Burns meets Silicon Valley. Every repository has a hero's journey - find it and tell it. Use dramatic pauses, compelling statistics, and emotional hooks. Never use boring bullet points - use narrative flow.

${languageGuide[language] || languageGuide.en}

${toneGuide}

Generate exactly 6 slides for a GitHub repository presentation.

The 6 slides MUST follow this structure:
1. Hook - A compelling problem statement or attention-grabbing stat (type: "hook")
2. Overview - What the project does in simple, clear terms (type: "overview")
3. Architecture - How it works technically, include a mermaid diagram (type: "architecture")
4. Key Features / Data Insights - Standout capabilities. For data science / ML projects, use type "data" and provide chartConfig with real metrics. For other projects, use type "features".
5. Code Walkthrough / Algorithm - A practical usage snippet. For algorithm-heavy projects, use type "algorithm" and provide codeAnimation with step-by-step highlighting AND optionally a dataStructureAnimation. For other projects, use type "code".
6. Impact - Adoption stats, community, and call-to-action (type: "impact")

For each slide, provide:
- title: Slide headline (max 8 words)
- content: Markdown body (2-4 paragraphs, use bullet points, bold, code spans)
- visualDescription: A vivid scene description for AI image generation (for a dark-themed tech illustration)
- voiceScript: MANDATORY narration script (30-50 words, conversational, professional). EVERY slide MUST have a voiceScript — this is critical for continuous audio narration.
- type: One of "hook", "overview", "architecture", "features", "code", "impact", "data", "algorithm"
- mermaidDiagram: ONLY for the architecture slide, provide a valid Mermaid flowchart diagram string. For other slides, omit this field.
- stats: For slides that mention numbers (stars, downloads, forks, performance metrics, adoption figures, percentages), provide an array of stat objects with {label, value, suffix?, prefix?}. Omit for slides without meaningful numbers.
- chartConfig: For "data" type slides ONLY. Provide chart visualization data:
  {type: "bar"|"line"|"pie"|"radar"|"area", title: "Chart Title", data: [{name: "Label", value: 42}, ...], series: ["value"], xAxisLabel?: "X", yAxisLabel?: "Y"}
  Use REAL data from the README: benchmarks, performance comparisons, language distributions, accuracy metrics, etc.
- codeAnimation: For "algorithm" type slides ONLY. Step-by-step code walkthrough:
  {code: "function example() {\\n  ...\\n}", language: "python", steps: [{lines: [1,2], explanation: "Initialize the variables"}, {lines: [3,4,5], explanation: "Process the data"}, ...]}
  Use actual code patterns from the repository. 4-8 steps maximum.
- dataStructureAnimation: For "algorithm" type slides, optionally add a data structure visualization:
  {type: "array"|"tree"|"graph"|"stack"|"queue"|"linked-list", steps: [{nodes: [{id: "1", label: "5", highlight: true}, ...], edges: [{from: "1", to: "2"}], caption: "Step description"}, ...]}
  3-6 steps maximum. Use this to visualize how the algorithm transforms data.

IMPORTANT for voiceScript: EVERY slide MUST have a voiceScript. No exceptions. This powers the continuous narration engine.

IMPORTANT for stats: Extract real numbers from the repository data. Use stars, forks, issues, download counts, performance benchmarks mentioned in the README. Make numbers impactful and visual.

IMPORTANT for chartConfig: Only use for data-heavy repos (ML, data science, benchmarks). Extract REAL metrics from the README. Don't invent numbers.

IMPORTANT for codeAnimation: Show the CORE algorithm or usage pattern. Keep code under 20 lines. Each step should highlight 1-3 lines with a clear explanation.

IMPORTANT for mermaidDiagram: Use simple graph TD syntax. Keep it clean. Example:
graph TD
  A[Input] --> B[Process]
  B --> C[Output]`;

  const userPrompt = `Create a presentation for this GitHub repository:

Repository: ${repoData.fullName}
Description: ${repoData.description}
Main Language: ${repoData.language}
Stars: ${repoData.stars} | Forks: ${repoData.forks} | Issues: ${repoData.openIssues}
License: ${repoData.license}
Topics: ${repoData.topics.join(", ") || "None"}
Languages: ${Object.entries(repoData.languages).map(([l, b]) => `${l}: ${b}`).join(", ")}
${mediaContext}
README (first 3000 chars):
${repoData.readme}`;

  console.log("Calling Lovable AI for slide generation...");

  // Retry logic for transient AI errors
  let lastAiError: Error | null = null;
  for (let aiAttempt = 0; aiAttempt < 3; aiAttempt++) {
    if (aiAttempt > 0) {
      console.log(`AI retry attempt ${aiAttempt}...`);
      await new Promise((r) => setTimeout(r, 2000 * aiAttempt));
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "create_presentation",
                description: "Create a 6-slide presentation from repository data",
                parameters: {
                  type: "object",
                  properties: {
                    slides: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          title: { type: "string" },
                          content: { type: "string" },
                          visualDescription: { type: "string" },
                          voiceScript: { type: "string" },
                          type: {
                            type: "string",
                            enum: [
                              "hook",
                              "overview",
                              "architecture",
                              "features",
                              "code",
                              "impact",
                              "data",
                              "algorithm",
                            ],
                          },
                          mermaidDiagram: { type: "string" },
                          stats: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                label: { type: "string" },
                                value: { type: "number" },
                                suffix: { type: "string" },
                                prefix: { type: "string" },
                              },
                              required: ["label", "value"],
                            },
                          },
                          repoMediaUrls: {
                            type: "array",
                            description: "Relevant media URLs from the repository. Only include genuinely relevant URLs. Max 2.",
                            items: { type: "string" },
                          },
                          chartConfig: {
                            type: "object",
                            description: "Chart visualization for data/metrics slides. Use real data from the repo.",
                            properties: {
                              type: { type: "string", enum: ["bar", "line", "pie", "radar", "area"] },
                              title: { type: "string" },
                              data: {
                                type: "array",
                                items: {
                                  type: "object",
                                  properties: {
                                    name: { type: "string" },
                                    value: { type: "number" },
                                  },
                                  required: ["name", "value"],
                                },
                              },
                              series: { type: "array", items: { type: "string" } },
                              xAxisLabel: { type: "string" },
                              yAxisLabel: { type: "string" },
                            },
                            required: ["type", "title", "data"],
                          },
                          codeAnimation: {
                            type: "object",
                            description: "Step-by-step code walkthrough animation for algorithm slides.",
                            properties: {
                              code: { type: "string" },
                              language: { type: "string" },
                              steps: {
                                type: "array",
                                items: {
                                  type: "object",
                                  properties: {
                                    lines: { type: "array", items: { type: "number" } },
                                    explanation: { type: "string" },
                                  },
                                  required: ["lines", "explanation"],
                                },
                              },
                            },
                            required: ["code", "language", "steps"],
                          },
                          dataStructureAnimation: {
                            type: "object",
                            description: "Data structure visualization with step-by-step state changes.",
                            properties: {
                              type: { type: "string", enum: ["array", "tree", "graph", "stack", "queue", "linked-list"] },
                              steps: {
                                type: "array",
                                items: {
                                  type: "object",
                                  properties: {
                                    nodes: {
                                      type: "array",
                                      items: {
                                        type: "object",
                                        properties: {
                                          id: { type: "string" },
                                          label: { type: "string" },
                                          highlight: { type: "boolean" },
                                        },
                                        required: ["id", "label"],
                                      },
                                    },
                                    edges: {
                                      type: "array",
                                      items: {
                                        type: "object",
                                        properties: {
                                          from: { type: "string" },
                                          to: { type: "string" },
                                          label: { type: "string" },
                                        },
                                        required: ["from", "to"],
                                      },
                                    },
                                    caption: { type: "string" },
                                  },
                                  required: ["nodes", "caption"],
                                },
                              },
                            },
                            required: ["type", "steps"],
                          },
                        },
                        required: [
                          "title",
                          "content",
                          "visualDescription",
                          "voiceScript",
                          "type",
                        ],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["slides"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "create_presentation" },
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Lovable AI error (attempt ${aiAttempt + 1}):`, response.status, errText);
      if (response.status === 429) {
        throw new Error("AI rate limit exceeded. Please try again in a moment.");
      }
      if (response.status === 402) {
        throw new Error("AI credits exhausted. Please add credits to continue.");
      }
      lastAiError = new Error(`AI generation failed: ${response.status}`);
      continue;
    }

    const data = await response.json();
    console.log("AI response received");

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error(`No tool call in AI response (attempt ${aiAttempt + 1}):`, JSON.stringify(data).substring(0, 500));
      lastAiError = new Error("AI did not return structured slide data");
      continue;
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    console.log(`Generated ${parsed.slides.length} slides`);
    return parsed.slides;
  }

  throw lastAiError || new Error("AI generation failed after 3 attempts");
}

// ─── fal.ai Image Generation ──────────────────────────────────────────────────

async function generateImage(prompt: string): Promise<string> {
  const FAL_API_KEY = Deno.env.get("FAL_API_KEY");
  if (!FAL_API_KEY) throw new Error("FAL_API_KEY is not configured");

  const enhancedPrompt = `${prompt}. Style: modern minimalist tech illustration, dark background with deep blues and purples, vibrant cyan and magenta accents, clean geometric shapes, abstract data visualization elements, high contrast, professional, ultra high quality`;

  console.log("Generating image with fal.ai...");

  const response = await fetch("https://fal.run/fal-ai/flux/dev", {
    method: "POST",
    headers: {
      Authorization: `Key ${FAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: enhancedPrompt,
      image_size: "landscape_16_9",
      num_images: 1,
      enable_safety_checker: false,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("fal.ai error:", response.status, errText);
    throw new Error(`Image generation failed: ${response.status}`);
  }

  const data = await response.json();
  const imageUrl = data.images?.[0]?.url;
  if (!imageUrl) {
    console.error("No image URL in fal.ai response:", JSON.stringify(data));
    throw new Error("No image returned from fal.ai");
  }

  console.log("Image generated successfully");
  return imageUrl;
}

// (Avatar video generation removed — replaced by client-side Ken Burns animations)

// ─── Gradium Audio Generation — Sequential to respect 2-connection limit ─────

async function generateAudioWithRetry(
  text: string,
  language: string = "en",
  maxRetries: number = 3
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`  Audio retry attempt ${attempt}...`);
        await new Promise((r) => setTimeout(r, 1500 * attempt)); // Longer backoff
      }
      return await generateAudio(text, language);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`  Audio attempt ${attempt + 1} failed: ${lastError.message}`);
    }
  }

  throw lastError || new Error("Audio generation failed after retries");
}

// Generate all audio SEQUENTIALLY to avoid Gradium's 2-connection WebSocket limit
async function generateAllAudioSequentially(
  slides: SlideData[],
  language: string
): Promise<string[]> {
  const results: string[] = [];
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    console.log(`  Audio ${i + 1}/${slides.length}: ${slide.voiceScript.substring(0, 50)}...`);
    try {
      const audioUrl = await generateAudioWithRetry(slide.voiceScript, language);
      results.push(audioUrl);
    } catch (err) {
      console.error(`Audio ${i + 1} FAILED after all retries:`, (err as Error).message);
      results.push(""); // Last resort fallback
    }
  }
  return results;
}

async function generateAudio(text: string, language: string = "en"): Promise<string> {
  const GRADIUM_API_KEY = Deno.env.get("GRADIUM_API_KEY");
  if (!GRADIUM_API_KEY) throw new Error("GRADIUM_API_KEY is not configured");

  // Cinematic narrator voices per language
  const voiceMap: Record<string, string> = {
    en: "MZWrEHL2Fe_uc2Rv",  // James — warm, resonant, storytelling
    fr: "axlOaUiFyOZhy4nv",  // Leo — warm, smooth French narrator
    de: "0y1VZjPabOBU3rWy",  // Maximilian — warm, professional German
  };

  const voiceId = voiceMap[language] || voiceMap.en;
  console.log(`Generating audio with Gradium (lang: ${language}, voice: ${voiceId})...`);

  const response = await fetch(
    "https://eu.api.gradium.ai/api/post/speech/tts",
    {
      method: "POST",
      headers: {
        "x-api-key": GRADIUM_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        voice_id: voiceId,
        output_format: "opus",
        only_audio: true,
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    console.error("Gradium error:", response.status, errText);
    throw new Error(`Audio generation failed: ${response.status}`);
  }

  const audioBuffer = await response.arrayBuffer();
  const base64 = base64Encode(new Uint8Array(audioBuffer));
  console.log(`Audio generated: ${audioBuffer.byteLength} bytes`);

  return `data:audio/ogg;base64,${base64}`;
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { githubUrl, mode, language } = await req.json();

    if (!githubUrl) {
      return new Response(
        JSON.stringify({ error: "githubUrl is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`=== Starting presentation generation ===`);
    console.log(`URL: ${githubUrl}, Mode: ${mode}, Language: ${language || "en"}`);

    // Step 1: Fetch GitHub data (includes media extraction)
    console.log("Step 1: Fetching GitHub data...");
    const repoData = await fetchGitHubData(githubUrl);
    console.log(`Repo: ${repoData.fullName} (${repoData.stars}⭐, ${repoData.mediaUrls.length} media)`);

    // Step 2: Generate slides with AI
    console.log("Step 2: Generating slides with AI...");
    const slides = await generateSlides(repoData, mode || "developer", language || "en");

    // Step 3: Generate images and audio in parallel
    // Skip Fal AI images for slides that already have rich visualizations
    console.log("Step 3: Generating images and audio...");

    const imagePromises = slides.map((slide: any, i: number) => {
      const hasRichViz = !!(
        slide.mermaidDiagram ||
        slide.chartConfig ||
        slide.codeAnimation ||
        slide.dataStructureAnimation ||
        (slide.repoMediaUrls && slide.repoMediaUrls.length > 0)
      );

      if (hasRichViz) {
        console.log(`  Image ${i + 1}: SKIPPED (has rich visualization)`);
        return Promise.resolve("");
      }

      console.log(`  Image ${i + 1}: ${slide.visualDescription.substring(0, 50)}...`);
      return generateImage(slide.visualDescription).catch((err) => {
        console.error(`Image ${i + 1} failed:`, err.message);
        return "";
      });
    });

    // Audio SEQUENTIALLY + Images in parallel
    console.log("Step 3b: Generating audio + images...");

    const [audios, images] = await Promise.all([
      generateAllAudioSequentially(slides, language || "en"),
      Promise.all(imagePromises),
    ]);

    // Log audio coverage
    const audioCount = audios.filter(Boolean).length;
    console.log(`Audio coverage: ${audioCount}/${slides.length} slides`);

    // Step 4: Assemble presentation
    console.log("Step 4: Assembling presentation...");
    const presentation = {
      repoInfo: {
        name: repoData.name,
        fullName: repoData.fullName,
        description: repoData.description,
        stars: repoData.stars,
        forks: repoData.forks,
        language: repoData.language,
        topics: repoData.topics,
      },
      slides: slides.map((slide: SlideData, i: number) => {
        // Use AI-assigned media URLs (deduplicated), fallback to empty
        const aiMedia = (slide as any).repoMediaUrls as string[] | undefined;
        const validMedia = aiMedia
          ? aiMedia.filter((u: string) => repoData.mediaUrls.includes(u)).slice(0, 2)
          : [];
        
        return {
          ...slide,
          imageUrl: images[i] || "",
          audioUrl: audios[i] || "",
          repoMediaUrls: validMedia,
        };
      }),
    };

    console.log("=== Presentation generation complete ===");

    return new Response(JSON.stringify(presentation), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Generation error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    const status =
      message.includes("rate limit") ? 429 :
      message.includes("credits") ? 402 :
      500;

    return new Response(
      JSON.stringify({ error: message }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

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
  };
}

// ─── AI Slide Generation (Lovable AI) ──────────────────────────────────────────

interface SlideData {
  title: string;
  content: string;
  visualDescription: string;
  voiceScript: string;
  type: string;
  mermaidDiagram?: string;
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

  const systemPrompt = `You are a world-class documentary narrator and storytelling expert. You transform dry technical repositories into compelling cinematic narratives. Think Ken Burns meets Silicon Valley. Every repository has a hero's journey - find it and tell it. Use dramatic pauses, compelling statistics, and emotional hooks. Never use boring bullet points - use narrative flow.

${languageGuide[language] || languageGuide.en}

${toneGuide}

Generate exactly 6 slides for a GitHub repository presentation.

The 6 slides MUST follow this structure:
1. Hook - A compelling problem statement or attention-grabbing stat
2. Overview - What the project does in simple, clear terms
3. Architecture - How it works technically (include a mermaid diagram)
4. Key Features - 3-4 standout capabilities  
5. Code Example - A practical usage snippet
6. Impact - Adoption stats, community, and call-to-action

For each slide, provide:
- title: Slide headline (max 8 words)
- content: Markdown body (2-4 paragraphs, use bullet points, bold, code spans)
- visualDescription: A vivid scene description for AI image generation (for a dark-themed tech illustration)
- voiceScript: Narration script (30-50 words, conversational, professional)
- type: One of "hook", "overview", "architecture", "features", "code", "impact"
- mermaidDiagram: ONLY for the architecture slide, provide a valid Mermaid flowchart diagram string. For other slides, omit this field.

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

README (first 3000 chars):
${repoData.readme}`;

  console.log("Calling Lovable AI for slide generation...");

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
                          ],
                        },
                        mermaidDiagram: { type: "string" },
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
    console.error("Lovable AI error:", response.status, errText);
    if (response.status === 429) {
      throw new Error("AI rate limit exceeded. Please try again in a moment.");
    }
    if (response.status === 402) {
      throw new Error("AI credits exhausted. Please add credits to continue.");
    }
    throw new Error(`AI generation failed: ${response.status}`);
  }

  const data = await response.json();
  console.log("AI response received");

  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) {
    console.error("No tool call in AI response:", JSON.stringify(data));
    throw new Error("AI did not return structured slide data");
  }

  const parsed = JSON.parse(toolCall.function.arguments);
  console.log(`Generated ${parsed.slides.length} slides`);
  return parsed.slides;
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

// ─── Gradium Audio Generation ─────────────────────────────────────────────────

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
        output_format: "wav",
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

  return `data:audio/wav;base64,${base64}`;
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

    // Step 1: Fetch GitHub data
    console.log("Step 1: Fetching GitHub data...");
    const repoData = await fetchGitHubData(githubUrl);
    console.log(`Repo: ${repoData.fullName} (${repoData.stars}⭐)`);

    // Step 2: Generate slides with AI
    console.log("Step 2: Generating slides with AI...");
    const slides = await generateSlides(repoData, mode || "developer", language || "en");

    // Step 3: Generate images and audio in parallel
    console.log("Step 3: Generating images and audio in parallel...");

    const imagePromises = slides.map((slide, i) => {
      console.log(`  Image ${i + 1}: ${slide.visualDescription.substring(0, 50)}...`);
      return generateImage(slide.visualDescription).catch((err) => {
        console.error(`Image ${i + 1} failed:`, err.message);
        return ""; // Return empty string on failure
      });
    });

    const audioPromises = slides.map((slide, i) => {
      console.log(`  Audio ${i + 1}: ${slide.voiceScript.substring(0, 50)}...`);
      return generateAudio(slide.voiceScript, language || "en").catch((err) => {
        console.error(`Audio ${i + 1} failed:`, err.message);
        return ""; // Return empty string on failure
      });
    });

    const [images, audios] = await Promise.all([
      Promise.all(imagePromises),
      Promise.all(audioPromises),
    ]);

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
      slides: slides.map((slide, i) => ({
        ...slide,
        imageUrl: images[i] || "",
        audioUrl: audios[i] || "",
      })),
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

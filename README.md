# 🎬 CodeTale

Transform GitHub repositories into cinematic stories, interactive slides, and data‑driven visualizations — powered by AI.

<img src="https://img.shields.io/badge/license-All%20Rights%20Reserved-red" alt="All Rights Reserved" />
<img src="https://img.shields.io/badge/Built%20with-Lovable-purple" alt="Built with Lovable" />

[📄 View Presentation Slides](slides/CodeTalePresentation.pdf)

**Status:** Hackathon prototype for {Tech: Europe} Paris 2026.

## 🌟 The Problem
Developers struggle to:

- Create engaging demos of their projects.
- Present technical concepts visually.
- Explain complex algorithms and data flows.
- Spend hours on content creation instead of coding.

CodeTale turns repos into presentations in minutes, not hours.

## ✨ What’s Implemented
This repository contains a working front‑end and a Supabase Edge Function that:

- Accepts a GitHub repo URL and fetches metadata, README, and language stats.
- Generates a 6‑slide narrative using Open AI GPT 5.2 (via the Lovable gateway).
- Builds visuals with Mermaid diagrams, charts, code animations, and data‑structure steps when appropriate.
- Synthesizes narration audio with Gradium TTS.
- Generates slide artwork with fal.ai when no rich visualization is available.
- Returns a ready‑to‑play presentation to the UI.

## 🎬 Features
- **Cinema Mode**: autoplay slides with continuous narration and cinematic transitions.
- **Slide Mode**: manual navigation with audio per slide.
- **Repo‑aware narration**: 6‑slide story arc (hook, overview, architecture, features, code/algorithm, impact).
- **Mermaid diagrams**: architecture flowcharts generated per repo.
- **Charts and metrics**: charts when real data exists in the README or GitHub stats.
- **Code walkthroughs**: step‑by‑step animations for algorithms and key logic.
- **Media extraction**: uses README images/screenshots when relevant.
- **Export**: download a standalone HTML presentation.
- **Language support**: English, French, German.

## 🎥 Demo Gallery
These examples are wired into the UI for one‑click generation.

| Project | Type | Description |
| --- | --- | --- |
| MS-DOS | Cinema / Slides | Origins, architecture, historical impact |
| Apollo 11 | Cinema / Slides | AGC computer, mission‑critical code |
| Sorting Algorithms | Slides + Animations | Bubble, merge, quick — animated step by step |

## 🏗️ Architecture
```
┌──────────────┐
│   Frontend   │  Vite + React + TS
└──────┬───────┘
       │
       ├──→ Supabase Edge Function
       │    ├─ GitHub API (repo + README)
       │    ├─ Open AI GPT 5.2 via Lovable AI (slide generation)
       │    ├─ Mermaid (diagrams)
       │    ├─ Gradium TTS (narration)
       │    └─ fal.ai (slide imagery)
       │
       └──→ Presentation Viewer
            ├─ Cinema Mode (autoplay)
            └─ Slide Mode (manual)
```

## 🧰 Tech Stack
| Category | Technology |
| --- | --- |
| Frontend | Vite, React, TypeScript |
| UI | Tailwind CSS, shadcn/ui, Radix UI |
| Animation | Framer Motion |
| Data | Recharts, Mermaid |
| Backend | Supabase Edge Functions (Deno) |
| AI | Lovable AI gateway (OpenAI‑compatible) |
| Voice | Gradium TTS |
| Images | fal.ai |

## 🚀 Quickstart
1. Install dependencies.

```sh
npm install
```

2. Configure environment variables for the frontend.

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

3. Run the dev server.

```sh
npm run dev
```

4. Deploy the Supabase Edge Function.

- `supabase/functions/generate-presentation` expects:
- `LOVABLE_API_KEY`
- `FAL_API_KEY`
- `GRADIUM_API_KEY`

## 🔄 Roadmap
| Phase | Feature | Status |
| --- | --- | --- |
| MVP | Cinema + Slides generation | ✅ Done |
| Next | Dify multi‑agent orchestration | 🔜 Planned |
| Next | Alpic Skybridge conversational interface | 🔜 Planned |
| Future | Dust — private multi‑repository analysis for enterprises | 💡 Exploring |

## 🙏 Acknowledgments
- Lovable — full‑stack development platform.
- OpenAI — model family used via the Lovable gateway.
- OpenAI Codex — development companion.
- fal.ai — image generation.
- Gradium — narration TTS.

## 👤 Author
Wilfred Doré

<div align="center">
</div>

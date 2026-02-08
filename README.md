# 🎬 CodeTale

Transform GitHub repositories into cinematic stories, interactive slides, and data‑driven visualizations — powered by AI.

<img src="https://img.shields.io/badge/license-All%20Rights%20Reserved-red" alt="All Rights Reserved" />
<img src="https://img.shields.io/badge/Built%20with-Lovable-purple" alt="Built with Lovable" />

[📄 View presentation slides](slides/CodeTalePresentation.pdf)
[📹 Watch Deep Dive Video](demo_videos/AlpicSkybridgeDemo.mp4)

**Status:** Hackathon prototype for {Tech: Europe} Paris 2026.

## 🌟 The Problem
Developers struggle to:

- Create engaging demos of their projects.
- Present technical concepts visually.
- Explain complex algorithms and data flows.
- Spend hours on content creation instead of coding.

CodeTale turns repos into presentations in minutes, not hours.

## ✨ What's Implemented
This repository contains a working front‑end and backend pipeline that:

- Accepts a GitHub repo URL and fetches metadata, README, language stats, and **file tree**.
- Runs a **deep multi‑step repository analysis** (architecture, patterns, complexity, audience insights) before generating slides.
- Fetches **DeepWiki** (deepwiki.com) AI‑analyzed documentation for deeper architectural context.
- **Discovers and classifies repository images** (screenshots, diagrams, architecture visuals) from README and asset folders, prioritizing technical images.
- Generates a 6‑slide narrative using OpenAI GPT‑5.2 (via the Lovable AI gateway) with a 3‑level provider cascade for reliability.
- Builds rich visualizations: **Mermaid UML diagrams** (flowcharts, class diagrams, sequence diagrams, state diagrams), **animated charts**, **step‑by‑step code animations**, and **data structure visualizations**.
- Synthesizes localized narration audio with Gradium TTS (English, French, German).
- Generates minimalist slide artwork with fal.ai (flux/dev) only when no rich visualization is available.
- Returns a ready‑to‑play presentation to the UI.

## 🎬 Features

### Viewing Modes
- **Cinema Mode** 🎬 *(recommended)*: Autoplay slides with continuous narration, cinematic crossfade transitions, auto‑scrolling content, and Netflix‑style overlay controls. Fully hands‑free experience.
- **Slide Mode** 📊: Manual navigation with on‑demand audio per slide. Arrow keys, click, or dot indicators to advance.
- **Analysis Tab** 🔬: Full technical analysis dashboard accessible from the top bar — architecture breakdown, complexity scores, pattern detection, audience‑specific insights (developer, manager, investor), and discovered repository images.

### Smart Repository Analysis
- **Adaptive file budgeting**: Small repos (<30 files): all scanned. Medium (30–100): top 25. Large (>100): top 20.
- **6‑tier file prioritization**: Identity → Config → Entry Points → Keywords → Shallow Source → Deep Source.
- **Smart truncation**: Files >300 lines keep first 100 + last 50 lines for optimal LLM context.
- **Image discovery**: Extracts images from README markdown (`![](url)`, `<img>` tags) and asset folders (`docs/`, `assets/`, `.github/`). Classifies images as `likely_technical` using keyword matching (architecture, diagram, flow, schema…).
- **DeepWiki integration**: Fetches AI‑analyzed documentation from deepwiki.com for richer architectural context.

### Presentation Engine
- **6‑slide story arc**: Hook → Overview → Architecture → Features/Data → Code/Algorithm → Impact.
- **Publication‑quality Mermaid diagrams**: C4‑style subgraphs, sequence diagrams, class diagrams, state diagrams. Diagrams can appear on **multiple slides**, not just architecture. Click‑to‑zoom fullscreen modal.
- **Animated charts** (Recharts): Bar, Line, Area, Pie, Radar — animated with real repository metrics.
- **Code stepper**: Progressive line‑by‑line highlighting synced to narration. **Mandatory** on every presentation — shows the core algorithm, interrupt handler, API pattern, or signature code of the repo.
- **Data structure visualizations**: Animated SVG for Arrays, Trees, Graphs, Stacks, Queues, and Linked Lists with automatic layout.
- **Ken Burns effect**: Animated zoom/pan on images for dynamic visuals without server‑side video generation.
- **Repo media integration**: Screenshots, demos, and diagrams from the repository README are used as native slide visuals, prioritized over AI‑generated illustrations.
- **Smart media hierarchy**: Technical content (repo media, Mermaid, charts, animations) displayed prominently; AI illustrations shown as subtle thumbnails when rich data is present.

### Navigation & UX
- **Mode selection screen**: Cinema (recommended) and Slides cards after generation. Analysis accessible via top bar tabs.
- **Tab order**: Analysis → Slides → Cinema in the top navigation bar.
- **Fullscreen**: Native Fullscreen API with `F` keyboard shortcut.
- **Auto‑hiding controls**: Overlay controls fade in Cinema Mode after 3 seconds of inactivity.
- **Export**: Download a standalone HTML presentation file.
- **Language support**: English 🇬🇧, French 🇫🇷, German 🇩🇪.

### Stability & Reliability
- **3‑level AI provider cascade**: Lovable AI (GPT‑5.2) → OpenAI Direct (GPT‑4.1) → OpenAI Mini (GPT‑4.1‑mini). Automatic failover on 402/429 errors.
- **Mermaid rendering stability**: Automated syntax sanitization (quoting labels with parentheses), offscreen rendering to suppress error SVGs.
- **Concurrency guards**: `isGeneratingRef`, `isTransitioningRef`, 2‑minute safety timeout, `generationIdRef` to prevent state corruption.
- **Diagram zoom**: Click any Mermaid diagram to open a fullscreen zoomable modal. Escape or backdrop click to close.

### Public API
- **Endpoint**: `POST /functions/v1/analyze-repo` — public repository analysis API.
- **Options**: Configurable `max_files`, `target_audience`. Per‑IP rate limit: 10 req/min.
- **Documentation**: `/api-docs` page with integration examples for cURL, JavaScript, and Python.

## 🎥 Demo Gallery
These examples are wired into the UI for one‑click generation.

| Project | Type | Description |
| --- | --- | --- |
| MS-DOS | Cinema / Slides | Origins, architecture, INT 21h interrupt handler animation |
| Apollo 11 | Cinema / Slides | AGC computer, mission‑critical code walkthrough |
| Sorting Algorithms | Slides + Animations | Bubble, merge, quick — animated step by step with data structures |
| Alpic Skybridge | Video Demo | Conversational interface showcase [Watch Video](demo_videos/AlpicSkybridgeDemo.mp4) |

## 🏗️ Architecture
```
┌──────────────────┐
│     Frontend     │  Vite + React + TypeScript + Framer Motion
└────────┬─────────┘
         │
         ├──→ analyze-repo (Edge Function)
         │    ├─ GitHub API (repo tree, README, languages)
         │    ├─ DeepWiki (AI documentation)
         │    ├─ Image Discovery & Classification
         │    └─ Lovable AI / OpenAI (deep analysis)
         │
         ├──→ generate-presentation (Edge Function)
         │    ├─ Lovable AI GPT-5.2 (slide generation)
         │    │   └─ 3-level provider cascade
         │    ├─ Mermaid (UML diagrams)
         │    ├─ Gradium TTS (narration)
         │    └─ fal.ai (slide imagery fallback)
         │
         └──→ Presentation Viewer
              ├─ Analysis Tab (technical dashboard)
              ├─ Slide Mode (manual navigation)
              └─ Cinema Mode (autoplay + narration)
```

## 🧰 Tech Stack
| Category | Technology |
| --- | --- |
| Frontend | Vite, React, TypeScript |
| UI | Tailwind CSS, shadcn/ui, Radix UI |
| Animation | Framer Motion |
| Charts | Recharts |
| Diagrams | Mermaid (flowchart, sequence, class, state) |
| Backend | Supabase Edge Functions (Deno) |
| AI Models | Lovable AI gateway — GPT‑5.2, GPT‑4.1, GPT‑4.1‑mini |
| Voice | Gradium TTS (multilingual) |
| Images | fal.ai (flux/dev) |
| Analysis | DeepWiki (deepwiki.com) |


## 💬 Conversational Interface (Skybridge)

CodeTale includes a **Skybridge App** that lets you analyze repositories and generate presentations directly within **ChatGPT**.

### Features 
- **Analyze Repo**: Get a structured summary of any GitHub repository.
- **Explain Architecture**: View architecture diagrams rendered in chat.
- **Compare Repos**: Side-by-side comparison of two repositories.
- **Generate Pitch Deck**: Create a slide deck from a repo URL.

### How to Run
1. Navigate to the app directory:
   ```bash
   cd skybridge-app-ui
   npm install
   npm run dev
   ```
2. Expose local server with ngrok:
   ```bash
   ngrok http 3000
   ```
3. Configure in ChatGPT as an MCP Server or GPT Action.

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

4. Edge Functions expect the following secrets:

| Secret | Purpose |
| --- | --- |
| `LOVABLE_API_KEY` | AI slide generation (primary) |
| `OPENAI_API_KEY` | AI fallback provider |
| `FAL_API_KEY` | Image generation |
| `GRADIUM_API_KEY` | TTS narration |
| `GITHUB_TOKEN` | Private repos & higher rate limits (5,000 req/hr) |

## 🔄 Roadmap
| Phase | Feature | Status |
| --- | --- | --- |
| MVP | Cinema + Slides generation | ✅ Done |
| MVP | Deep repository analysis engine | ✅ Done |
| MVP | Multi‑diagram UML support | ✅ Done |
| MVP | Code animation (mandatory) | ✅ Done |
| MVP | Image discovery & classification | ✅ Done |
| MVP | Diagram zoom modal | ✅ Done |
| MVP | Analysis tab in viewer | ✅ Done |
| MVP | Public analysis API | ✅ Done |
| Next | Dify multi‑agent orchestration | 🔜 Planned |
| Next | Alpic Skybridge conversational interface | 🔜 Planned |
| Future | Dust — private multi‑repository analysis for enterprises | 💡 Exploring |

## 🙏 Acknowledgments
- Lovable — full‑stack development platform.
- OpenAI — model family used via the Lovable gateway.
- OpenAI Codex — development companion.
- DeepWiki — AI‑analyzed documentation.
- fal.ai — image generation.
- Gradium — narration TTS.

## 👤 Author
Wilfred Doré

<div align="center">
</div>

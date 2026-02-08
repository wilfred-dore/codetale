# 🎬 CodeTale

**Transform GitHub repositories into cinematic stories, interactive slides, and data‑driven visualizations — powered by AI.**

<img src="https://img.shields.io/badge/license-All%20Rights%20Reserved-red" alt="All Rights Reserved" />
<img src="https://img.shields.io/badge/Built%20with-Lovable-purple" alt="Built with Lovable" />
<img src="https://img.shields.io/badge/AI-OpenAI%20GPT--5.2-green" alt="OpenAI" />
<img src="https://img.shields.io/badge/Images-fal.ai-blue" alt="fal.ai" />
<img src="https://img.shields.io/badge/Voice-Gradium-orange" alt="Gradium" />
<img src="https://img.shields.io/badge/ChatGPT%20App-Alpic%20Skybridge-teal" alt="Alpic Skybridge" />

[📄 View presentation slides](slides/CodeTalePresentation.pdf)
[📹 Watch Deep Dive Video](demo_videos/AlpicSkybridgeDemo.mp4)

> 🏆 **{Tech: Europe} Paris AI Hackathon 2026** — Built in 48 hours at NeonNoir, Paris.

---

## 🌟 The Problem

Developers struggle to:
- Create engaging demos of their projects
- Present technical concepts visually
- Explain complex algorithms and data flows
- Spend hours on content creation instead of coding

**CodeTale turns any GitHub repo into a cinematic presentation in minutes, not hours.**

---

## 🏗️ Partner Technologies Used

> **Hackathon requirement: minimum 3 partner technologies.** CodeTale uses **7**.

| # | Partner | Usage in CodeTale | Category |
|---|---------|-------------------|----------|
| 1 | **[Lovable](https://lovable.dev)** | Full‑stack development platform. Frontend, backend (Edge Functions), database, deployment — all built with Lovable. | Infrastructure |
| 2 | **[OpenAI](https://openai.com)** | GPT‑5.2 for slide generation & repository analysis. GPT‑4.1 / GPT‑4.1‑mini as fallback providers. Direct OpenAI API supported alongside Lovable AI gateway. | AI Models |
| 3 | **[fal.ai](https://fal.ai)** | flux/dev model for generating minimalist slide illustrations when no rich visualization (Mermaid, chart, code animation) is available. | Generative Media |
| 4 | **[Gradium](https://gradium.ai)** | Text‑to‑speech narration in 3 languages (English, French, German). Powers continuous Cinema Mode voiceover and per‑slide audio in Slide Mode. | Voice AI |
| 5 | **[Alpic Skybridge](https://alpic.ai)** | ChatGPT App integration — analyze repos, compare projects, generate pitch decks directly inside ChatGPT via MCP. | ChatGPT Apps |
| 6 | **[Dify](https://dify.ai)** | Multi‑agent orchestration planned for advanced analysis pipelines. | AI Agents |
| 7 | **[Dust](https://dust.tt)** | Private multi‑repository analysis for enterprise use cases (exploring). | AI Platform |

### Additional Technologies
| Technology | Role |
|------------|------|
| [DeepWiki](https://deepwiki.com) | AI‑analyzed documentation for deeper architectural context |
| [ZeroML/ZML](https://zml.ai) | High‑performance inference exploration |
| [Recharts](https://recharts.org) | Animated data visualizations |
| [Mermaid](https://mermaid.js.org) | UML diagrams (flowchart, sequence, class, state) |
| [Framer Motion](https://www.framer.com/motion) | UI animations and transitions |

---

## ✨ What's Implemented

### Core Pipeline
1. **Repository Analysis** — Deep multi‑step analysis engine:
   - Fetches repo metadata, README, file tree, and language stats from GitHub API
   - Fetches AI‑analyzed documentation from [DeepWiki](https://deepwiki.com)
   - Discovers and classifies images (screenshots, architecture diagrams) from README and asset folders
   - Adaptive file budgeting: Small <30 files → all; Medium 30–100 → top 25; Large >100 → top 20
   - 6‑tier file prioritization: Identity → Config → Entry Points → Keywords → Shallow → Deep
   - Smart truncation: Files >300 lines keep first 100 + last 50 lines

2. **Slide Generation** — 6‑slide cinematic narrative:
   - AI generates: Hook → Overview → Architecture → Features/Data → Code/Algorithm → Impact
   - Publication‑quality Mermaid UML diagrams (flowcharts, class, sequence, state diagrams)
   - Mandatory step‑by‑step code animations on every presentation
   - Animated charts with real repository metrics (Recharts)
   - Data structure visualizations (Arrays, Trees, Graphs, Stacks, Queues, Linked Lists)

3. **Media Production**:
   - Narration audio via Gradium TTS (English 🇬🇧, French 🇫🇷, German 🇩🇪)
   - AI illustrations via fal.ai (flux/dev) — only when no rich visualization exists
   - Ken Burns effect (zoom/pan) on images for dynamic visuals
   - Repository screenshots and diagrams used as native slide visuals

### AI Provider Cascade
CodeTale supports **both** the Lovable AI gateway and **direct OpenAI API** access with automatic failover:

```
Priority 1: Lovable AI Gateway → openai/gpt-5.2 (best model)
Priority 2: OpenAI Direct API  → gpt-4.1 (fallback)
Priority 3: OpenAI Direct API  → gpt-4.1-mini (cheapest fallback)
```

If one provider fails (rate limit, credits exhausted, auth error), the system automatically cascades to the next. This ensures **zero downtime** for slide generation.

---

## 🎬 Features

### Three Viewing Modes
| Mode | Description | Access |
|------|-------------|--------|
| 🎬 **Cinema** *(recommended)* | Autoplay with continuous narration, cinematic crossfade, auto‑scroll, Netflix‑style overlay controls. Fully hands‑free. | Mode selection screen + top bar |
| 📊 **Slides** | Manual navigation with on‑demand audio. Arrow keys, click, or dot indicators. | Mode selection screen + top bar |
| 🔬 **Analysis** | Full technical dashboard: architecture, complexity, patterns, audience insights, discovered repo images. | Top bar tab |

### Rich Visualizations
- **Mermaid UML diagrams** on multiple slides — click to zoom fullscreen
- **Animated charts** (Bar, Line, Area, Pie, Radar) with real data
- **Code stepper** — line‑by‑line highlighting synced to narration (mandatory on every presentation)
- **Data structure animations** — SVG visualizations with step‑by‑step state changes
- **Ken Burns effect** on images for cinematic feel
- **Smart media hierarchy** — technical content prioritized over AI illustrations

### Stability & Reliability
- 3‑level AI provider cascade with automatic failover
- Mermaid syntax sanitization + offscreen rendering
- Concurrency guards (`isGeneratingRef`, `isTransitioningRef`, 2‑min timeout)
- Per‑IP rate limiting on public API (10 req/min)

### Export & API
- **Download** standalone HTML presentation
- **Public API**: `POST /functions/v1/analyze-repo` with configurable `max_files`, `target_audience`
- **API docs**: `/api-docs` page with cURL, JavaScript, Python examples

---

## 💬 Conversational Interface (Alpic Skybridge)

CodeTale includes a **Skybridge ChatGPT App** that lets you interact with CodeTale directly inside **ChatGPT** via MCP.

### ChatGPT App Features
| Action | Description |
|--------|-------------|
| **Analyze Repo** | Structured summary of any GitHub repository |
| **Explain Architecture** | Architecture diagrams rendered in chat |
| **Compare Repos** | Side‑by‑side comparison of two repositories |
| **Generate Pitch Deck** | Slide deck from a repo URL |

### How to Run
```bash
cd skybridge-app-ui
npm install
npm run dev
```

Then expose with ngrok and configure in ChatGPT as a GPT Action or MCP Server:
```bash
ngrok http 3000
```

---

## 🎥 Demo Gallery

One‑click generation from the UI:

| Project | Type | Highlights |
|---------|------|------------|
| **MS-DOS** | Cinema / Slides | INT 21h interrupt handler animation, system architecture |
| **Apollo 11** | Cinema / Slides | AGC guidance computer, mission‑critical code walkthrough |
| **Sorting Algorithms** | Slides + Animations | Bubble, merge, quick sort — animated with data structures |
| **Alpic Skybridge** | Video Demo | [Watch Video](demo_videos/AlpicSkybridgeDemo.mp4) |

---

## 🏗️ Architecture

```
┌──────────────────────────┐
│        Frontend          │  Vite + React + TypeScript + Framer Motion
│  ┌────────────────────┐  │
│  │ Presentation Viewer│  │
│  │  ├─ Cinema Mode    │  │
│  │  ├─ Slide Mode     │  │
│  │  └─ Analysis Tab   │  │
│  └────────────────────┘  │
└───────────┬──────────────┘
            │
   ┌────────┴────────────────────────────────┐
   │                                         │
   ▼                                         ▼
┌─────────────────────┐    ┌──────────────────────────────┐
│  analyze-repo       │    │  generate-presentation       │
│  (Edge Function)    │    │  (Edge Function)             │
│                     │    │                              │
│  ├─ GitHub API      │    │  ├─ AI Cascade:              │
│  │  (tree, README)  │    │  │  1. Lovable AI (GPT-5.2) │
│  ├─ DeepWiki        │    │  │  2. OpenAI API (GPT-4.1) │
│  │  (AI docs)       │    │  │  3. OpenAI (GPT-4.1-mini)│
│  ├─ Image Discovery │    │  ├─ Mermaid UML diagrams    │
│  │  & Classification│    │  ├─ Gradium TTS (narration) │
│  └─ AI Analysis     │    │  └─ fal.ai (illustrations)  │
│     (Lovable/OpenAI)│    │                              │
└─────────────────────┘    └──────────────────────────────┘
```

---

## 🧰 Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | Vite, React, TypeScript |
| **UI** | Tailwind CSS, shadcn/ui, Radix UI |
| **Animation** | Framer Motion |
| **Charts** | Recharts |
| **Diagrams** | Mermaid (flowchart, sequence, class, state) |
| **Backend** | Supabase Edge Functions (Deno) via Lovable Cloud |
| **AI — Primary** | Lovable AI gateway → OpenAI GPT‑5.2 |
| **AI — Fallback** | OpenAI Direct API → GPT‑4.1 / GPT‑4.1‑mini |
| **Voice** | Gradium TTS (multilingual) |
| **Images** | fal.ai (flux/dev) |
| **Analysis** | DeepWiki (deepwiki.com) |
| **ChatGPT App** | Alpic Skybridge (MCP) |

---

## 🚀 Quickstart

### 1. Install dependencies
```sh
npm install
```

### 2. Configure frontend environment
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

### 3. Run the dev server
```sh
npm run dev
```

### 4. Edge Function secrets

| Secret | Required | Purpose |
|--------|----------|---------|
| `LOVABLE_API_KEY` | ✅ | AI slide generation (primary provider) |
| `OPENAI_API_KEY` | Optional | Direct OpenAI fallback (GPT‑4.1 / GPT‑4.1‑mini) |
| `FAL_API_KEY` | ✅ | Image generation (fal.ai flux/dev) |
| `GRADIUM_API_KEY` | ✅ | TTS narration (Gradium) |
| `GITHUB_TOKEN` | Optional | Private repos & higher rate limits (5,000 req/hr vs 60) |

---

## 🔄 Roadmap

| Phase | Feature | Status |
|-------|---------|--------|
| ✅ MVP | Cinema + Slides generation | Done |
| ✅ MVP | Deep repository analysis engine | Done |
| ✅ MVP | Multi‑diagram UML support (class, sequence, state) | Done |
| ✅ MVP | Mandatory code animations | Done |
| ✅ MVP | Image discovery & classification | Done |
| ✅ MVP | Diagram zoom modal | Done |
| ✅ MVP | Analysis tab in viewer | Done |
| ✅ MVP | Public analysis API | Done |
| ✅ MVP | 3‑level AI cascade (Lovable + OpenAI) | Done |
| ✅ MVP | Alpic Skybridge ChatGPT App | Done |
| 🔜 Next | Dify multi‑agent orchestration | Planned |
| 💡 Future | Dust — enterprise multi‑repo analysis | Exploring |
| 💡 Future | ZML high‑performance inference | Exploring |

---

## 📋 Hackathon Submission Checklist

- [x] Public GitHub repository with source code
- [x] Comprehensive README with setup instructions
- [x] Documentation of all APIs, frameworks, and tools
- [x] Uses 7 partner technologies (min. 3 required): Lovable, OpenAI, fal.ai, Gradium, Alpic, Dify, Dust
- [x] 2‑minute video demo: [Watch Video](demo_videos/AlpicSkybridgeDemo.mp4)
- [x] Live deployment via Lovable

---

## 🙏 Acknowledgments

### Featured Partners
- **[Lovable](https://lovable.dev)** — Full‑stack AI development platform
- **[OpenAI](https://openai.com)** — GPT‑5.2, GPT‑4.1, GPT‑4.1‑mini model family
- **[fal.ai](https://fal.ai)** — Generative media platform (flux/dev)
- **[Gradium](https://gradium.ai)** — Voice AI / TTS

### Technology Partners
- **[Alpic](https://alpic.ai)** — ChatGPT App platform (Skybridge)
- **[Dify](https://dify.ai)** — Open‑source AI agent platform
- **[Dust](https://dust.tt)** — AI agent platform for enterprises
- **[ZeroML](https://zml.ai)** — High‑performance inference
- **[DeepWiki](https://deepwiki.com)** — AI‑analyzed documentation
- **[OpenAI Codex](https://openai.com)** — Development companion

---

## 👤 Author

**Wilfred Doré**

Built with ❤️ at {Tech: Europe} Paris AI Hackathon 2026

<div align="center">
</div>

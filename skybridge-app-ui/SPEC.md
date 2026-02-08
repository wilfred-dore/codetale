
# CodeTale: GitHub Repository Presentations

## Value Proposition
Transform any GitHub repository into cinematic stories, interactive slides, and data-driven visualizations with a single click inside ChatGPT/Skybridge.
Target: Developers, Engineering Managers, Investors.
Pain: Understanding new codebases is time-consuming; creating documentation presentation is tedious.

**Core actions**:
1. **Analyze**: Get an instant deep-dive summary of a repo.
2. **Visualize**: See architecture diagrams and data flows.
3. **Compare**: Side-by-side comparison of two repos.
4. **Present**: Generate a full pitch deck / slides.

## Why LLM?
**Conversational win**: "Analyze this repo" or "Make a pitch deck for my project" is faster than manual analysis or slide creation.
**LLM adds**: Synthesizes complex code into simpler narratives (storytelling), adapts content for different audiences (investor vs dev).
**What LLM lacks**: Real-time access to file trees, rendering diagrams via MCP, fetching large codebases (handled by CodeTale API).

## UI Overview
**Input**: Simply paste a GitHub URL.
**Analysis View**: A rich card showing project summary, tech stack, and key metrics.
**Diagram View**: Mermaid diagrams rendered within the chat flow.
**Presentation View**: A carousel of slides or a link to the generated presentation.
**Comparison View**: Split view of two repositories' key stats.

## Product Context
- **Existing API**: CodeTale API (already deployed on Supabase).
- **Endpoints**: `/analyze-repo` and `/generate-presentation`.
- **Auth**: None (Public API).
- **Constraints**: 10 requests/minute rate limit.

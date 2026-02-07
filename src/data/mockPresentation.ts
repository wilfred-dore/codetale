export interface Slide {
  id: number;
  title: string;
  content: string;
  code?: string;
  type: "title" | "content" | "code" | "summary";
  icon?: string;
}

export const mockPresentation: Slide[] = [
  {
    id: 1,
    title: "CodeTale",
    content: "An automated storytelling engine for GitHub repositories",
    type: "title",
    icon: "📖",
  },
  {
    id: 2,
    title: "Architecture Overview",
    content: "Built with a modular architecture featuring React components, TypeScript type safety, and a clean separation of concerns between the UI layer and data processing pipeline.",
    type: "content",
    icon: "🏗️",
  },
  {
    id: 3,
    title: "Core Module",
    content: "The repository analyzer extracts structure, dependencies, and patterns from any GitHub repo.",
    code: `// analyzer.ts
export async function analyzeRepo(url: string) {
  const tree = await fetchRepoTree(url);
  const deps = extractDependencies(tree);
  const patterns = detectPatterns(tree);
  
  return { tree, deps, patterns };
}`,
    type: "code",
    icon: "⚙️",
  },
  {
    id: 4,
    title: "Data Pipeline",
    content: "A three-stage pipeline transforms raw repository data into narrative slides: Parse → Analyze → Generate. Each stage is independently testable and composable.",
    type: "content",
    icon: "🔄",
  },
  {
    id: 5,
    title: "Slide Generation",
    content: "The narrative engine uses contextual templates to create developer-friendly or DevRel-optimized presentations.",
    code: `// generator.ts
function generateSlides(analysis: RepoAnalysis, mode: Mode) {
  const template = mode === 'developer' 
    ? technicalTemplate 
    : devrelTemplate;
    
  return template.map(section => ({
    title: section.title,
    content: fillTemplate(section, analysis),
  }));
}`,
    type: "code",
    icon: "🎨",
  },
  {
    id: 6,
    title: "Key Takeaways",
    content: "Clean architecture • Type-safe throughout • Extensible plugin system • Two presentation modes • Auto-narration ready",
    type: "summary",
    icon: "✨",
  },
];

export const mockRepoInfo = {
  name: "codetale",
  owner: "wilfred-dore",
  stars: 142,
  language: "TypeScript",
  description: "Automated code storytelling engine",
};

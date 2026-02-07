export interface RepoEntry {
  name: string;
  url: string;
  emoji: string;
}

export interface RepoSection {
  label: string;
  variant: "outline" | "ghost";
  size: "default" | "sm";
  items: RepoEntry[];
}

const featuredTools: RepoEntry[] = [
  { name: "Lovable UI Kit", url: "https://github.com/lovable-dev/lovable-ui-kit", emoji: "💜" },
  { name: "fal.ai JS Client", url: "https://github.com/fal-ai/fal-js", emoji: "🎨" },
  { name: "Gradium Python", url: "https://github.com/gradium-ai/gradium-py", emoji: "🎙️" },
];

const partners: RepoEntry[] = [
  { name: "Alpic Skybridge", url: "https://github.com/alpic-ai/skybridge", emoji: "🚀" },
  { name: "Dify", url: "https://github.com/langgenius/dify", emoji: "🤖" },
  { name: "ZeroML", url: "https://github.com/zml/zml", emoji: "⚡" },
  { name: "OpenAI Python", url: "https://github.com/openai/openai-python", emoji: "🧠" },
  { name: "Dust", url: "https://github.com/dust-tt/dust", emoji: "✨" },
];

const showcase: RepoEntry[] = [
  { name: "Apollo 11", url: "https://github.com/chrislgarry/Apollo-11", emoji: "🌕" },
  { name: "MS-DOS", url: "https://github.com/microsoft/MS-DOS", emoji: "💾" },
  { name: "The Algorithms", url: "https://github.com/TheAlgorithms/Python", emoji: "📊" },
];

export const repoSections: RepoSection[] = [
  {
    label: "⚡ Built with these amazing tools:",
    variant: "outline",
    size: "default",
    items: featuredTools,
  },
  {
    label: "🏆 Explore our hackathon partners:",
    variant: "ghost",
    size: "sm",
    items: partners,
  },
  {
    label: "💡 Or explore legendary codebases:",
    variant: "ghost",
    size: "sm",
    items: showcase,
  },
];

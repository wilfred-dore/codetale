export type SlideType = "hook" | "overview" | "architecture" | "features" | "code" | "impact";

export interface StatItem {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
}

export interface GeneratedSlide {
  title: string;
  content: string;
  visualDescription: string;
  voiceScript: string;
  type: SlideType;
  mermaidDiagram?: string;
  imageUrl: string;
  audioUrl: string;
  stats?: StatItem[];
  repoMediaUrls?: string[];
}

export interface RepoInfo {
  name: string;
  fullName: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  topics: string[];
}

export interface PresentationData {
  repoInfo: RepoInfo;
  slides: GeneratedSlide[];
}

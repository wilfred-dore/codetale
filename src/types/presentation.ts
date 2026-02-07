export type SlideType = "hook" | "overview" | "architecture" | "features" | "code" | "impact" | "data" | "algorithm";

export interface StatItem {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
}

// ── Chart data for data-science / metrics slides ──
export type ChartType = "bar" | "line" | "pie" | "radar" | "area";

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number; // extra series
}

export interface ChartConfig {
  type: ChartType;
  title: string;
  data: ChartDataPoint[];
  series?: string[]; // column keys for multi-series
  xAxisLabel?: string;
  yAxisLabel?: string;
}

// ── Code stepping animation ──
export interface CodeStep {
  lines: number[];       // 1-indexed line numbers to highlight
  explanation: string;   // short description of what happens at this step
}

export interface CodeAnimation {
  code: string;
  language: string;
  steps: CodeStep[];
}

// ── Data structure visualization ──
export type DataStructureType = "array" | "tree" | "graph" | "stack" | "queue" | "linked-list";

export interface DSNode {
  id: string;
  label: string;
  highlight?: boolean;
}

export interface DSEdge {
  from: string;
  to: string;
  label?: string;
}

export interface DSStep {
  nodes: DSNode[];
  edges?: DSEdge[];
  caption: string;
}

export interface DataStructureAnimation {
  type: DataStructureType;
  steps: DSStep[];
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
  videoUrl?: string;
  stats?: StatItem[];
  repoMediaUrls?: string[];
  chartConfig?: ChartConfig;
  codeAnimation?: CodeAnimation;
  dataStructureAnimation?: DataStructureAnimation;
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

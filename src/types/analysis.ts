export interface KeyComponent {
  name: string;
  purpose: string;
  files: string[];
}

export interface DependencyHighlight {
  name: string;
  why: string;
}

export interface NarrativeChapter {
  title: string;
  content: string;
  duration_seconds: number;
}

export interface SuggestedNarrative {
  hook: string;
  chapters: NarrativeChapter[];
  closing: string;
}

export interface TargetAudiences {
  developer: string;
  manager: string;
  investor: string;
}

export interface SamplingInfo {
  strategy: string;
  code_files_found: number;
  files_excluded: number;
  estimated_tokens: number;
  file_type_distribution: Record<string, number>;
}

export interface AnalysisMeta {
  owner: string;
  repo: string;
  files_scanned: number;
  total_files: number;
  analyzed_at: string;
  sampling?: SamplingInfo;
}

export interface RepoImage {
  path: string;
  url: string;
  source: "tree" | "readme";
  alt?: string;
  likely_technical: boolean;
}

export interface RepoAnalysis {
  project_name: string;
  summary: string;
  main_language: string;
  languages: string[];
  framework: string | null;
  architecture_type: string;
  key_components: KeyComponent[];
  patterns_detected: string[];
  dependencies_highlight: DependencyHighlight[];
  complexity_score: number;
  interesting_facts: string[];
  mermaid_architecture: string;
  suggested_narrative: SuggestedNarrative;
  target_audiences: TargetAudiences;
  repo_images?: RepoImage[];
  _meta: AnalysisMeta;
}

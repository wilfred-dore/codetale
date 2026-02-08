import { motion } from "framer-motion";
import { Clapperboard, LayoutDashboard, Download, Maximize, Minimize, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RepoInfo } from "@/types/presentation";
import type { ViewMode } from "./ModeSelectionScreen";

interface PresentationTopBarProps {
  repoInfo: RepoInfo;
  viewMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  onNewStory: () => void;
  onDownloadHTML: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  hasAnalysis?: boolean;
}

export function PresentationTopBar({
  repoInfo,
  viewMode,
  onModeChange,
  onNewStory,
  onDownloadHTML,
  isFullscreen,
  onToggleFullscreen,
  hasAnalysis,
}: PresentationTopBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-4 py-2 border-b border-border/30 bg-background/80 backdrop-blur-md z-40"
    >
      {/* Left: Logo + repo info */}
      <div className="flex items-center gap-3">
        <button
          onClick={onNewStory}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          title="New story"
        >
          <span className="text-lg">📖</span>
          <span className="font-display font-bold text-sm text-foreground tracking-tight">
            CodeTale
          </span>
        </button>
        <span className="text-border/50">|</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground truncate max-w-[200px]">
            {repoInfo.name}
          </span>
          {repoInfo.stars > 0 && (
            <span className="text-xs text-muted-foreground">⭐ {repoInfo.stars.toLocaleString()}</span>
          )}
        </div>
      </div>

      {/* Center: Mode toggle — Analysis → Slides → Cinema */}
      <div className="flex items-center bg-secondary/50 rounded-lg p-0.5">
        {hasAnalysis && (
          <button
            onClick={() => onModeChange("analysis")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
              viewMode === "analysis"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Analysis
          </button>
        )}
        <button
          onClick={() => onModeChange("slides")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
            viewMode === "slides"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          Slides
        </button>
        <button
          onClick={() => onModeChange("cinema")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
            viewMode === "cinema"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Clapperboard className="w-3.5 h-3.5" />
          Cinema
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onDownloadHTML} className="rounded-lg">
          <Download className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onToggleFullscreen} className="rounded-lg">
          {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
        </Button>
      </div>
    </motion.div>
  );
}

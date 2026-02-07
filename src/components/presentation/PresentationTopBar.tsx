import { motion } from "framer-motion";
import { Clapperboard, LayoutDashboard, Download, RotateCcw, Maximize, Minimize } from "lucide-react";
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
}

export function PresentationTopBar({
  repoInfo,
  viewMode,
  onModeChange,
  onNewStory,
  onDownloadHTML,
  isFullscreen,
  onToggleFullscreen,
}: PresentationTopBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-4 py-2 border-b border-border/30 bg-background/80 backdrop-blur-md z-40"
    >
      {/* Left: New story + repo info */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onNewStory} className="rounded-lg gap-1.5">
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-xs">New</span>
        </Button>
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground truncate max-w-[200px]">
            {repoInfo.name}
          </span>
          {repoInfo.stars > 0 && (
            <span className="text-xs text-muted-foreground">⭐ {repoInfo.stars.toLocaleString()}</span>
          )}
        </div>
      </div>

      {/* Center: Mode toggle */}
      <div className="flex items-center bg-secondary/50 rounded-lg p-0.5">
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

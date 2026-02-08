import { motion } from "framer-motion";
import { Clapperboard, LayoutDashboard, BarChart3, Play, ArrowRight, Search } from "lucide-react";

export type ViewMode = "cinema" | "slides" | "analysis";

interface ModeSelectionScreenProps {
  onSelect: (mode: ViewMode) => void;
  repoName: string;
  hasAnalysis?: boolean;
}

export function ModeSelectionScreen({ onSelect, repoName, hasAnalysis = true }: ModeSelectionScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-10 w-full max-w-5xl mx-auto px-6 py-12"
    >
      {/* Header */}
      <div className="text-center space-y-3">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl font-bold gradient-text"
        >
          {repoName}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground text-lg"
        >
          Your story is ready. How do you want to experience it?
        </motion.p>
      </div>

      {/* Mode Cards — 3 columns: Analysis, Slides, Cinema (recommended) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
        {/* Analysis Card */}
        {hasAnalysis && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect("analysis")}
            className="group relative overflow-hidden rounded-2xl border-2 border-border/50 bg-card/30 
              backdrop-blur-md p-7 text-left transition-all duration-300
              hover:border-muted-foreground/50 hover:shadow-[0_0_30px_hsl(var(--muted)/0.15)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-muted/10 via-transparent to-muted/5 
              opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-muted/30 
                  group-hover:bg-muted/50 transition-colors">
                  <BarChart3 className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Analysis</h3>
                  <span className="text-xs font-mono text-muted-foreground">🔬 DEEP DIVE</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                Explore the full technical analysis: architecture, patterns, 
                complexity scores, and audience insights.
              </p>

              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Search className="w-4 h-4" />
                <span>Explore Data</span>
              </div>
            </div>
          </motion.button>
        )}

        {/* Slide Mode Card */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect("slides")}
          className="group relative overflow-hidden rounded-2xl border-2 border-border/50 bg-card/30 
            backdrop-blur-md p-7 text-left transition-all duration-300
            hover:border-muted-foreground/50 hover:shadow-[0_0_30px_hsl(var(--muted)/0.15)]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-muted/10 via-transparent to-muted/5 
            opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-muted/30 
                group-hover:bg-muted/50 transition-colors">
                <LayoutDashboard className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Slides</h3>
                <span className="text-xs font-mono text-muted-foreground">📊 CLASSIC</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Navigate at your pace. Audio narration on each slide, 
              with arrow keys or click to advance.
            </p>

            <div className="flex items-center gap-2 text-foreground font-semibold">
              <ArrowRight className="w-4 h-4" />
              <span>Open Slides</span>
            </div>
          </div>
        </motion.button>

        {/* Cinema Mode Card — RECOMMENDED, on the right */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect("cinema")}
          className="group relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-card/50 
            backdrop-blur-md p-7 text-left transition-all duration-300
            hover:border-primary hover:shadow-[0_0_40px_hsl(var(--primary)/0.2)]"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 
            opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/20 
                group-hover:bg-primary/30 transition-colors">
                <Clapperboard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Cinema</h3>
                <span className="text-xs font-mono text-primary/80">🎬 RECOMMENDED</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Continuous narration without interruption. Slides flow 
              like an arxflix documentary. No clicks needed.
            </p>

            <div className="flex items-center gap-2 text-primary font-semibold">
              <Play className="w-4 h-4 fill-current" />
              <span>Play Story</span>
            </div>
          </div>
        </motion.button>
      </div>
    </motion.div>
  );
}

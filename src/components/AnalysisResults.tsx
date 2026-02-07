import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  ChevronDown, ChevronUp, Sparkles, Layers, Code2, Lightbulb,
  Users, ArrowRight, FileCode2, Puzzle, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MermaidDiagram } from "@/components/MermaidDiagram";
import type { RepoAnalysis } from "@/types/analysis";

interface AnalysisResultsProps {
  analysis: RepoAnalysis;
  onGeneratePresentation: () => void;
  onBack: () => void;
}

// Color map for languages
const LANG_COLORS: Record<string, string> = {
  TypeScript: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  JavaScript: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  Python: "bg-green-500/20 text-green-300 border-green-500/30",
  Rust: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  Go: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  Java: "bg-red-500/20 text-red-300 border-red-500/30",
  "C++": "bg-purple-500/20 text-purple-300 border-purple-500/30",
  C: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  Ruby: "bg-red-500/20 text-red-300 border-red-500/30",
  Swift: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  Kotlin: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  Assembly: "bg-gray-500/20 text-gray-300 border-gray-500/30",
};

function ComplexityMeter({ score }: { score: number }) {
  const clampedScore = Math.max(1, Math.min(10, score));
  const percentage = (clampedScore / 10) * 100;

  // Color gradient: green (1) → yellow (5) → red (10)
  const getColor = (s: number) => {
    if (s <= 3) return "from-green-500 to-emerald-400";
    if (s <= 6) return "from-yellow-500 to-amber-400";
    return "from-red-500 to-orange-400";
  };

  const getLabel = (s: number) => {
    if (s <= 3) return "Simple";
    if (s <= 6) return "Moderate";
    if (s <= 8) return "Complex";
    return "Very Complex";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground font-mono">Complexity</span>
        <span className="font-bold text-foreground">{clampedScore}/10 — {getLabel(clampedScore)}</span>
      </div>
      <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          className={`h-full rounded-full bg-gradient-to-r ${getColor(clampedScore)}`}
        />
      </div>
    </div>
  );
}

function ExpandableCard({ title, icon: Icon, children, defaultOpen = false }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm text-foreground">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pt-0 pb-4 px-4">{children}</CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export function AnalysisResults({ analysis, onGeneratePresentation, onBack }: AnalysisResultsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-4xl mx-auto space-y-6 py-4"
    >
      {/* Header */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono"
        >
          <Sparkles className="w-3 h-3" />
          Analysis Complete
        </motion.div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          {analysis.project_name}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {analysis.summary}
        </p>
      </div>

      {/* Language badges + Architecture type */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {analysis.languages.map((lang) => (
          <Badge
            key={lang}
            variant="outline"
            className={`text-xs font-mono ${LANG_COLORS[lang] || "bg-secondary/50 text-secondary-foreground border-border"}`}
          >
            {lang}
          </Badge>
        ))}
        <Badge variant="secondary" className="text-xs font-mono">
          <Layers className="w-3 h-3 mr-1" />
          {analysis.architecture_type}
        </Badge>
        {analysis.framework && (
          <Badge variant="secondary" className="text-xs font-mono">
            {analysis.framework}
          </Badge>
        )}
      </div>

      {/* Complexity + Meta */}
      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardContent className="p-4 space-y-3">
          <ComplexityMeter score={analysis.complexity_score} />
          <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
            <span>{analysis._meta.files_scanned} files analyzed / {analysis._meta.total_files} total</span>
            <span>{analysis._meta.owner}/{analysis._meta.repo}</span>
          </div>
        </CardContent>
      </Card>

      {/* Architecture Diagram */}
      {analysis.mermaid_architecture && (
        <ExpandableCard title="Architecture Diagram" icon={Layers} defaultOpen>
          <MermaidDiagram chart={analysis.mermaid_architecture} />
        </ExpandableCard>
      )}

      {/* Key Components */}
      <ExpandableCard title={`Key Components (${analysis.key_components.length})`} icon={Puzzle} defaultOpen>
        <div className="grid gap-3 sm:grid-cols-2">
          {analysis.key_components.map((comp, i) => (
            <motion.div
              key={comp.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-lg bg-secondary/30 border border-border/30 p-3 space-y-1"
            >
              <div className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-primary" />
                {comp.name}
              </div>
              <p className="text-xs text-muted-foreground">{comp.purpose}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {comp.files.slice(0, 3).map((f) => (
                  <span key={f} className="text-[10px] font-mono text-muted-foreground/70 bg-secondary/50 px-1.5 py-0.5 rounded">
                    {f.split("/").pop()}
                  </span>
                ))}
                {comp.files.length > 3 && (
                  <span className="text-[10px] font-mono text-muted-foreground/50">
                    +{comp.files.length - 3} more
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </ExpandableCard>

      {/* Patterns & Dependencies */}
      <div className="grid gap-4 sm:grid-cols-2">
        <ExpandableCard title="Design Patterns" icon={FileCode2}>
          <div className="flex flex-wrap gap-2">
            {analysis.patterns_detected.map((p) => (
              <Badge key={p} variant="outline" className="text-xs font-mono">
                {p}
              </Badge>
            ))}
            {analysis.patterns_detected.length === 0 && (
              <span className="text-xs text-muted-foreground">No specific patterns detected</span>
            )}
          </div>
        </ExpandableCard>

        <ExpandableCard title="Key Dependencies" icon={Zap}>
          <div className="space-y-2">
            {analysis.dependencies_highlight.map((dep) => (
              <div key={dep.name} className="text-xs">
                <span className="font-mono font-semibold text-foreground">{dep.name}</span>
                <span className="text-muted-foreground ml-1">— {dep.why}</span>
              </div>
            ))}
            {analysis.dependencies_highlight.length === 0 && (
              <span className="text-xs text-muted-foreground">No notable dependencies</span>
            )}
          </div>
        </ExpandableCard>
      </div>

      {/* Interesting Facts */}
      {analysis.interesting_facts.length > 0 && (
        <ExpandableCard title="Interesting Facts" icon={Lightbulb} defaultOpen>
          <div className="space-y-2">
            {analysis.interesting_facts.map((fact, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-2 text-sm"
              >
                <span className="text-primary mt-0.5">💡</span>
                <span className="text-muted-foreground">{fact}</span>
              </motion.div>
            ))}
          </div>
        </ExpandableCard>
      )}

      {/* Target Audiences */}
      <ExpandableCard title="Who Should Care?" icon={Users}>
        <div className="grid gap-3 sm:grid-cols-3">
          {(["developer", "manager", "investor"] as const).map((role) => (
            <div key={role} className="rounded-lg bg-secondary/30 border border-border/30 p-3 space-y-1">
              <div className="text-xs font-mono font-semibold text-primary capitalize">{role}</div>
              <p className="text-xs text-muted-foreground">{analysis.target_audiences[role]}</p>
            </div>
          ))}
        </div>
      </ExpandableCard>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-4 pt-4">
        <Button variant="outline" onClick={onBack}>
          ← New Analysis
        </Button>
        <Button onClick={onGeneratePresentation} className="gap-2">
          Generate Presentation
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}

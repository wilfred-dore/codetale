import { motion } from "framer-motion";
import { Loader2, AlertCircle, Search, FolderOpen, Brain, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { AnalysisStep } from "@/hooks/useAnalyzeRepo";

const STEPS: { key: AnalysisStep; label: string; icon: React.ElementType }[] = [
  { key: "scanning", label: "Scanning repository structure...", icon: Search },
  { key: "reading", label: "Reading key files...", icon: FolderOpen },
  { key: "analyzing", label: "AI analyzing architecture...", icon: Brain },
];

interface AnalysisProgressProps {
  step: AnalysisStep;
  error: string | null;
  onRetry?: () => void;
  onCancel?: () => void;
}

export function AnalysisProgress({ step, error, onRetry, onCancel }: AnalysisProgressProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentStepIndex = STEPS.findIndex((s) => s.key === step);
  const progress =
    step === "complete" ? 100 :
    step === "error" ? 0 :
    Math.min(95, ((currentStepIndex + 1) / STEPS.length) * 85 + (elapsed % 10));

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] gap-6"
      >
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <div className="text-center space-y-2 max-w-md">
          <h2 className="text-xl font-semibold text-foreground">Analysis Failed</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
        <div className="flex items-center gap-3">
          {onRetry && (
            <Button variant="default" onClick={onRetry}>Try Again</Button>
          )}
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>Go Back</Button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center justify-center min-h-[60vh] gap-8"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="w-12 h-12 text-primary" />
      </motion.div>

      <div className="text-center space-y-4 max-w-md">
        <h2 className="text-2xl font-semibold text-foreground">
          Analyzing repository
        </h2>

        <div className="space-y-3">
          {STEPS.map((s, i) => {
            const isActive = s.key === step;
            const isDone = currentStepIndex > i || step === "complete";
            const Icon = isDone ? CheckCircle2 : s.icon;

            return (
              <motion.div
                key={s.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{
                  opacity: isDone || isActive ? 1 : 0.3,
                  x: 0,
                }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center gap-2 text-sm font-mono justify-center ${
                  isActive ? "text-primary" :
                  isDone ? "text-muted-foreground" :
                  "text-muted-foreground/40"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "animate-pulse" : ""}`} />
                {s.label}
              </motion.div>
            );
          })}
        </div>

        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mt-6">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{Math.round(progress)}%</span>
          <span>{elapsed}s</span>
        </div>
      </div>

      {onCancel && (
        <Button variant="outline" size="sm" onClick={onCancel} className="rounded-lg mt-2">
          Cancel
        </Button>
      )}
    </motion.div>
  );
}

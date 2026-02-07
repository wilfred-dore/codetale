import { motion } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { GenerationStep } from "@/hooks/useGeneratePresentation";

const STEPS: { key: GenerationStep; label: string }[] = [
  { key: "analyzing", label: "Analyzing repository..." },
  { key: "generating", label: "Generating slide content..." },
  { key: "visuals", label: "Creating AI visuals..." },
  { key: "audio", label: "Recording narration..." },
];

interface LoadingStateProps {
  step: GenerationStep;
  error: string | null;
  onRetry?: () => void;
  onCancel?: () => void;
}

export function LoadingState({ step, error, onRetry, onCancel }: LoadingStateProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentStepIndex = STEPS.findIndex((s) => s.key === step);
  const progress =
    step === "complete"
      ? 100
      : step === "error"
      ? 0
      : Math.min(95, ((currentStepIndex + 1) / STEPS.length) * 90 + (elapsed % 10));

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
          <h2 className="text-xl font-semibold text-foreground">Generation Failed</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
        <div className="flex items-center gap-3">
          {onRetry && (
            <Button variant="hero" onClick={onRetry}>
              Try Again
            </Button>
          )}
          {onCancel && (
            <Button variant="glass" onClick={onCancel}>
              Go Back
            </Button>
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
          Crafting your story
        </h2>

        <div className="space-y-3">
          {STEPS.map((s, i) => {
            const isActive = s.key === step;
            const isDone = currentStepIndex > i || step === "complete";

            return (
              <motion.div
                key={s.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{
                  opacity: isDone || isActive ? 1 : 0.3,
                  x: 0,
                }}
                transition={{ delay: i * 0.1 }}
                className={`text-sm font-mono ${
                  isActive
                    ? "text-primary"
                    : isDone
                    ? "text-muted-foreground"
                    : "text-muted-foreground/40"
                }`}
              >
                {isDone ? "✓ " : isActive ? "→ " : "  "}
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
          <span>{Math.round(progress)}% complete</span>
          <span>{elapsed}s elapsed</span>
        </div>
      </div>

      {onCancel && (
        <Button variant="glass" size="sm" onClick={onCancel} className="rounded-lg mt-2">
          Cancel
        </Button>
      )}
    </motion.div>
  );
}

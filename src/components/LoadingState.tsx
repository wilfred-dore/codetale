import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const STEPS = [
  { label: "Cloning repository...", duration: 1200 },
  { label: "Analyzing file structure...", duration: 1500 },
  { label: "Extracting code patterns...", duration: 1800 },
  { label: "Generating narrative...", duration: 2000 },
  { label: "Building slides...", duration: 1000 },
  { label: "Synthesizing audio...", duration: 1500 },
];

interface LoadingStateProps {
  onComplete: () => void;
}

export function LoadingState({ onComplete }: LoadingStateProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentStep >= STEPS.length) {
      onComplete();
      return;
    }

    const stepDuration = STEPS[currentStep].duration;
    const interval = setInterval(() => {
      setProgress((prev) => {
        const stepProgress = ((currentStep + 1) / STEPS.length) * 100;
        const prevStepProgress = (currentStep / STEPS.length) * 100;
        const target = stepProgress;
        if (prev >= target - 1) {
          clearInterval(interval);
          setTimeout(() => setCurrentStep((s) => s + 1), 200);
          return target;
        }
        return prev + (target - prevStepProgress) / (stepDuration / 50);
      });
    }, 50);

    return () => clearInterval(interval);
  }, [currentStep, onComplete]);

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
          {STEPS.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{
                opacity: i <= currentStep ? 1 : 0.3,
                x: 0,
              }}
              transition={{ delay: i * 0.1 }}
              className={`text-sm font-mono ${
                i === currentStep
                  ? "text-primary"
                  : i < currentStep
                  ? "text-muted-foreground"
                  : "text-muted-foreground/40"
              }`}
            >
              {i < currentStep ? "✓ " : i === currentStep ? "→ " : "  "}
              {step.label}
            </motion.div>
          ))}
        </div>

        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mt-6">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          {Math.round(progress)}% complete
        </p>
      </div>
    </motion.div>
  );
}

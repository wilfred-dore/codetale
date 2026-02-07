import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CodeAnimation } from "@/types/presentation";

interface CodeStepperProps {
  animation: CodeAnimation;
  isPlaying?: boolean;
  /** Total duration in ms to spread steps across (defaults to auto) */
  durationMs?: number;
}

export function CodeStepper({ animation, isPlaying = false, durationMs }: CodeStepperProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const lines = animation.code.split("\n");
  const step = animation.steps[currentStep];

  const totalDuration = durationMs || animation.steps.length * 3000;
  const stepDuration = totalDuration / animation.steps.length;

  // Auto-advance steps when playing
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setCurrentStep(0);
    timerRef.current = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= animation.steps.length - 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return prev;
        }
        return prev + 1;
      });
    }, stepDuration);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, animation.steps.length, stepDuration]);

  // Manual navigation when not playing
  const goToStep = useCallback((idx: number) => {
    if (!isPlaying && idx >= 0 && idx < animation.steps.length) {
      setCurrentStep(idx);
    }
  }, [isPlaying, animation.steps.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full max-w-2xl mx-auto space-y-3"
    >
      {/* Code block with highlights */}
      <div className="relative rounded-xl overflow-hidden border border-border/50 bg-[#1e1e1e]">
        {/* Language badge */}
        <div className="flex items-center justify-between px-4 py-1.5 bg-secondary/30 border-b border-border/30">
          <span className="text-xs font-mono text-muted-foreground">
            {animation.language}
          </span>
          <span className="text-xs text-muted-foreground">
            Step {currentStep + 1}/{animation.steps.length}
          </span>
        </div>

        {/* Code lines */}
        <div className="overflow-x-auto p-0">
          <pre className="text-xs md:text-sm font-mono leading-relaxed">
            {lines.map((line, i) => {
              const lineNum = i + 1;
              const isHighlighted = step?.lines.includes(lineNum);
              return (
                <motion.div
                  key={i}
                  animate={{
                    backgroundColor: isHighlighted
                      ? "hsla(199, 89%, 48%, 0.15)"
                      : "transparent",
                    borderLeftColor: isHighlighted
                      ? "hsl(199, 89%, 48%)"
                      : "transparent",
                  }}
                  transition={{ duration: 0.3 }}
                  className="flex border-l-2 px-4 py-0.5"
                >
                  <span className="w-8 flex-shrink-0 text-right pr-3 text-muted-foreground/50 select-none">
                    {lineNum}
                  </span>
                  <span className={isHighlighted ? "text-foreground" : "text-muted-foreground/70"}>
                    {line || " "}
                  </span>
                </motion.div>
              );
            })}
          </pre>
        </div>
      </div>

      {/* Explanation bubble */}
      <AnimatePresence mode="wait">
        {step && (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.25 }}
            className="flex items-start gap-2 px-4 py-2.5 rounded-lg bg-primary/10 border border-primary/20"
          >
            <span className="text-primary text-lg flex-shrink-0">→</span>
            <p className="text-sm text-secondary-foreground leading-relaxed">
              {step.explanation}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step dots (manual navigation when paused) */}
      {!isPlaying && animation.steps.length > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          {animation.steps.map((_, i) => (
            <button
              key={i}
              onClick={() => goToStep(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentStep
                  ? "bg-primary w-4"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { PresentationData } from "@/types/presentation";

export type GenerationStep = 
  | "idle"
  | "analyzing"
  | "generating"
  | "visuals"
  | "audio"
  | "complete"
  | "error";

interface UseGeneratePresentationReturn {
  generate: (githubUrl: string, mode: string) => Promise<void>;
  isLoading: boolean;
  step: GenerationStep;
  error: string | null;
  data: PresentationData | null;
  reset: () => void;
}

export function useGeneratePresentation(): UseGeneratePresentationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<GenerationStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PresentationData | null>(null);

  const reset = useCallback(() => {
    setIsLoading(false);
    setStep("idle");
    setError(null);
    setData(null);
  }, []);

  const generate = useCallback(async (githubUrl: string, mode: string) => {
    setIsLoading(true);
    setError(null);
    setData(null);
    setStep("analyzing");

    // Simulate progress steps while the backend processes
    const stepTimers: ReturnType<typeof setTimeout>[] = [];
    stepTimers.push(setTimeout(() => setStep("generating"), 3000));
    stepTimers.push(setTimeout(() => setStep("visuals"), 12000));
    stepTimers.push(setTimeout(() => setStep("audio"), 25000));

    try {
      const { data: result, error: fnError } = await supabase.functions.invoke(
        "generate-presentation",
        {
          body: { githubUrl, mode },
        }
      );

      // Clear simulated progress timers
      stepTimers.forEach(clearTimeout);

      if (fnError) {
        throw new Error(fnError.message || "Generation failed");
      }

      if (result?.error) {
        throw new Error(result.error);
      }

      setData(result as PresentationData);
      setStep("complete");
    } catch (err) {
      stepTimers.forEach(clearTimeout);
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      console.error("Generation error:", message);
      setError(message);
      setStep("error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { generate, isLoading, step, error, data, reset };
}

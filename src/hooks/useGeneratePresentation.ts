import { useState, useCallback, useRef } from "react";
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
  generate: (githubUrl: string, mode: string, language?: string) => Promise<void>;
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

  // Generation counter to ignore stale results
  const generationIdRef = useRef(0);
  const stepTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    stepTimersRef.current.forEach(clearTimeout);
    stepTimersRef.current = [];
  }, []);

  const reset = useCallback(() => {
    generationIdRef.current += 1; // Invalidate any in-flight generation
    clearTimers();
    setIsLoading(false);
    setStep("idle");
    setError(null);
    setData(null);
  }, [clearTimers]);

  const generate = useCallback(async (githubUrl: string, mode: string, language: string = "en") => {
    // Invalidate previous generation and reset state
    generationIdRef.current += 1;
    const currentId = generationIdRef.current;
    
    clearTimers();
    setIsLoading(true);
    setError(null);
    setData(null);
    setStep("analyzing");

    // Simulate progress steps while the backend processes
    stepTimersRef.current = [
      setTimeout(() => {
        if (generationIdRef.current === currentId) setStep("generating");
      }, 3000),
      setTimeout(() => {
        if (generationIdRef.current === currentId) setStep("visuals");
      }, 12000),
      setTimeout(() => {
        if (generationIdRef.current === currentId) setStep("audio");
      }, 25000),
    ];

    try {
      const { data: result, error: fnError } = await supabase.functions.invoke(
        "generate-presentation",
        {
          body: { githubUrl, mode, language },
        }
      );

      // Ignore result if a newer generation was started or reset was called
      if (generationIdRef.current !== currentId) {
        console.log("Ignoring stale generation result");
        return;
      }

      clearTimers();

      if (fnError) {
        throw new Error(fnError.message || "Generation failed");
      }

      if (result?.error) {
        throw new Error(result.error);
      }

      setData(result as PresentationData);
      setStep("complete");
    } catch (err) {
      if (generationIdRef.current !== currentId) return;
      clearTimers();
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      console.error("Generation error:", message);
      setError(message);
      setStep("error");
    } finally {
      if (generationIdRef.current === currentId) {
        setIsLoading(false);
      }
    }
  }, [clearTimers]);

  return { generate, isLoading, step, error, data, reset };
}

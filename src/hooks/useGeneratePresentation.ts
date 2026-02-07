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
  generate: (githubUrl: string, mode: string, language?: string) => Promise<PresentationData | null>;
  isLoading: boolean;
  step: GenerationStep;
  error: string | null;
  data: PresentationData | null;
  reset: () => void;
}

const SAFETY_TIMEOUT_MS = 120_000; // 2 minutes max per generation

export function useGeneratePresentation(): UseGeneratePresentationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<GenerationStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PresentationData | null>(null);

  // Generation counter to ignore stale results
  const generationIdRef = useRef(0);
  const stepTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  // Guard against concurrent calls
  const isGeneratingRef = useRef(false);

  const clearTimers = useCallback(() => {
    stepTimersRef.current.forEach(clearTimeout);
    stepTimersRef.current = [];
  }, []);

  const reset = useCallback(() => {
    generationIdRef.current += 1; // Invalidate any in-flight generation
    isGeneratingRef.current = false;
    clearTimers();
    setIsLoading(false);
    setStep("idle");
    setError(null);
    setData(null);
  }, [clearTimers]);

  const generate = useCallback(async (githubUrl: string, mode: string, language: string = "en"): Promise<PresentationData | null> => {
    // Block concurrent calls — the first one wins until it finishes or is reset
    if (isGeneratingRef.current) {
      console.log("Generation already in progress, ignoring duplicate call");
      return null;
    }

    // Invalidate previous generation and reset state
    generationIdRef.current += 1;
    const currentId = generationIdRef.current;
    isGeneratingRef.current = true;
    
    clearTimers();
    setIsLoading(true);
    setError(null);
    setData(null);
    setStep("analyzing");

    // Safety timeout: auto-reset if stuck
    const safetyTimer = setTimeout(() => {
      if (generationIdRef.current === currentId && isGeneratingRef.current) {
        console.warn("Generation safety timeout reached, resetting...");
        isGeneratingRef.current = false;
        clearTimers();
        setError("Generation timed out. Please try again.");
        setStep("error");
        setIsLoading(false);
      }
    }, SAFETY_TIMEOUT_MS);
    stepTimersRef.current.push(safetyTimer);

    // Simulate progress steps while the backend processes
    stepTimersRef.current.push(
      setTimeout(() => {
        if (generationIdRef.current === currentId) setStep("generating");
      }, 3000),
      setTimeout(() => {
        if (generationIdRef.current === currentId) setStep("visuals");
      }, 12000),
      setTimeout(() => {
        if (generationIdRef.current === currentId) setStep("audio");
      }, 25000),
    );

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
        return null;
      }

      clearTimers();

      if (fnError) {
        throw new Error(fnError.message || "Generation failed");
      }

      if (result?.error) {
        throw new Error(result.error);
      }

      const presentation = result as PresentationData;
      setData(presentation);
      setStep("complete");
      return presentation;
    } catch (err) {
      if (generationIdRef.current !== currentId) return null;
      clearTimers();
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      console.error("Generation error:", message);
      setError(message);
      setStep("error");
      return null;
    } finally {
      if (generationIdRef.current === currentId) {
        isGeneratingRef.current = false;
        setIsLoading(false);
      }
    }
  }, [clearTimers]);

  return { generate, isLoading, step, error, data, reset };
}

import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { RepoAnalysis } from "@/types/analysis";

export type AnalysisStep =
  | "idle"
  | "scanning"
  | "reading"
  | "analyzing"
  | "complete"
  | "error";

interface UseAnalyzeRepoReturn {
  analyze: (githubUrl: string) => Promise<RepoAnalysis | null>;
  isLoading: boolean;
  step: AnalysisStep;
  error: string | null;
  data: RepoAnalysis | null;
  reset: () => void;
}

const SAFETY_TIMEOUT_MS = 90_000;

export function useAnalyzeRepo(): UseAnalyzeRepoReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<AnalysisStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RepoAnalysis | null>(null);

  const generationIdRef = useRef(0);
  const stepTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isAnalyzingRef = useRef(false);

  const clearTimers = useCallback(() => {
    stepTimersRef.current.forEach(clearTimeout);
    stepTimersRef.current = [];
  }, []);

  const reset = useCallback(() => {
    generationIdRef.current += 1;
    isAnalyzingRef.current = false;
    clearTimers();
    setIsLoading(false);
    setStep("idle");
    setError(null);
    setData(null);
  }, [clearTimers]);

  const analyze = useCallback(async (githubUrl: string): Promise<RepoAnalysis | null> => {
    if (isAnalyzingRef.current) return null;

    generationIdRef.current += 1;
    const currentId = generationIdRef.current;
    isAnalyzingRef.current = true;

    clearTimers();
    setIsLoading(true);
    setError(null);
    setData(null);
    setStep("scanning");

    // Safety timeout
    const safetyTimer = setTimeout(() => {
      if (generationIdRef.current === currentId && isAnalyzingRef.current) {
        isAnalyzingRef.current = false;
        clearTimers();
        setError("Analysis timed out. Please try again.");
        setStep("error");
        setIsLoading(false);
      }
    }, SAFETY_TIMEOUT_MS);
    stepTimersRef.current.push(safetyTimer);

    // Simulate progress steps
    stepTimersRef.current.push(
      setTimeout(() => {
        if (generationIdRef.current === currentId) setStep("reading");
      }, 3000),
      setTimeout(() => {
        if (generationIdRef.current === currentId) setStep("analyzing");
      }, 10000),
    );

    try {
      const { data: result, error: fnError } = await supabase.functions.invoke(
        "analyze-repo",
        {
          body: {
            repo_url: githubUrl,
            options: {
              max_files: 30,
              include_narrative: true,
              include_mermaid: true,
              target_audience: "all",
            },
          },
        }
      );

      if (generationIdRef.current !== currentId) return null;
      clearTimers();

      if (fnError) throw new Error(fnError.message || "Analysis failed");

      // Handle new API response format
      if (result?.status === "error") {
        throw new Error(result.error || "Analysis failed");
      }

      // Extract analysis from new format (or fall back to old format)
      const analysis = (result?.analysis || result) as RepoAnalysis;
      setData(analysis);
      setStep("complete");
      return analysis;
    } catch (err) {
      if (generationIdRef.current !== currentId) return null;
      clearTimers();
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      console.error("Analysis error:", message);
      setError(message);
      setStep("error");
      return null;
    } finally {
      if (generationIdRef.current === currentId) {
        isAnalyzingRef.current = false;
        setIsLoading(false);
      }
    }
  }, [clearTimers]);

  return { analyze, isLoading, step, error, data, reset };
}

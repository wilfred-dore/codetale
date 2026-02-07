import { useState, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Info, Code2 } from "lucide-react";
import { Hero } from "@/components/Hero";
import { URLInput } from "@/components/URLInput";
import { ModeSelector, type PresentationMode } from "@/components/ModeSelector";
import { LanguageSelector, type Language } from "@/components/LanguageSelector";
import { GenerateButton } from "@/components/GenerateButton";
import { LoadingState } from "@/components/LoadingState";
import { PresentationViewer } from "@/components/PresentationViewer";
import { QuickRepos } from "@/components/QuickRepos";
import { AnalysisProgress } from "@/components/AnalysisProgress";
import { AnalysisResults } from "@/components/AnalysisResults";
import { useGeneratePresentation } from "@/hooks/useGeneratePresentation";
import { useAnalyzeRepo } from "@/hooks/useAnalyzeRepo";
import type { RepoAnalysis } from "@/types/analysis";

type AppState = "input" | "analyzing" | "analysis-results" | "loading" | "presentation";

// Read ?repo= param once on mount (no reactive re-renders)
function getInitialRepo(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get("repo") || "";
}

const Index = () => {
  const [state, setState] = useState<AppState>("input");
  const [url, setUrl] = useState(getInitialRepo);
  const [mode, setMode] = useState<PresentationMode>("developer");
  const [language, setLanguage] = useState<Language>("en");
  const [analysisData, setAnalysisData] = useState<RepoAnalysis | null>(null);

  const { generate, isLoading, step, error, data, reset } = useGeneratePresentation();
  const {
    analyze,
    isLoading: isAnalyzing,
    step: analysisStep,
    error: analysisError,
    data: analysisResult,
    reset: resetAnalysis,
  } = useAnalyzeRepo();

  // Guard against rapid clicks during exit animations
  const isTransitioningRef = useRef(false);

  const GITHUB_URL_REGEX = /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/;
  const isValidUrl = GITHUB_URL_REGEX.test(url);

  // ─── Analysis flow ───────────────────────────────────────────────────────────

  const handleAnalyze = useCallback(async (overrideUrl?: string) => {
    if (isTransitioningRef.current || isAnalyzing) return;

    const targetUrl = overrideUrl || url;
    if (!GITHUB_URL_REGEX.test(targetUrl)) return;

    isTransitioningRef.current = true;
    setUrl(targetUrl);
    setState("analyzing");

    setTimeout(() => { isTransitioningRef.current = false; }, 500);

    const result = await analyze(targetUrl);
    if (result) {
      setAnalysisData(result);
      setState("analysis-results");
    }
    // If null + error, AnalysisProgress shows error with retry/cancel
  }, [url, analyze, isAnalyzing]);

  // ─── Presentation generation (from analysis results) ─────────────────────────

  const handleGenerateFromAnalysis = useCallback(async () => {
    if (isTransitioningRef.current || isLoading) return;

    isTransitioningRef.current = true;
    setState("loading");

    setTimeout(() => { isTransitioningRef.current = false; }, 500);

    const result = await generate(url, mode, language);
    if (result) {
      setState("presentation");
    }
  }, [url, mode, language, generate, isLoading]);

  // ─── Direct generate (legacy, for quick repos that skip analysis) ────────────

  const handleGenerate = useCallback(async (overrideUrl?: string) => {
    if (isTransitioningRef.current || isLoading) return;

    const targetUrl = overrideUrl || url;
    if (!GITHUB_URL_REGEX.test(targetUrl)) return;

    isTransitioningRef.current = true;
    setUrl(targetUrl);
    setState("loading");

    setTimeout(() => { isTransitioningRef.current = false; }, 500);

    const result = await generate(targetUrl, mode, language);
    if (result) {
      setState("presentation");
    }
  }, [url, mode, language, generate, isLoading]);

  // ─── Reset / cancel / retry ──────────────────────────────────────────────────

  const handleReset = useCallback(() => {
    isTransitioningRef.current = false;
    setState("input");
    setUrl("");
    setAnalysisData(null);
    reset();
    resetAnalysis();
  }, [reset, resetAnalysis]);

  const handleRetryAnalysis = useCallback(() => {
    resetAnalysis();
    setTimeout(() => { handleAnalyze(); }, 100);
  }, [handleAnalyze, resetAnalysis]);

  const handleCancelAnalysis = useCallback(() => {
    isTransitioningRef.current = false;
    setState("input");
    resetAnalysis();
  }, [resetAnalysis]);

  const handleRetry = useCallback(() => {
    reset();
    setTimeout(() => { handleGenerate(); }, 100);
  }, [handleGenerate, reset]);

  const handleSelectRepo = useCallback((repoUrl: string) => {
    handleAnalyze(repoUrl);
  }, [handleAnalyze]);

  const handleCancel = useCallback(() => {
    isTransitioningRef.current = false;
    setState("input");
    reset();
  }, [reset]);

  const handleBackToAnalysis = useCallback(() => {
    if (analysisData) {
      setState("analysis-results");
    } else {
      handleReset();
    }
  }, [analysisData, handleReset]);

  const handleViewAnalysis = useCallback(() => {
    if (analysisData) {
      setState("analysis-results");
    }
  }, [analysisData]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Nav */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-border/50">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
            <span className="text-xl">📖</span>
            <span className="font-display font-bold text-lg text-foreground tracking-tight">
              CodeTale
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/api-docs"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Code2 className="w-4 h-4" />
              <span className="hidden sm:inline">API</span>
            </Link>
            <Link
              to="/about"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">About</span>
            </Link>
            <span className="text-xs font-mono text-muted-foreground glass-subtle px-3 py-1 rounded-full">
              {"{Tech: Europe}"} Paris 2026
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <AnimatePresence mode="wait">
            {state === "input" && (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-3xl space-y-10"
              >
                <Hero />

                <div className="space-y-6">
                  <URLInput value={url} onChange={setUrl} />

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <ModeSelector mode={mode} onModeChange={setMode} />
                    <LanguageSelector language={language} onLanguageChange={setLanguage} />
                  </div>

                  <div className="flex justify-center">
                    <GenerateButton
                      onClick={() => handleAnalyze()}
                      disabled={!isValidUrl || isAnalyzing}
                    />
                  </div>
                </div>

                <QuickRepos onSelectRepo={handleSelectRepo} />
              </motion.div>
            )}

            {state === "analyzing" && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <AnalysisProgress
                  step={analysisStep}
                  error={analysisError}
                  onRetry={handleRetryAnalysis}
                  onCancel={handleCancelAnalysis}
                />
              </motion.div>
            )}

            {state === "analysis-results" && analysisData && (
              <motion.div
                key="analysis-results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="w-full"
              >
                <AnalysisResults
                  analysis={analysisData}
                  onGeneratePresentation={handleGenerateFromAnalysis}
                  onBack={handleReset}
                  onBackToPresentation={data ? () => setState("presentation") : undefined}
                />
              </motion.div>
            )}

            {state === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <LoadingState
                  step={step}
                  error={error}
                  onRetry={handleRetry}
                  onCancel={handleBackToAnalysis}
                />
              </motion.div>
            )}

            {state === "presentation" && data && (
              <motion.div
                key="presentation"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full"
              >
                <PresentationViewer
                  presentation={data}
                  onNewStory={handleReset}
                  onViewAnalysis={analysisData ? handleViewAnalysis : undefined}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Index;

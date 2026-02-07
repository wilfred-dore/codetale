import { useState, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Info } from "lucide-react";
import { Hero } from "@/components/Hero";
import { URLInput } from "@/components/URLInput";
import { ModeSelector, type PresentationMode } from "@/components/ModeSelector";
import { LanguageSelector, type Language } from "@/components/LanguageSelector";
import { GenerateButton } from "@/components/GenerateButton";
import { LoadingState } from "@/components/LoadingState";
import { PresentationViewer } from "@/components/PresentationViewer";
import { QuickRepos } from "@/components/QuickRepos";
import { useGeneratePresentation } from "@/hooks/useGeneratePresentation";

type AppState = "input" | "loading" | "presentation";

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

  const { generate, isLoading, step, error, data, reset } = useGeneratePresentation();

  // Guard against rapid clicks during exit animations
  const isTransitioningRef = useRef(false);

  const GITHUB_URL_REGEX = /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/;
  const isValidUrl = GITHUB_URL_REGEX.test(url);

  const handleGenerate = useCallback(async (overrideUrl?: string) => {
    // Block if already transitioning or loading
    if (isTransitioningRef.current || isLoading) return;

    const targetUrl = overrideUrl || url;
    if (!GITHUB_URL_REGEX.test(targetUrl)) return;

    isTransitioningRef.current = true;
    setUrl(targetUrl);
    setState("loading");

    // Release the guard after the exit animation completes
    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 500);

    const result = await generate(targetUrl, mode, language);
    
    if (result) {
      setState("presentation");
    }
    // If result is null and error occurred, LoadingState shows the error
    // with retry/cancel buttons. No stuck state possible.
  }, [url, mode, language, generate, isLoading]);

  const handleReset = useCallback(() => {
    isTransitioningRef.current = false;
    setState("input");
    setUrl("");
    reset();
  }, [reset]);

  const handleRetry = useCallback(() => {
    // Reset the generating guard before retrying
    reset();
    // Small delay to allow state to settle before re-generating
    setTimeout(() => {
      handleGenerate();
    }, 100);
  }, [handleGenerate, reset]);

  const handleSelectRepo = useCallback((repoUrl: string) => {
    handleGenerate(repoUrl);
  }, [handleGenerate]);

  const handleCancel = useCallback(() => {
    isTransitioningRef.current = false;
    setState("input");
    reset();
  }, [reset]);

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
              to="/about"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">What is CodeTale?</span>
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
                      onClick={() => handleGenerate()}
                      disabled={!isValidUrl || isLoading}
                    />
                  </div>
                </div>

                <QuickRepos onSelectRepo={handleSelectRepo} />
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
                  onCancel={handleCancel}
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

import { useState, useCallback } from "react";
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
import { toast } from "@/hooks/use-toast";

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

  const GITHUB_URL_REGEX = /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/;
  const isValidUrl = GITHUB_URL_REGEX.test(url);

  const handleGenerate = useCallback(async () => {
    if (!isValidUrl) return;
    setState("loading");

    const result = await generate(url, mode, language);
    
    // Directly transition based on return value — no useEffect needed
    if (result) {
      setState("presentation");
    }
    // If result is null, either an error occurred (shown by LoadingState)
    // or the generation was canceled/stale (reset already handled state)
  }, [isValidUrl, url, mode, language, generate]);

  const handleReset = useCallback(() => {
    setState("input");
    setUrl("");
    reset();
  }, [reset]);

  const handleRetry = useCallback(() => {
    handleGenerate();
  }, [handleGenerate]);

  const handleCancel = useCallback(() => {
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
                      onClick={handleGenerate}
                      disabled={!isValidUrl}
                    />
                  </div>
                </div>

                <QuickRepos onSelectRepo={setUrl} />
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

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Hero } from "@/components/Hero";
import { URLInput } from "@/components/URLInput";
import { ModeSelector, type PresentationMode } from "@/components/ModeSelector";
import { GenerateButton } from "@/components/GenerateButton";
import { LoadingState } from "@/components/LoadingState";
import { PresentationViewer } from "@/components/PresentationViewer";
import { mockPresentation } from "@/data/mockPresentation";

type AppState = "input" | "loading" | "presentation";

const Index = () => {
  const [state, setState] = useState<AppState>("input");
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState<PresentationMode>("developer");

  const GITHUB_URL_REGEX = /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/;
  const isValidUrl = GITHUB_URL_REGEX.test(url);

  const handleGenerate = () => {
    if (!isValidUrl) return;
    setState("loading");
  };

  const handleReset = () => {
    setState("input");
    setUrl("");
  };

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
          <div className="flex items-center gap-2">
            <span className="text-xl">📖</span>
            <span className="font-display font-bold text-lg text-foreground tracking-tight">
              CodeTale
            </span>
          </div>
          <span className="text-xs font-mono text-muted-foreground glass-subtle px-3 py-1 rounded-full">
            {"{Tech: Europe}"} Paris 2026
          </span>
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

                  <ModeSelector mode={mode} onModeChange={setMode} />

                  <div className="flex justify-center">
                    <GenerateButton
                      onClick={handleGenerate}
                      disabled={!isValidUrl}
                    />
                  </div>
                </div>
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
                <LoadingState onComplete={() => setState("presentation")} />
              </motion.div>
            )}

            {state === "presentation" && (
              <motion.div
                key="presentation"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full"
              >
                <PresentationViewer
                  slides={mockPresentation}
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

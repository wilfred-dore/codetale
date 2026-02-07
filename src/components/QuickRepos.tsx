import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { repoSections, type RepoEntry } from "@/config/repos";

interface QuickReposProps {
  onSelectRepo: (url: string) => void;
}

const tabLabels = ["💡 Examples", "🏆 From partners"];

export function QuickRepos({ onSelectRepo }: QuickReposProps) {
  const [activeTab, setActiveTab] = useState(0);

  const handleClick = (repo: RepoEntry) => {
    // Update URL for shareability without using navigate (avoids re-render issues)
    const encoded = encodeURIComponent(repo.url);
    window.history.replaceState(null, "", `/?repo=${encoded}`);
    onSelectRepo(repo.url);
  };

  const section = repoSections[activeTab];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="mt-8 max-w-2xl mx-auto"
    >
      {/* Tab bar */}
      <div className="flex items-center justify-center gap-1 mb-4">
        {tabLabels.map((label, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            className={`relative px-4 py-1.5 text-xs font-mono rounded-full transition-all duration-200 ${
              activeTab === idx
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground/70"
            }`}
            aria-label={`Show ${label} repos`}
          >
            {activeTab === idx && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-secondary border border-border rounded-full"
                transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
              />
            )}
            <span className="relative z-10">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="space-y-2.5"
        >
          <p className="text-xs text-muted-foreground/70 font-mono tracking-wide text-center">
            {section.label}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {section.items.map((repo) => (
              <Tooltip key={repo.url}>
                <TooltipTrigger asChild>
                  <Button
                    variant={section.variant}
                    size={section.size}
                    className={`transition-all duration-200 hover:scale-[1.03] ${
                      section.size === "sm" ? "text-xs" : ""
                    }`}
                    aria-label={`Try ${repo.name} repository`}
                    onClick={() => handleClick(repo)}
                  >
                    <span aria-hidden="true">{repo.emoji}</span>
                    <span>{repo.name}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="font-mono text-xs">
                  {repo.url.replace("https://github.com/", "")}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { repoSections, type RepoEntry } from "@/config/repos";

interface QuickReposProps {
  onSelectRepo: (url: string) => void;
}

const tabOrder = [2, 1, 0]; // Showcase, Partners, Featured Tools

export function QuickRepos({ onSelectRepo }: QuickReposProps) {
  const navigate = useNavigate();
  const tabs = tabOrder.map((i) => repoSections[i]);
  const [activeTab, setActiveTab] = useState(0);

  const handleClick = (repo: RepoEntry) => {
    const encoded = encodeURIComponent(repo.url);
    navigate(`/?repo=${encoded}`, { replace: true });
    onSelectRepo(repo.url);
  };

  // Short tab labels derived from section labels
  const tabLabels = ["💡 Legendary", "🏆 Partners", "⚡ Tools"];

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
            {tabs[activeTab].label}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {tabs[activeTab].items.map((repo) => (
              <Tooltip key={repo.url}>
                <TooltipTrigger asChild>
                  <Button
                    variant={tabs[activeTab].variant}
                    size={tabs[activeTab].size}
                    className={`transition-all duration-200 hover:scale-[1.03] ${
                      tabs[activeTab].size === "sm" ? "text-xs" : ""
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

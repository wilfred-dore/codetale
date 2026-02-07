import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { repoSections, type RepoEntry } from "@/config/repos";

interface QuickReposProps {
  onSelectRepo: (url: string) => void;
}

export function QuickRepos({ onSelectRepo }: QuickReposProps) {
  const navigate = useNavigate();

  const handleClick = (repo: RepoEntry) => {
    const encoded = encodeURIComponent(repo.url);
    navigate(`/?repo=${encoded}`, { replace: true });
    onSelectRepo(repo.url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="mt-8 space-y-6 max-w-2xl mx-auto"
    >
      {repoSections.map((section, sIdx) => (
        <div key={sIdx} className="space-y-2.5">
          <p className="text-xs text-muted-foreground font-mono tracking-wide text-center">
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
        </div>
      ))}
    </motion.div>
  );
}

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { exampleRepos, partnerRepos, type RepoEntry } from "@/config/repos";

interface QuickReposProps {
  onSelectRepo: (url: string) => void;
}

function RepoButton({ repo, onClick }: { repo: RepoEntry; onClick: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="default"
          className="transition-all duration-200 hover:scale-[1.03]"
          aria-label={`Try ${repo.name} repository`}
          onClick={onClick}
        >
          <span aria-hidden="true">{repo.emoji}</span>
          <span>{repo.name}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="font-mono text-xs">
        {repo.url.replace("https://github.com/", "")}
      </TooltipContent>
    </Tooltip>
  );
}

export function QuickRepos({ onSelectRepo }: QuickReposProps) {
  const handleClick = (repo: RepoEntry) => {
    const encoded = encodeURIComponent(repo.url);
    window.history.replaceState(null, "", `/?repo=${encoded}`);
    onSelectRepo(repo.url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="mt-8 max-w-2xl mx-auto space-y-5"
    >
      {/* Explore existing codebases */}
      <div className="space-y-2.5">
        <p className="text-xs text-muted-foreground/70 font-mono tracking-wide text-center">
          Explore existing codebases:
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {exampleRepos.map((repo) => (
            <RepoButton key={repo.url} repo={repo} onClick={() => handleClick(repo)} />
          ))}
        </div>
      </div>

      {/* From partners */}
      <div className="space-y-2.5">
        <p className="text-xs text-muted-foreground/70 font-mono tracking-wide text-center">
          From partners:
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {partnerRepos.map((repo) => (
            <RepoButton key={repo.url} repo={repo} onClick={() => handleClick(repo)} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

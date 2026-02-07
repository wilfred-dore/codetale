import { motion } from "framer-motion";

export type PresentationMode = "developer" | "devrel";

interface ModeSelectorProps {
  mode: PresentationMode;
  onModeChange: (mode: PresentationMode) => void;
}

export function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="flex items-center justify-center">
      <div className="relative flex items-center rounded-xl bg-secondary p-1 gap-1">
        <motion.div
          className="absolute top-1 bottom-1 rounded-lg bg-primary/15 border border-primary/30"
          layoutId="mode-indicator"
          animate={{
            left: mode === "developer" ? "4px" : "calc(50% + 0px)",
            width: "calc(50% - 6px)",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />

        <button
          onClick={() => onModeChange("developer")}
          className={`relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
            mode === "developer" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>📘</span>
          <span>Developer</span>
        </button>

        <button
          onClick={() => onModeChange("devrel")}
          className={`relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
            mode === "devrel" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>📣</span>
          <span>DevRel</span>
        </button>
      </div>
    </div>
  );
}

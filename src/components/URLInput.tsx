import { useState } from "react";
import { motion } from "framer-motion";
import { Github, AlertCircle } from "lucide-react";

interface URLInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const GITHUB_URL_REGEX = /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/;

export function URLInput({ value, onChange, error }: URLInputProps) {
  const [focused, setFocused] = useState(false);

  const isValid = value === "" || GITHUB_URL_REGEX.test(value);
  const showError = error || (value.length > 0 && !isValid);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        className={`relative flex items-center rounded-xl transition-all duration-300 ${
          focused ? "glow-primary" : ""
        } ${showError ? "ring-2 ring-destructive" : ""}`}
        animate={{ scale: focused ? 1.01 : 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="absolute left-4 text-muted-foreground">
          <Github className="w-5 h-5" />
        </div>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="https://github.com/owner/repository"
          className="w-full h-14 pl-12 pr-4 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground font-mono text-sm focus:outline-none focus:border-primary/50 transition-colors"
          spellCheck={false}
        />
      </motion.div>

      {showError && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mt-2 text-destructive text-sm"
        >
          <AlertCircle className="w-4 h-4" />
          <span>{error || "Please enter a valid GitHub repository URL"}</span>
        </motion.div>
      )}
    </div>
  );
}

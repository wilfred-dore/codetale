import { motion } from "framer-motion";
import { BookOpen, Code2 } from "lucide-react";

const partners = [
  { name: "OpenAI", url: "https://openai.com" },
  { name: "Lovable", url: "https://lovable.dev" },
  { name: "fal.ai", url: "https://fal.ai" },
  { name: "Gradium", url: "https://gradium.ai" },
  { name: "Alpic Skybridge", url: "https://skybridge.tech" },
];

export function Hero() {
  return (
    <div className="text-center space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-center gap-2 mb-2"
      >
        <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono glass-subtle px-3 py-1.5 rounded-full flex-wrap justify-center">
          <span className="text-muted-foreground/70">Powered by</span>
          {partners.map((p, i) => (
            <span key={p.name} className="flex items-center gap-1">
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors font-semibold"
              >
                {p.name}
              </a>
              {i < partners.length - 1 && (
                <span className="text-muted-foreground/30">·</span>
              )}
            </span>
          ))}
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-5xl md:text-7xl font-bold tracking-tight"
      >
        <span className="text-foreground">Turn any repo</span>
        <br />
        <span className="gradient-text">into a story</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed"
      >
        Paste a GitHub URL and get a narrated slide deck in seconds.
        Choose between technical deep-dives or DevRel-ready stories.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex items-center justify-center gap-6 text-sm text-muted-foreground"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <span>Auto-narration</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-primary" />
          <span>Code-aware slides</span>
        </div>
      </motion.div>
    </div>
  );
}

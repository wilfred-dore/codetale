import { motion } from "framer-motion";
import { Headphones, BookOpen } from "lucide-react";

interface SlideMediaIndicatorProps {
  hasAudio: boolean;
  isAutoPlaying: boolean;
}

export function SlideMediaIndicator({ hasAudio, isAutoPlaying }: SlideMediaIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-subtle border border-border/30"
    >
      {hasAudio ? (
        <>
          <Headphones className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">
            {isAutoPlaying ? "Listening…" : "Listen"}
          </span>
          {isAutoPlaying && (
            <motion.div className="flex items-center gap-0.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-0.5 bg-primary rounded-full"
                  animate={{ height: [4, 10, 4] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>
          )}
        </>
      ) : (
        <>
          <BookOpen className="w-3.5 h-3.5 text-gold" />
          <span className="text-xs font-medium text-gold">Read</span>
        </>
      )}
    </motion.div>
  );
}

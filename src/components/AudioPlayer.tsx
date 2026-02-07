import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

export function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.5;
        });
      }, 100);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 glass rounded-xl px-4 py-3"
    >
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground hover:brightness-110 transition-all"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </button>

      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden cursor-pointer">
        <motion.div
          className="h-full bg-primary/70 rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      <span className="text-xs text-muted-foreground font-mono min-w-[40px]">
        {formatTime(progress)}
      </span>

      <button
        onClick={() => setIsMuted(!isMuted)}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </button>
    </motion.div>
  );
}

function formatTime(progress: number): string {
  const totalSeconds = Math.floor((progress / 100) * 180);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

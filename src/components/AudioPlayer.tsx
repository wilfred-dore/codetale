import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface AudioPlayerProps {
  src?: string;
  autoPlay?: boolean;
  onEnded?: () => void;
}

export function AudioPlayer({ src, autoPlay = false, onEnded }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Reset state when src changes
  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [src]);

  // Auto-play when src changes and autoPlay is true
  useEffect(() => {
    if (src && autoPlay && audioRef.current) {
      const timer = setTimeout(() => {
        audioRef.current?.play().catch(() => {
          // Autoplay blocked by browser
          console.log("Autoplay blocked by browser policy");
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [src, autoPlay]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !src) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
  }, [isPlaying, src]);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!audioRef.current || !duration) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = pct * duration;
    },
    [duration]
  );

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 glass rounded-xl px-4 py-3"
    >
      {src && (
        <audio
          ref={audioRef}
          src={src}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            setProgress(0);
            onEnded?.();
          }}
          onLoadedMetadata={(e) => {
            setDuration(e.currentTarget.duration);
          }}
          onTimeUpdate={(e) => {
            const ct = e.currentTarget.currentTime;
            const dur = e.currentTarget.duration;
            setCurrentTime(ct);
            setProgress(dur > 0 ? (ct / dur) * 100 : 0);
          }}
        />
      )}

      <button
        onClick={togglePlay}
        disabled={!src}
        className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </button>

      <div
        className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden cursor-pointer"
        onClick={handleSeek}
      >
        <motion.div
          className="h-full bg-primary/70 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      <span className="text-xs text-muted-foreground font-mono min-w-[72px] text-right">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>

      <button
        onClick={toggleMute}
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

import { motion } from "framer-motion";
import { useRef, useEffect } from "react";

interface AvatarPiPProps {
  videoUrl: string;
  isActive: boolean;
}

export function AvatarPiP({ videoUrl, isActive }: AvatarPiPProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isActive, videoUrl]);

  if (!videoUrl) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.7, y: 30 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="absolute bottom-24 right-6 z-20 w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden
        border-2 border-primary/50 shadow-[0_0_40px_hsl(var(--primary)/0.3)]"
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-cover"
        loop
        playsInline
        muted
      />

      {/* Pulsing glow ring when active */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-primary/60"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Subtle label */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-background/80 to-transparent py-1 px-2">
        <span className="text-[9px] font-medium text-muted-foreground tracking-wider uppercase">
          AI Presenter
        </span>
      </div>
    </motion.div>
  );
}

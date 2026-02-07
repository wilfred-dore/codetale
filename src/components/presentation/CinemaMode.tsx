import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { SlideContent } from "@/components/SlideContent";
import type { GeneratedSlide } from "@/types/presentation";

interface CinemaModeProps {
  slides: GeneratedSlide[];
  isActive: boolean;
}

export function CinemaMode({ slides, isActive }: CinemaModeProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [direction, setDirection] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const readingTimer = useRef<ReturnType<typeof setTimeout>>();

  const slide = slides[currentSlide];

  // ── Estimate reading time for non-audio slides ──
  const getReadingMs = useCallback((s: GeneratedSlide) => {
    const words = (s.content + " " + s.title).split(/\s+/).length;
    return Math.max(4000, Math.min(15000, (words / 150) * 60000));
  }, []);

  // ── Navigate to slide ──
  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= slides.length) return;
      setDirection(index > currentSlide ? 1 : -1);
      setCurrentSlide(index);
    },
    [currentSlide, slides.length]
  );

  // ── Advance to next slide ──
  const advanceToNext = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setTimeout(() => goTo(currentSlide + 1), 400);
    } else {
      setIsPlaying(false);
      setShowOverlay(true);
    }
  }, [currentSlide, slides.length, goTo]);

  // ── Audio playback & auto-advance ──
  useEffect(() => {
    // Cleanup previous
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (readingTimer.current) clearTimeout(readingTimer.current);

    if (!isPlaying) return;

    if (slide.audioUrl) {
      const audio = new Audio(slide.audioUrl);
      audio.muted = isMuted;
      audioRef.current = audio;

      audio.onended = () => advanceToNext();
      audio.play().catch(() => console.log("Autoplay blocked"));
    } else {
      audioRef.current = null;
      // No audio → advance after reading time
      readingTimer.current = setTimeout(() => advanceToNext(), getReadingMs(slide));
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
      }
      if (readingTimer.current) clearTimeout(readingTimer.current);
    };
  }, [currentSlide, isPlaying, slide, advanceToNext, getReadingMs, isMuted]);

  // Sync mute state
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = isMuted;
  }, [isMuted]);

  // ── Auto-hide overlay ──
  useEffect(() => {
    if (isPlaying) {
      hideTimer.current = setTimeout(() => setShowOverlay(false), 2500);
    } else {
      setShowOverlay(true);
    }
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [isPlaying, currentSlide]);

  const handleMouseMove = useCallback(() => {
    setShowOverlay(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (isPlaying) {
      hideTimer.current = setTimeout(() => setShowOverlay(false), 2500);
    }
  }, [isPlaying]);

  // ── Play / Pause ──
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      if (audioRef.current) audioRef.current.pause();
    } else {
      // If at the end, restart
      if (currentSlide === slides.length - 1) {
        setCurrentSlide(0);
        setDirection(-1);
      }
      setIsPlaying(true);
    }
  }, [isPlaying, currentSlide, slides.length]);

  // ── Keyboard ──
  useEffect(() => {
    if (!isActive) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(currentSlide + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(currentSlide - 1);
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        setIsMuted((m) => !m);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isActive, togglePlay, goTo, currentSlide]);

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 100 : -100 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d > 0 ? -100 : 100 }),
  };

  const progress = ((currentSlide + 1) / slides.length) * 100;

  return (
    <div className="relative w-full h-full bg-background" onMouseMove={handleMouseMove}>
      {/* ── Slide content ── */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <SlideContent slide={slide} isAutoPlaying={isPlaying} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Big centered play button (when paused) ── */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
          >
            <button
              onClick={togglePlay}
              className="pointer-events-auto group flex items-center gap-3 px-8 py-4 rounded-2xl
                bg-primary/90 backdrop-blur-md text-primary-foreground
                shadow-[0_0_40px_hsl(var(--primary)/0.4)]
                hover:bg-primary hover:shadow-[0_0_60px_hsl(var(--primary)/0.6)]
                hover:scale-105 transition-all duration-300"
            >
              <Play className="w-7 h-7 fill-current" />
              <span className="text-lg font-semibold tracking-wide">
                {currentSlide === 0 ? "Play Story" : "Resume"}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Cinematic overlay controls (appear on hover) ── */}
      <AnimatePresence>
        {showOverlay && isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-0 bottom-0 z-30"
          >
            {/* Gradient fade at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent pointer-events-none" />

            <div className="relative px-6 pb-5 pt-12 space-y-3">
              {/* Progress bar */}
              <div
                className="w-full h-1 bg-secondary/40 rounded-full cursor-pointer group"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = (e.clientX - rect.left) / rect.width;
                  const idx = Math.round(pct * (slides.length - 1));
                  goTo(idx);
                }}
              >
                <motion.div
                  className="h-full bg-primary rounded-full group-hover:h-1.5 transition-all"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Controls row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/20 
                      hover:bg-primary/40 text-primary transition-colors"
                  >
                    <Pause className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setIsMuted((m) => !m)}
                    className="flex items-center justify-center w-8 h-8 rounded-full 
                      hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                <span className="text-xs text-muted-foreground font-mono">
                  {currentSlide + 1} / {slides.length}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top progress line (always visible when playing) ── */}
      {isPlaying && (
        <div className="absolute top-0 left-0 right-0 z-40 h-0.5 bg-secondary/20">
          <motion.div
            className="h-full bg-primary"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      )}
    </div>
  );
}

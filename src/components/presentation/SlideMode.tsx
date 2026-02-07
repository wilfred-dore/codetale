import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SlideContent } from "@/components/SlideContent";
import type { GeneratedSlide } from "@/types/presentation";

interface SlideModeProps {
  slides: GeneratedSlide[];
  isActive: boolean;
}

export function SlideMode({ slides, isActive }: SlideModeProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [playingAudio, setPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const slide = slides[currentSlide];

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= slides.length) return;
      // Stop any playing audio when navigating
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setPlayingAudio(false);
      }
      setDirection(index > currentSlide ? 1 : -1);
      setCurrentSlide(index);
    },
    [currentSlide, slides.length]
  );

  // ── Per-slide audio toggle ──
  const toggleSlideAudio = useCallback(() => {
    if (!slide.audioUrl) return;

    if (playingAudio && audioRef.current) {
      audioRef.current.pause();
      setPlayingAudio(false);
    } else {
      // Create new audio or replay
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      const audio = new Audio(slide.audioUrl);
      audioRef.current = audio;
      audio.onended = () => setPlayingAudio(false);
      audio.play().catch(() => {});
      setPlayingAudio(true);
    }
  }, [slide.audioUrl, playingAudio]);

  // Cleanup on unmount / slide change
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
      }
    };
  }, [currentSlide]);

  // ── Keyboard ──
  useEffect(() => {
    if (!isActive) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(currentSlide + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(currentSlide - 1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isActive, goTo, currentSlide]);

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 150 : -150 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d > 0 ? -150 : 150 }),
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* ── Slide area ── */}
      <div className="flex-1 relative rounded-xl overflow-hidden glass min-h-0">
        <div className="absolute inset-0 dot-grid opacity-20" />

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <SlideContent slide={slide} isAutoPlaying={false} />
          </motion.div>
        </AnimatePresence>

        {/* ── Per-slide audio button ── */}
        {slide.audioUrl && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            onClick={toggleSlideAudio}
            className={`absolute bottom-4 right-4 z-20 flex items-center gap-2 px-3 py-2 rounded-xl
              backdrop-blur-md border transition-all duration-300 ${
                playingAudio
                  ? "bg-primary/20 border-primary/40 text-primary shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
                  : "bg-secondary/60 border-border/30 text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
          >
            {playingAudio ? (
              <>
                <Pause className="w-4 h-4" />
                <span className="text-xs font-medium">Pause</span>
                {/* Audio wave animation */}
                <div className="flex items-center gap-0.5 ml-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-0.5 bg-primary rounded-full"
                      animate={{ height: [3, 10, 3] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }}
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span className="text-xs font-medium">Listen</span>
              </>
            )}
          </motion.button>
        )}

        {/* ── Slide counter ── */}
        <div className="absolute top-3 right-4 z-20">
          <span className="text-xs text-muted-foreground/60 font-mono bg-background/40 backdrop-blur-sm px-2 py-1 rounded-md">
            {currentSlide + 1} / {slides.length}
          </span>
        </div>
      </div>

      {/* ── Bottom controls ── */}
      <div className="shrink-0 mt-3 flex items-center justify-between px-2">
        {/* Left arrow */}
        <Button
          variant="glass"
          size="sm"
          onClick={() => goTo(currentSlide - 1)}
          disabled={currentSlide === 0}
          className="rounded-lg"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Dot indicators */}
        <div className="flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentSlide
                  ? "bg-primary w-6"
                  : i < currentSlide
                  ? "bg-primary/40 w-2"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50 w-2"
              }`}
            />
          ))}
        </div>

        {/* Right arrow */}
        <Button
          variant="glass"
          size="sm"
          onClick={() => goTo(currentSlide + 1)}
          disabled={currentSlide === slides.length - 1}
          className="rounded-lg"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

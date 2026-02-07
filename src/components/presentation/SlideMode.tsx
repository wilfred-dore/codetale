import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";
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
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const slide = slides[currentSlide];

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= slides.length) return;
      setDirection(index > currentSlide ? 1 : -1);
      setCurrentSlide(index);
    },
    [currentSlide, slides.length]
  );

  // ── Auto-play audio when slide changes ──
  useEffect(() => {
    // Stop previous audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.onended = null;
    }
    setIsAudioPlaying(false);

    if (slide.audioUrl) {
      const audio = new Audio(slide.audioUrl);
      audio.muted = isMuted;
      audioRef.current = audio;

      audio.onended = () => setIsAudioPlaying(false);
      audio.onplay = () => setIsAudioPlaying(true);

      // Auto-play audio when landing on slide
      audio.play().catch(() => {
        console.log("Audio autoplay blocked");
      });
    } else {
      audioRef.current = null;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current.onplay = null;
      }
    };
  }, [currentSlide, slide.audioUrl]);

  // Sync mute state to current audio
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = isMuted;
  }, [isMuted]);

  // ── Toggle mute ──
  const toggleMute = useCallback(() => {
    setIsMuted((m) => !m);
  }, []);

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
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        toggleMute();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isActive, goTo, currentSlide, toggleMute]);

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
            <SlideContent slide={slide} isAutoPlaying={isAudioPlaying} />
          </motion.div>
        </AnimatePresence>

        {/* ── Mute/Unmute button (top-left) ── */}
        <div className="absolute top-3 left-4 z-20">
          <button
            onClick={toggleMute}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg 
              bg-background/40 backdrop-blur-sm border border-border/20
              text-muted-foreground hover:text-foreground transition-colors"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span className="text-xs font-mono">{isMuted ? "Muted" : "Audio"}</span>
          </button>
        </div>

        {/* ── Audio playing indicator (bottom-right) ── */}
        {isAudioPlaying && !isMuted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute bottom-4 right-4 z-20 flex items-center gap-2 px-3 py-2 rounded-xl
              bg-primary/15 backdrop-blur-md border border-primary/30"
          >
            <div className="flex items-center gap-0.5">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="w-0.5 bg-primary rounded-full"
                  animate={{ height: [3, 12, 3] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-primary">Narrating…</span>
          </motion.div>
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

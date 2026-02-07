import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX } from "lucide-react";
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

  // ── Stop audio when slide changes (no auto-play) ──
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.onended = null;
      audioRef.current.onplay = null;
    }
    setIsAudioPlaying(false);
    audioRef.current = null;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current.onplay = null;
      }
    };
  }, [currentSlide]);

  // ── Explicit play/pause toggle ──
  const toggleAudio = useCallback(() => {
    if (!slide.audioUrl) return;

    if (isAudioPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
      return;
    }

    // If no audio element or different slide, create new one
    if (!audioRef.current) {
      const audio = new Audio(slide.audioUrl);
      audio.muted = isMuted;
      audioRef.current = audio;
      audio.onended = () => setIsAudioPlaying(false);
    }

    audioRef.current.play().then(() => {
      setIsAudioPlaying(true);
    }).catch(() => {
      console.log("Audio play blocked");
    });
  }, [slide.audioUrl, isAudioPlaying, isMuted]);

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

        {/* ── Slide counter (top-right) ── */}
        <div className="absolute top-3 right-4 z-20">
          <span className="text-xs text-muted-foreground/60 font-mono bg-background/40 backdrop-blur-sm px-2 py-1 rounded-md">
            {currentSlide + 1} / {slides.length}
          </span>
        </div>
      </div>

      {/* ── Audio controls (bottom-right, above nav) ── */}
      {slide.audioUrl && (
        <div className="absolute bottom-16 right-4 z-20 flex items-center gap-1.5">
          <button
            onClick={toggleAudio}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg 
              bg-background/40 backdrop-blur-sm border border-border/20
              text-muted-foreground hover:text-foreground transition-colors"
          >
            {isAudioPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span className="text-xs font-mono">Pause</span>
                {!isMuted && (
                  <div className="flex items-center gap-0.5 ml-0.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-0.5 bg-primary rounded-full"
                        animate={{ height: [3, 10, 3] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="text-xs font-mono">Listen</span>
              </>
            )}
          </button>

          {isAudioPlaying && (
            <button
              onClick={toggleMute}
              className="flex items-center justify-center w-7 h-7 rounded-lg 
                bg-background/40 backdrop-blur-sm border border-border/20
                text-muted-foreground hover:text-foreground transition-colors"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      )}

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

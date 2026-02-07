import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, SkipForward, SkipBack } from "lucide-react";
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
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const readingTimer = useRef<ReturnType<typeof setTimeout>>();
  const readingStartTime = useRef<number>(0);
  const readingDuration = useRef<number>(0);
  const progressInterval = useRef<ReturnType<typeof setInterval>>();

  const slide = slides[currentSlide];

  // ── Reading time estimate for non-audio slides ──
  const getReadingMs = useCallback((s: GeneratedSlide) => {
    const words = (s.content + " " + s.title).split(/\s+/).length;
    return Math.max(4000, Math.min(12000, (words / 150) * 60000));
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

  // ── Advance to next slide — ZERO delay for seamless flow ──
  const advanceToNext = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      goTo(currentSlide + 1);
    } else {
      setIsPlaying(false);
      setShowOverlay(true);
      setAudioProgress(0);
    }
  }, [currentSlide, slides.length, goTo]);

  // ── Track progress for both audio and reading slides ──
  const startProgressTracking = useCallback((durationMs: number, isAudio: boolean) => {
    if (progressInterval.current) clearInterval(progressInterval.current);

    if (isAudio) {
      // For audio: track via audio element timeupdate
      progressInterval.current = setInterval(() => {
        if (audioRef.current && audioRef.current.duration) {
          setAudioProgress(audioRef.current.currentTime / audioRef.current.duration);
        }
      }, 100);
    } else {
      // For reading: track via elapsed time
      readingStartTime.current = Date.now();
      readingDuration.current = durationMs;
      progressInterval.current = setInterval(() => {
        const elapsed = Date.now() - readingStartTime.current;
        setAudioProgress(Math.min(1, elapsed / readingDuration.current));
      }, 50);
    }
  }, []);

  // ── Audio playback & auto-advance — continuous narration ──
  useEffect(() => {
    // Cleanup previous
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.onended = null;
    }
    if (readingTimer.current) clearTimeout(readingTimer.current);
    if (progressInterval.current) clearInterval(progressInterval.current);
    setAudioProgress(0);

    if (!isPlaying) return;

    if (slide.audioUrl) {
      const audio = new Audio(slide.audioUrl);
      audio.muted = isMuted;
      audioRef.current = audio;

      audio.onended = () => advanceToNext();
      audio.play().catch(() => console.log("Autoplay blocked"));

      startProgressTracking(0, true);
    } else {
      audioRef.current = null;
      const duration = getReadingMs(slide);
      startProgressTracking(duration, false);
      readingTimer.current = setTimeout(() => advanceToNext(), duration);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
      }
      if (readingTimer.current) clearTimeout(readingTimer.current);
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [currentSlide, isPlaying, slide, advanceToNext, getReadingMs, isMuted, startProgressTracking]);

  // Sync mute
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = isMuted;
  }, [isMuted]);

  // ── Auto-hide overlay ──
  useEffect(() => {
    if (isPlaying) {
      hideTimer.current = setTimeout(() => setShowOverlay(false), 3000);
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
      hideTimer.current = setTimeout(() => setShowOverlay(false), 3000);
    }
  }, [isPlaying]);

  // ── Play / Pause ──
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      if (audioRef.current) audioRef.current.pause();
      if (readingTimer.current) clearTimeout(readingTimer.current);
      if (progressInterval.current) clearInterval(progressInterval.current);
    } else {
      if (currentSlide === slides.length - 1 && audioProgress >= 0.99) {
        setCurrentSlide(0);
        setDirection(-1);
      }
      setIsPlaying(true);
    }
  }, [isPlaying, currentSlide, slides.length, audioProgress]);

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

  // ── Overall progress (slide-level + within-slide progress) ──
  const overallProgress = ((currentSlide + audioProgress) / slides.length) * 100;

  return (
    <div
      className="relative w-full h-full bg-background"
      onMouseMove={handleMouseMove}
      onClick={() => {
        if (isPlaying && !showOverlay) {
          setShowOverlay(true);
        }
      }}
    >
      {/* ── Slide content with cinematic crossfade ── */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <SlideContent slide={slide} isAutoPlaying={isPlaying} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Big centered play button (when paused & not started) ── */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
          >
            {/* Dim backdrop when paused */}
            <div className="absolute inset-0 bg-background/30 backdrop-blur-[2px]" />
            <button
              onClick={togglePlay}
              className="pointer-events-auto relative z-10 group flex items-center gap-3 px-10 py-5 rounded-2xl
                bg-primary/90 backdrop-blur-md text-primary-foreground
                shadow-[0_0_60px_hsl(var(--primary)/0.5)]
                hover:bg-primary hover:shadow-[0_0_80px_hsl(var(--primary)/0.7)]
                hover:scale-105 transition-all duration-300"
            >
              <Play className="w-8 h-8 fill-current" />
              <span className="text-xl font-bold tracking-wide">
                {currentSlide === 0 && audioProgress < 0.01 ? "Play Story" : "Resume"}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Netflix-style overlay controls (appear on hover/click) ── */}
      <AnimatePresence>
        {showOverlay && isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-x-0 bottom-0 z-30"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none" />

            <div className="relative px-6 pb-5 pt-16 space-y-2">
              {/* Overall progress bar (clickable) */}
              <div
                className="w-full h-1.5 bg-secondary/30 rounded-full cursor-pointer group relative"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = (e.clientX - rect.left) / rect.width;
                  const idx = Math.floor(pct * slides.length);
                  goTo(Math.min(idx, slides.length - 1));
                }}
              >
                {/* Slide markers */}
                {slides.map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-0 w-px h-full bg-muted-foreground/20"
                    style={{ left: `${(i / slides.length) * 100}%` }}
                  />
                ))}
                <motion.div
                  className="h-full bg-primary rounded-full relative"
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 0.15, ease: "linear" }}
                >
                  {/* Scrubber dot */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary 
                    shadow-[0_0_10px_hsl(var(--primary)/0.6)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              </div>

              {/* Controls row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Skip back */}
                  <button
                    onClick={() => goTo(currentSlide - 1)}
                    disabled={currentSlide === 0}
                    className="flex items-center justify-center w-8 h-8 rounded-full 
                      hover:bg-secondary/50 text-muted-foreground hover:text-foreground 
                      transition-colors disabled:opacity-30"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  {/* Play/Pause */}
                  <button
                    onClick={togglePlay}
                    className="flex items-center justify-center w-10 h-10 rounded-full 
                      bg-primary/20 hover:bg-primary/40 text-primary transition-colors"
                  >
                    <Pause className="w-5 h-5" />
                  </button>

                  {/* Skip forward */}
                  <button
                    onClick={() => goTo(currentSlide + 1)}
                    disabled={currentSlide === slides.length - 1}
                    className="flex items-center justify-center w-8 h-8 rounded-full 
                      hover:bg-secondary/50 text-muted-foreground hover:text-foreground 
                      transition-colors disabled:opacity-30"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>

                  {/* Volume */}
                  <button
                    onClick={() => setIsMuted((m) => !m)}
                    className="flex items-center justify-center w-8 h-8 rounded-full 
                      hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                {/* Slide info */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground font-mono">
                    {currentSlide + 1} / {slides.length}
                  </span>

                  {/* Audio wave when playing audio */}
                  {slide.audioUrl && !isMuted && (
                    <div className="flex items-center gap-0.5">
                      {[0, 1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          className="w-0.5 bg-primary rounded-full"
                          animate={{ height: [2, 8, 2] }}
                          transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.08 }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Thin top progress line (always visible when playing) ── */}
      {isPlaying && !showOverlay && (
        <div className="absolute top-0 left-0 right-0 z-40 h-0.5 bg-secondary/20">
          <motion.div
            className="h-full bg-primary"
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.15, ease: "linear" }}
          />
        </div>
      )}
    </div>
  );
}

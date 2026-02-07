import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  RotateCcw,
  FileDown,
  Maximize,
  Minimize,
  Play,
  Pause,
  SkipForward,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SlideContent } from "@/components/SlideContent";
import type { PresentationData } from "@/types/presentation";

interface PresentationViewerProps {
  presentation: PresentationData;
  onNewStory: () => void;
}

export function PresentationViewer({ presentation, onNewStory }: PresentationViewerProps) {
  const { slides, repoInfo } = presentation;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout>>();

  const slide = slides[currentSlide];

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= slides.length) return;
      setDirection(index > currentSlide ? 1 : -1);
      setCurrentSlide(index);
    },
    [currentSlide, slides.length]
  );

  // ── Audio playback tied to current slide ──
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (slide.audioUrl) {
      const audio = new Audio(slide.audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        if (isAutoPlaying && currentSlide < slides.length - 1) {
          setTimeout(() => goTo(currentSlide + 1), 600);
        } else if (currentSlide === slides.length - 1) {
          setIsAutoPlaying(false);
          setShowControls(true);
        }
      };

      if (isAutoPlaying) {
        audio.play().catch(() => {
          console.log("Autoplay blocked by browser");
        });
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
      }
    };
  }, [currentSlide, slide.audioUrl]);

  // Update audio onended when isAutoPlaying changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => {
        if (isAutoPlaying && currentSlide < slides.length - 1) {
          setTimeout(() => goTo(currentSlide + 1), 600);
        } else if (currentSlide === slides.length - 1) {
          setIsAutoPlaying(false);
          setShowControls(true);
        }
      };
    }
  }, [isAutoPlaying, currentSlide, slides.length, goTo]);

  // ── Auto-hide controls in QWiki mode ──
  useEffect(() => {
    if (isAutoPlaying) {
      hideControlsTimer.current = setTimeout(() => setShowControls(false), 2500);
    } else {
      setShowControls(true);
    }
    return () => {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    };
  }, [isAutoPlaying, currentSlide]);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    if (isAutoPlaying) {
      hideControlsTimer.current = setTimeout(() => setShowControls(false), 2500);
    }
  }, [isAutoPlaying]);

  // ── QWiki Play/Pause ──
  const toggleAutoPlay = useCallback(() => {
    if (isAutoPlaying) {
      setIsAutoPlaying(false);
      setShowControls(true);
      if (audioRef.current) audioRef.current.pause();
    } else {
      setIsAutoPlaying(true);
      // If at the end, restart from beginning
      if (currentSlide === slides.length - 1) {
        setCurrentSlide(0);
        setDirection(-1);
      }
      // Play current audio
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [isAutoPlaying, currentSlide, slides.length]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(currentSlide + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(currentSlide - 1);
      } else if (e.key === " ") {
        e.preventDefault();
        toggleAutoPlay();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentSlide, goTo, toggleAutoPlay]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // ── Export as standalone HTML ──
  const handleDownloadHTML = useCallback(() => {
    const slidesHTML = slides
      .map(
        (s, i) => `
      <section class="slide" id="slide-${i}" style="display:${i === 0 ? "flex" : "none"}">
        ${s.imageUrl ? `<img src="${s.imageUrl}" class="slide-bg" alt="" />` : ""}
        <div class="slide-overlay"></div>
        <div class="slide-content">
          <h2>${s.title}</h2>
          <div class="slide-body">${s.content.replace(/\n/g, "<br/>")}</div>
        </div>
        ${s.audioUrl ? `<audio id="audio-${i}" src="${s.audioUrl}"></audio>` : ""}
      </section>`
      )
      .join("\n");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${repoInfo.name} – CodeTale Presentation</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#0d1117;color:#f0f4f8;font-family:'Segoe UI',system-ui,sans-serif;overflow:hidden}
    .slide{position:relative;width:100vw;height:100vh;display:none;align-items:center;justify-content:center;flex-direction:column}
    .slide[style*="flex"]{display:flex!important}
    .slide-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.15}
    .slide-overlay{position:absolute;inset:0;background:linear-gradient(to top,#0d1117,#0d111790,#0d111770)}
    .slide-content{position:relative;z-index:1;max-width:800px;padding:2rem;text-align:center}
    h2{font-size:2.5rem;margin-bottom:1rem;background:linear-gradient(135deg,#38bdf8,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
    .slide-body{font-size:1.1rem;line-height:1.8;color:#94a3b8}
    .nav{position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);display:flex;gap:1rem;z-index:10}
    .nav button{padding:.5rem 1.5rem;border:1px solid #38bdf844;border-radius:.5rem;background:#1e293b;color:#f0f4f8;cursor:pointer;font-size:.9rem}
    .nav button:hover{background:#334155}
    .counter{position:fixed;top:1rem;right:1.5rem;color:#64748b;font-family:monospace;z-index:10}
  </style>
</head>
<body>
  ${slidesHTML}
  <div class="counter" id="counter">1 / ${slides.length}</div>
  <div class="nav">
    <button onclick="prev()">← Previous</button>
    <button onclick="next()">Next →</button>
  </div>
  <script>
    let c=0,slides=document.querySelectorAll('.slide'),counter=document.getElementById('counter');
    function show(i){slides.forEach((s,j)=>s.style.display=j===i?'flex':'none');counter.textContent=(i+1)+' / '+slides.length;
      const a=document.getElementById('audio-'+i);if(a){a.currentTime=0;a.play().catch(()=>{});}
    }
    function next(){if(c<slides.length-1){c++;show(c);}}
    function prev(){if(c>0){c--;show(c);}}
    document.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key===' ')next();if(e.key==='ArrowLeft')prev();});
  </script>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${repoInfo.name}-presentation.html`;
    a.click();
    URL.revokeObjectURL(url);
  }, [slides, repoInfo]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 200 : -200,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: dir > 0 ? -200 : 200,
      opacity: 0,
    }),
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onMouseMove={handleMouseMove}
      className={`relative flex flex-col w-full ${
        isFullscreen
          ? "h-screen bg-background"
          : "h-full min-h-[80vh] max-w-6xl mx-auto"
      }`}
    >
      {/* ── Slide Area (takes full space) ── */}
      <div className="flex-1 relative rounded-2xl overflow-hidden glass min-h-0">
        <div className="absolute inset-0 dot-grid opacity-20" />

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <SlideContent slide={slide} />
          </motion.div>
        </AnimatePresence>

        {/* ── QWiki-style centered play button (shown when not auto-playing) ── */}
        <AnimatePresence>
          {!isAutoPlaying && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
            >
              <button
                onClick={toggleAutoPlay}
                className="pointer-events-auto group flex items-center gap-3 px-8 py-4 rounded-2xl
                  bg-primary/90 backdrop-blur-md text-primary-foreground
                  shadow-[0_0_40px_hsl(var(--primary)/0.4)]
                  hover:bg-primary hover:shadow-[0_0_60px_hsl(var(--primary)/0.6)]
                  hover:scale-105 transition-all duration-300"
              >
                <Play className="w-7 h-7 fill-current" />
                <span className="text-lg font-semibold tracking-wide">Play Story</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Cinematic progress bar at top ── */}
        {isAutoPlaying && (
          <div className="absolute top-0 left-0 right-0 z-30 h-1 bg-secondary/30">
            <motion.div
              className="h-full bg-primary"
              animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}

        {/* ── Slide counter overlay ── */}
        <div className="absolute top-3 right-4 z-30">
          <span className="text-xs text-muted-foreground/60 font-mono bg-background/40 backdrop-blur-sm px-2 py-1 rounded-md">
            {currentSlide + 1} / {slides.length}
          </span>
        </div>
      </div>

      {/* ── Bottom controls bar ── */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
            className="shrink-0 mt-3 flex items-center justify-between gap-3 px-2"
          >
            {/* Left: nav + repo info */}
            <div className="flex items-center gap-2">
              {!isFullscreen && (
                <Button variant="glass" size="sm" onClick={onNewStory} className="rounded-lg">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="glass"
                size="sm"
                onClick={() => goTo(currentSlide - 1)}
                disabled={currentSlide === 0}
                className="rounded-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>

            {/* Center: play/pause + dots */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleAutoPlay}
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                  isAutoPlaying
                    ? "bg-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
                    : "bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground"
                }`}
              >
                {isAutoPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" />
                )}
              </button>

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
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            {/* Right: export + fullscreen */}
            <div className="flex items-center gap-2">
              {!isFullscreen && (
                <>
                  <Button variant="glass" size="sm" onClick={handleDownloadHTML} className="rounded-lg">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="glass" size="sm" onClick={handlePrint} className="rounded-lg">
                    <FileDown className="w-4 h-4" />
                  </Button>
                </>
              )}
              <Button variant="glass" size="sm" onClick={toggleFullscreen} className="rounded-lg">
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

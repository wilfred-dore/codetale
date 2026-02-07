import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Download, RotateCcw, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/AudioPlayer";
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
  const [autoAdvance, setAutoAdvance] = useState(true);

  const slide = slides[currentSlide];

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= slides.length) return;
      setDirection(index > currentSlide ? 1 : -1);
      setCurrentSlide(index);
    },
    [currentSlide, slides.length]
  );

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goTo(currentSlide + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(currentSlide - 1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentSlide, goTo]);

  const handleAudioEnded = useCallback(() => {
    if (autoAdvance && currentSlide < slides.length - 1) {
      setTimeout(() => goTo(currentSlide + 1), 800);
    }
  }, [autoAdvance, currentSlide, slides.length, goTo]);

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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full min-h-[80vh] max-w-6xl mx-auto w-full gap-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-2 flex-wrap gap-2">
        <Button variant="glass" size="sm" onClick={onNewStory} className="rounded-lg">
          <RotateCcw className="w-4 h-4 mr-2" />
          New Story
        </Button>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
            {repoInfo.fullName}
          </span>
          <span className="text-xs text-muted-foreground font-mono glass-subtle px-2 py-0.5 rounded-full">
            ⭐ {repoInfo.stars.toLocaleString()}
          </span>
          <div className="flex items-center gap-1 text-sm text-muted-foreground font-mono">
            <span className="text-primary">{currentSlide + 1}</span>
            <span>/</span>
            <span>{slides.length}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="glass" size="sm" onClick={handleDownloadHTML} className="rounded-lg">
            <Download className="w-4 h-4 mr-2" />
            HTML
          </Button>
          <Button variant="glass" size="sm" onClick={handlePrint} className="rounded-lg">
            <FileDown className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Slide Area */}
      <div className="flex-1 relative rounded-2xl overflow-hidden glass min-h-[50vh]">
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
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3">
        {/* Audio */}
        <AudioPlayer
          src={slide.audioUrl || undefined}
          autoPlay={autoAdvance}
          onEnded={handleAudioEnded}
        />

        {/* Navigation */}
        <div className="flex items-center justify-between px-2">
          <Button
            variant="glass"
            size="sm"
            onClick={() => goTo(currentSlide - 1)}
            disabled={currentSlide === 0}
            className="rounded-lg"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          {/* Dot indicators */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === currentSlide
                    ? "bg-primary w-6"
                    : i < currentSlide
                    ? "bg-primary/40"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
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
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

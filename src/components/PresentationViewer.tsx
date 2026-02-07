import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { PresentationData } from "@/types/presentation";
import { ModeSelectionScreen, type ViewMode } from "@/components/presentation/ModeSelectionScreen";
import { PresentationTopBar } from "@/components/presentation/PresentationTopBar";
import { CinemaMode } from "@/components/presentation/CinemaMode";
import { SlideMode } from "@/components/presentation/SlideMode";

interface PresentationViewerProps {
  presentation: PresentationData;
  onNewStory: () => void;
}

export function PresentationViewer({ presentation, onNewStory }: PresentationViewerProps) {
  const { slides, repoInfo } = presentation;
  const [viewMode, setViewMode] = useState<ViewMode | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Fullscreen toggle ──
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

  // ── Keyboard: F for fullscreen ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === "f" || e.key === "F") && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleFullscreen]);

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

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col w-full ${
        isFullscreen
          ? "h-screen bg-background"
          : "h-full min-h-[80vh] max-w-6xl mx-auto"
      }`}
    >
      <AnimatePresence mode="wait">
        {/* ── Mode Selection Screen ── */}
        {viewMode === null && (
          <motion.div
            key="selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex items-center justify-center"
          >
            <ModeSelectionScreen
              repoName={repoInfo.name}
              onSelect={setViewMode}
            />
          </motion.div>
        )}

        {/* ── Active Presentation Mode ── */}
        {viewMode !== null && (
          <motion.div
            key="viewer"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col flex-1 min-h-0"
          >
            {/* Top bar */}
            <PresentationTopBar
              repoInfo={repoInfo}
              viewMode={viewMode}
              onModeChange={setViewMode}
              onNewStory={onNewStory}
              onDownloadHTML={handleDownloadHTML}
              isFullscreen={isFullscreen}
              onToggleFullscreen={toggleFullscreen}
            />

            {/* Mode content */}
            <div className="flex-1 min-h-0">
              <AnimatePresence mode="wait">
                {viewMode === "cinema" && (
                  <motion.div
                    key="cinema"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full"
                  >
                    <CinemaMode slides={slides} isActive={viewMode === "cinema"} />
                  </motion.div>
                )}
                {viewMode === "slides" && (
                  <motion.div
                    key="slides"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full"
                  >
                    <SlideMode slides={slides} isActive={viewMode === "slides"} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

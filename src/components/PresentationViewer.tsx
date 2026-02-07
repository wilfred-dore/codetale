import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/AudioPlayer";
import type { Slide } from "@/data/mockPresentation";

interface PresentationViewerProps {
  slides: Slide[];
  onNewStory: () => void;
}

export function PresentationViewer({ slides, onNewStory }: PresentationViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  const slide = slides[currentSlide];

  const goTo = (index: number) => {
    if (index < 0 || index >= slides.length) return;
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

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
      <div className="flex items-center justify-between px-2">
        <Button variant="glass" size="sm" onClick={onNewStory} className="rounded-lg">
          <RotateCcw className="w-4 h-4 mr-2" />
          New Story
        </Button>

        <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
          <span className="text-primary">{currentSlide + 1}</span>
          <span>/</span>
          <span>{slides.length}</span>
        </div>

        <Button variant="glass" size="sm" className="rounded-lg">
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>

      {/* Slide Area */}
      <div className="flex-1 relative rounded-2xl overflow-hidden glass">
        <div className="absolute inset-0 dot-grid opacity-30" />

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={slide.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center p-8 md:p-16"
          >
            <div className="text-center max-w-3xl space-y-6">
              {slide.icon && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="text-5xl"
                >
                  {slide.icon}
                </motion.div>
              )}

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`font-bold tracking-tight ${
                  slide.type === "title"
                    ? "text-4xl md:text-6xl gradient-text"
                    : "text-2xl md:text-4xl text-foreground"
                }`}
              >
                {slide.title}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`leading-relaxed ${
                  slide.type === "title"
                    ? "text-lg text-muted-foreground"
                    : "text-base text-secondary-foreground"
                }`}
              >
                {slide.content}
              </motion.p>

              {slide.code && (
                <motion.pre
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-left bg-background/80 rounded-xl p-6 text-sm font-mono text-secondary-foreground overflow-x-auto border border-border"
                >
                  <code>{slide.code}</code>
                </motion.pre>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3">
        {/* Audio */}
        <AudioPlayer />

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

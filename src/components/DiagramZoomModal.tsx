import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn } from "lucide-react";
import { useCallback, useEffect } from "react";

interface DiagramZoomModalProps {
  svgHtml: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DiagramZoomModal({ svgHtml, isOpen, onClose }: DiagramZoomModalProps) {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Close on backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md"
          onClick={handleBackdropClick}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 flex items-center justify-center w-10 h-10 
              rounded-full bg-secondary/50 hover:bg-secondary text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Zoomed diagram */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative max-w-[90vw] max-h-[90vh] overflow-auto p-6 rounded-2xl
              border border-border/30 bg-secondary/20 backdrop-blur-sm
              [&_svg]:w-full [&_svg]:h-auto [&_svg]:min-h-[50vh] [&_svg]:max-h-[85vh]
              [&_.nodeLabel]:text-base [&_.edgeLabel]:text-sm"
            dangerouslySetInnerHTML={{ __html: svgHtml }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * A wrapper hint that shows a zoom icon on hover for diagram containers.
 */
export function ZoomHint() {
  return (
    <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 
      rounded-md bg-background/60 backdrop-blur-sm text-muted-foreground text-xs
      opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
      <ZoomIn className="w-3 h-3" />
      Click to zoom
    </div>
  );
}

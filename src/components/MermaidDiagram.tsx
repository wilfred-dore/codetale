import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ZoomIn } from "lucide-react";
import { DiagramZoomModal } from "@/components/DiagramZoomModal";

interface MermaidDiagramProps {
  chart: string;
}

/**
 * Sanitize Mermaid chart syntax to fix common AI-generated issues.
 */
function sanitizeMermaidChart(raw: string): string {
  let sanitized = raw.replace(
    /(\w+)\[(?!")([^\]]*\([^\]]*)\]/g,
    (_, id, content) => `${id}["${content}"]`
  );

  sanitized = sanitized.replace(
    /\|([^|]*)\(([^)]*)\)([^|]*)\|/g,
    (_, before, inner, after) => `|${before}${inner}${after}|`
  );

  return sanitized;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function renderDiagram() {
      const offscreen = document.createElement("div");
      offscreen.style.position = "absolute";
      offscreen.style.left = "-9999px";
      offscreen.style.top = "-9999px";
      offscreen.style.visibility = "hidden";
      document.body.appendChild(offscreen);

      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            primaryColor: "#38bdf8",
            primaryTextColor: "#f0f4f8",
            primaryBorderColor: "#38bdf8",
            lineColor: "#64748b",
            secondaryColor: "#7c3aed",
            tertiaryColor: "#1e293b",
            background: "#0f172a",
            mainBkg: "#1e293b",
            nodeBorder: "#38bdf8",
            clusterBkg: "#1e293b",
            titleColor: "#f0f4f8",
            edgeLabelBackground: "#1e293b",
          },
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 16,
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: "basis",
            padding: 20,
            nodeSpacing: 40,
            rankSpacing: 60,
          },
        });

        const sanitized = sanitizeMermaidChart(chart);
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

        const { svg: renderedSvg } = await mermaid.render(id, sanitized, offscreen);

        if (!cancelled) {
          setSvg(renderedSvg);
          setError(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
        }
      } finally {
        offscreen.remove();
        document.querySelectorAll('[id^="d"]').forEach((el) => {
          if (el.classList.contains("mermaid") || el.querySelector(".error-icon")) {
            el.remove();
          }
        });
        document.querySelectorAll("#d-mermaid, .mermaid-error, [data-mermaid-error]").forEach((el) => el.remove());
      }
    }

    renderDiagram();
    return () => { cancelled = true; };
  }, [chart]);

  const handleZoom = useCallback(() => {
    if (svg) setIsZoomed(true);
  }, [svg]);

  if (error || !svg) {
    return null;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        ref={containerRef}
        onClick={handleZoom}
        className="group relative flex items-center justify-center w-full overflow-x-auto py-4 cursor-pointer
          [&_svg]:w-full [&_svg]:min-h-[300px] [&_svg]:max-h-[70vh] [&_svg]:h-auto
          [&_.nodeLabel]:text-sm [&_.edgeLabel]:text-xs
          rounded-xl border border-border/30 bg-secondary/20 p-6
          hover:border-primary/30 hover:shadow-[0_0_20px_hsl(var(--primary)/0.1)] transition-all duration-300"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      {/* Zoom hint */}
      <div className="flex items-center justify-center gap-1 mt-1 text-xs text-muted-foreground/50">
        <ZoomIn className="w-3 h-3" />
        <span>Click to zoom</span>
      </div>

      {/* Zoom modal */}
      <DiagramZoomModal
        svgHtml={svg}
        isOpen={isZoomed}
        onClose={() => setIsZoomed(false)}
      />
    </>
  );
}

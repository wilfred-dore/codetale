import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface MermaidDiagramProps {
  chart: string;
}

/**
 * Sanitize Mermaid chart syntax to fix common AI-generated issues:
 * - Escape parentheses inside node labels: A[Label (thing)] → A["Label (thing)"]
 * - Remove problematic characters
 */
function sanitizeMermaidChart(raw: string): string {
  // Replace node labels containing parentheses: X[...(...)] → X["...(...)"]
  // Match: identifier[content with parens] but NOT already quoted ["..."]
  let sanitized = raw.replace(
    /(\w+)\[(?!")([^\]]*\([^\]]*)\]/g,
    (_, id, content) => `${id}["${content}"]`
  );

  // Also handle edge labels with parentheses: -->|label (x)| → -->|label - x|
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

  useEffect(() => {
    let cancelled = false;

    async function renderDiagram() {
      // Create an offscreen container so Mermaid error SVGs never show in the page
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
        // Silently hide broken diagrams
        if (!cancelled) {
          setError(true);
        }
      } finally {
        // Always clean up offscreen container and any error SVGs Mermaid left behind
        offscreen.remove();
        // Mermaid v11 sometimes inserts error elements directly into body
        document.querySelectorAll('[id^="d"]').forEach((el) => {
          if (el.classList.contains("mermaid") || el.querySelector(".error-icon")) {
            el.remove();
          }
        });
        // Also clean up Mermaid's error text containers
        document.querySelectorAll("#d-mermaid, .mermaid-error, [data-mermaid-error]").forEach((el) => el.remove());
      }
    }

    renderDiagram();
    return () => { cancelled = true; };
  }, [chart]);

  // Hide entirely when there's an error — no ugly fallback
  if (error || !svg) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      ref={containerRef}
      className="flex items-center justify-center w-full overflow-x-auto py-4
        [&_svg]:w-full [&_svg]:min-h-[300px] [&_svg]:max-h-[70vh] [&_svg]:h-auto
        [&_.nodeLabel]:text-sm [&_.edgeLabel]:text-xs
        rounded-xl border border-border/30 bg-secondary/20 p-6"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

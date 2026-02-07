import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface MermaidDiagramProps {
  chart: string;
}

/**
 * Sanitize Mermaid chart syntax to fix common AI-generated issues:
 * - Escape parentheses inside node labels: A[Label (thing)] → A["Label (thing)"]
 * - Fix unquoted special characters
 */
function sanitizeMermaidChart(raw: string): string {
  // Replace node labels containing parentheses: X[...(...)] → X["...(...)"]
  // Match: identifier[content with parens] but NOT already quoted ["..."]
  return raw.replace(
    /(\w+)\[(?!")([^\]]*\([^\]]*)\]/g,
    (_, id, content) => `${id}["${content}"]`
  );
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function renderDiagram() {
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

        // Try rendering with sanitized chart first
        const sanitized = sanitizeMermaidChart(chart);
        const id = `mermaid-${Date.now()}`;

        let renderedSvg: string;
        try {
          const result = await mermaid.render(id, sanitized);
          renderedSvg = result.svg;
        } catch (firstErr) {
          // If sanitized version still fails, the chart is too broken — show fallback
          console.warn("Mermaid render failed even after sanitization:", firstErr);
          if (!cancelled) setError(true);
          return;
        }

        if (!cancelled) {
          setSvg(renderedSvg);
          setError(false);
        }
      } catch (err) {
        console.error("Mermaid init error:", err);
        if (!cancelled) {
          setError(true);
        }
      }
    }

    renderDiagram();
    return () => { cancelled = true; };
  }, [chart]);

  if (error) {
    return null; // Hide broken diagrams entirely
  }

  if (!svg) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
        Loading diagram...
      </div>
    );
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

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface MermaidDiagramProps {
  chart: string;
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
          fontSize: 14,
        });

        const id = `mermaid-${Date.now()}`;
        const { svg: renderedSvg } = await mermaid.render(id, chart);

        if (!cancelled) {
          setSvg(renderedSvg);
          setError(false);
        }
      } catch (err) {
        console.error("Mermaid render error:", err);
        if (!cancelled) {
          setError(true);
        }
      }
    }

    renderDiagram();
    return () => { cancelled = true; };
  }, [chart]);

  if (error) {
    return (
      <pre className="text-xs text-muted-foreground bg-secondary/50 rounded-lg p-4 overflow-x-auto">
        <code>{chart}</code>
      </pre>
    );
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
        [&_svg]:max-w-full [&_svg]:max-h-[50vh] [&_svg]:w-auto [&_svg]:h-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

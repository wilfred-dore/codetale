import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { MermaidDiagram } from "@/components/MermaidDiagram";
import type { GeneratedSlide } from "@/types/presentation";
import { motion } from "framer-motion";

interface SlideContentProps {
  slide: GeneratedSlide;
}

const SLIDE_ICONS: Record<string, string> = {
  hook: "🎯",
  overview: "📖",
  architecture: "🏗️",
  features: "✨",
  code: "⚙️",
  impact: "🚀",
};

export function SlideContent({ slide }: SlideContentProps) {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center px-6 md:px-12 py-8 overflow-y-auto">
      {/* Background image */}
      {slide.imageUrl && (
        <div className="absolute inset-0 z-0">
          <img
            src={slide.imageUrl}
            alt=""
            className="w-full h-full object-cover opacity-40"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/50" />
        </div>
      )}

      <div className="relative z-10 max-w-3xl w-full space-y-6 text-center">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl"
        >
          {SLIDE_ICONS[slide.type] || "📄"}
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`font-bold tracking-tight ${
            slide.type === "hook"
              ? "text-3xl md:text-5xl gradient-text"
              : "text-2xl md:text-4xl text-foreground"
          }`}
        >
          {slide.title}
        </motion.h2>

        {/* Mermaid diagram */}
        {slide.mermaidDiagram && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <MermaidDiagram chart={slide.mermaidDiagram} />
          </motion.div>
        )}

        {/* Markdown content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-left prose prose-invert prose-sm md:prose-base max-w-none
            prose-headings:text-foreground prose-p:text-secondary-foreground
            prose-strong:text-primary prose-a:text-primary
            prose-li:text-secondary-foreground prose-code:text-primary
            prose-code:bg-secondary/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-transparent prose-pre:p-0"
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                const inline = !match && !className;
                if (inline) {
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }
                return (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match?.[1] || "text"}
                    PreTag="div"
                    customStyle={{
                      borderRadius: "0.75rem",
                      fontSize: "0.8rem",
                      margin: "1rem 0",
                      border: "1px solid hsl(228 12% 18%)",
                    }}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                );
              },
            }}
          >
            {slide.content}
          </ReactMarkdown>
        </motion.div>
      </div>
    </div>
  );
}

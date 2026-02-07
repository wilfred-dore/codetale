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

export function SlideContent({ slide }: SlideContentProps) {
  const hasImage = !!slide.imageUrl;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center px-6 md:px-12 py-8 overflow-y-auto">
      {/* Subtle background image wash */}
      {hasImage && (
        <div className="absolute inset-0 z-0">
          <img
            src={slide.imageUrl}
            alt=""
            className="w-full h-full object-cover opacity-15 blur-sm"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/70" />
        </div>
      )}

      <div className="relative z-10 max-w-3xl w-full space-y-6 text-center">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`font-bold tracking-tight ${
            slide.type === "hook"
              ? "text-3xl md:text-5xl gradient-text"
              : "text-2xl md:text-4xl text-foreground"
          }`}
        >
          {slide.title}
        </motion.h2>

        {/* Foreground image */}
        {hasImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="w-full max-w-2xl mx-auto rounded-xl overflow-hidden border border-white/10 shadow-2xl"
          >
            <img
              src={slide.imageUrl}
              alt={slide.visualDescription || slide.title}
              className="w-full h-auto object-cover max-h-[280px] md:max-h-[320px]"
              loading="lazy"
            />
          </motion.div>
        )}

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

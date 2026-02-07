import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { MermaidDiagram } from "@/components/MermaidDiagram";
import { AnimatedStats } from "@/components/AnimatedStats";
import { KenBurnsImage } from "@/components/KenBurnsImage";
import type { GeneratedSlide } from "@/types/presentation";
import { motion } from "framer-motion";
import { SlideMediaIndicator } from "@/components/SlideMediaIndicator";

interface SlideContentProps {
  slide: GeneratedSlide;
  isAutoPlaying?: boolean;
  hideMediaIndicator?: boolean;
}

export function SlideContent({ slide, isAutoPlaying = false, hideMediaIndicator = false }: SlideContentProps) {
  const hasImage = !!slide.imageUrl;
  const hasRepoMedia = slide.repoMediaUrls && slide.repoMediaUrls.length > 0;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-start px-6 md:px-12 py-4 overflow-y-auto">
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

      <div className="relative z-10 max-w-3xl w-full space-y-3 text-center py-2">
        {/* Media indicator (hidden in cinema mode) */}
        {!hideMediaIndicator && (
          <div className="flex justify-center">
            <SlideMediaIndicator hasAudio={!!slide.audioUrl} isAutoPlaying={isAutoPlaying} />
          </div>
        )}

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

        {/* Animated stats (when numbers are present) */}
        {slide.stats && slide.stats.length > 0 && (
          <AnimatedStats stats={slide.stats} />
        )}

        {/* Foreground image with Ken Burns animation */}
        {hasImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="w-full max-w-2xl mx-auto rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black/20 max-h-[280px] md:max-h-[360px]"
          >
            <KenBurnsImage
              src={slide.imageUrl}
              alt={slide.visualDescription || slide.title}
              isPlaying={isAutoPlaying}
            />
          </motion.div>
        )}

        {/* Repo media gallery (real screenshots/demos from repo) */}
        {hasRepoMedia && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-2xl mx-auto"
          >
            <div className={`grid gap-2 ${
              slide.repoMediaUrls!.length === 1 ? "grid-cols-1" :
              slide.repoMediaUrls!.length === 2 ? "grid-cols-2" :
              "grid-cols-2 md:grid-cols-3"
            }`}>
              {slide.repoMediaUrls!.slice(0, 4).map((url, i) => {
                const isVideo = /\.(mp4|webm|mov)(\?|$)/i.test(url);
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.25 + i * 0.1 }}
                    className="rounded-lg overflow-hidden border border-white/10 shadow-lg"
                  >
                    {isVideo ? (
                      <video
                        src={url}
                        className="w-full h-auto max-h-[200px] object-contain bg-black/20"
                        muted
                        autoPlay
                        loop
                        playsInline
                      />
                    ) : (
                      <img
                        src={url}
                        alt={`Repository media ${i + 1}`}
                        className="w-full h-auto max-h-[200px] object-contain bg-black/20"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLElement).parentElement!.style.display = 'none';
                        }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
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

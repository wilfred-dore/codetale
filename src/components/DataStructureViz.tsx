import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DataStructureAnimation, DSNode, DSEdge } from "@/types/presentation";

interface DataStructureVizProps {
  animation: DataStructureAnimation;
  isPlaying?: boolean;
  durationMs?: number;
}

export function DataStructureViz({ animation, isPlaying = false, durationMs }: DataStructureVizProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const totalDuration = durationMs || animation.steps.length * 2500;
  const stepDuration = totalDuration / animation.steps.length;
  const step = animation.steps[currentStep];

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setCurrentStep(0);
    timerRef.current = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= animation.steps.length - 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return prev;
        }
        return prev + 1;
      });
    }, stepDuration);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, animation.steps.length, stepDuration]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full max-w-2xl mx-auto space-y-3"
    >
      {/* Visualization area */}
      <div className="relative rounded-xl border border-border/50 bg-secondary/20 p-6 min-h-[200px] flex items-center justify-center overflow-hidden">
        {animation.type === "array" || animation.type === "stack" || animation.type === "queue" ? (
          <ArrayViz nodes={step.nodes} type={animation.type} />
        ) : animation.type === "tree" ? (
          <TreeViz nodes={step.nodes} edges={step.edges} />
        ) : animation.type === "graph" ? (
          <GraphViz nodes={step.nodes} edges={step.edges} />
        ) : animation.type === "linked-list" ? (
          <LinkedListViz nodes={step.nodes} />
        ) : (
          <ArrayViz nodes={step.nodes} type="array" />
        )}
      </div>

      {/* Caption */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
          className="text-center"
        >
          <p className="text-sm text-muted-foreground">
            <span className="text-primary font-mono mr-2">
              [{currentStep + 1}/{animation.steps.length}]
            </span>
            {step.caption}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Step dots */}
      {!isPlaying && animation.steps.length > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          {animation.steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentStep
                  ? "bg-primary w-4"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ── Array / Stack / Queue visualization ──
function ArrayViz({ nodes, type }: { nodes: DSNode[]; type: string }) {
  return (
    <div className="flex items-center gap-1">
      {type === "stack" && (
        <span className="text-xs text-muted-foreground mr-2 rotate-90">TOP →</span>
      )}
      {type === "queue" && (
        <span className="text-xs text-muted-foreground mr-2">IN →</span>
      )}
      {nodes.map((node, i) => (
        <motion.div
          key={node.id}
          layout
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: 1,
            scale: 1,
            borderColor: node.highlight ? "hsl(199, 89%, 48%)" : "hsl(215, 20%, 30%)",
            backgroundColor: node.highlight ? "hsla(199, 89%, 48%, 0.15)" : "hsla(215, 20%, 20%, 0.5)",
          }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
          className="flex items-center justify-center w-12 h-12 rounded-lg border-2 font-mono text-sm font-bold"
        >
          <span className={node.highlight ? "text-primary" : "text-foreground"}>
            {node.label}
          </span>
        </motion.div>
      ))}
      {type === "queue" && (
        <span className="text-xs text-muted-foreground ml-2">→ OUT</span>
      )}
    </div>
  );
}

// ── Tree visualization (simple binary-ish layout) ──
function TreeViz({ nodes, edges }: { nodes: DSNode[]; edges?: DSEdge[] }) {
  if (nodes.length === 0) return null;

  // Build adjacency from edges
  const children: Record<string, string[]> = {};
  const hasParent = new Set<string>();

  edges?.forEach((e) => {
    if (!children[e.from]) children[e.from] = [];
    children[e.from].push(e.to);
    hasParent.add(e.to);
  });

  // Find root (node with no parent)
  const root = nodes.find((n) => !hasParent.has(n.id)) || nodes[0];

  // BFS to assign levels
  const levels: DSNode[][] = [];
  const visited = new Set<string>();
  let queue = [root.id];
  visited.add(root.id);

  while (queue.length > 0) {
    const level: DSNode[] = [];
    const nextQueue: string[] = [];
    for (const id of queue) {
      const node = nodes.find((n) => n.id === id);
      if (node) level.push(node);
      for (const child of children[id] || []) {
        if (!visited.has(child)) {
          visited.add(child);
          nextQueue.push(child);
        }
      }
    }
    levels.push(level);
    queue = nextQueue;
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {levels.map((level, li) => (
        <div key={li} className="flex items-center justify-center gap-4">
          {level.map((node) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{
                opacity: 1,
                y: 0,
                borderColor: node.highlight ? "hsl(199, 89%, 48%)" : "hsl(215, 20%, 30%)",
                backgroundColor: node.highlight ? "hsla(199, 89%, 48%, 0.15)" : "hsla(215, 20%, 20%, 0.5)",
              }}
              transition={{ duration: 0.3, delay: li * 0.15 }}
              className="flex items-center justify-center w-10 h-10 rounded-full border-2 font-mono text-sm font-bold"
            >
              <span className={node.highlight ? "text-primary" : "text-foreground"}>
                {node.label}
              </span>
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Graph visualization (simple force-less circle layout) ──
function GraphViz({ nodes, edges }: { nodes: DSNode[]; edges?: DSEdge[] }) {
  const r = 80;
  const cx = 120;
  const cy = 120;

  const positions = nodes.map((_, i) => {
    const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  const nodeMap = Object.fromEntries(nodes.map((n, i) => [n.id, i]));

  return (
    <svg viewBox="0 0 240 240" className="w-[240px] h-[240px]">
      {/* Edges */}
      {edges?.map((edge, i) => {
        const fromIdx = nodeMap[edge.from];
        const toIdx = nodeMap[edge.to];
        if (fromIdx === undefined || toIdx === undefined) return null;
        return (
          <motion.line
            key={`edge-${i}`}
            x1={positions[fromIdx].x}
            y1={positions[fromIdx].y}
            x2={positions[toIdx].x}
            y2={positions[toIdx].y}
            stroke="hsl(215, 20%, 40%)"
            strokeWidth={1.5}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          />
        );
      })}
      {/* Nodes */}
      {nodes.map((node, i) => (
        <motion.g
          key={node.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
        >
          <circle
            cx={positions[i].x}
            cy={positions[i].y}
            r={16}
            fill={node.highlight ? "hsla(199, 89%, 48%, 0.2)" : "hsl(222, 47%, 11%)"}
            stroke={node.highlight ? "hsl(199, 89%, 48%)" : "hsl(215, 20%, 35%)"}
            strokeWidth={2}
          />
          <text
            x={positions[i].x}
            y={positions[i].y}
            textAnchor="middle"
            dominantBaseline="central"
            className="text-xs font-mono font-bold"
            fill={node.highlight ? "hsl(199, 89%, 48%)" : "hsl(214, 32%, 91%)"}
          >
            {node.label}
          </text>
        </motion.g>
      ))}
    </svg>
  );
}

// ── Linked List visualization ──
function LinkedListViz({ nodes }: { nodes: DSNode[] }) {
  return (
    <div className="flex items-center gap-0">
      {nodes.map((node, i) => (
        <div key={node.id} className="flex items-center">
          <motion.div
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{
              opacity: 1,
              x: 0,
              borderColor: node.highlight ? "hsl(199, 89%, 48%)" : "hsl(215, 20%, 30%)",
              backgroundColor: node.highlight ? "hsla(199, 89%, 48%, 0.15)" : "hsla(215, 20%, 20%, 0.5)",
            }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
            className="flex items-center justify-center w-12 h-10 rounded-lg border-2 font-mono text-sm font-bold"
          >
            <span className={node.highlight ? "text-primary" : "text-foreground"}>
              {node.label}
            </span>
          </motion.div>
          {i < nodes.length - 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 + 0.2 }}
              className="text-muted-foreground mx-1"
            >
              →
            </motion.div>
          )}
        </div>
      ))}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: nodes.length * 0.1 }}
        className="text-muted-foreground/50 ml-1 text-xs font-mono"
      >
        null
      </motion.span>
    </div>
  );
}

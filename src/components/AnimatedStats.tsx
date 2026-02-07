import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { StatItem } from "@/types/presentation";

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}

function AnimatedCounter({ value, prefix = "", suffix = "", duration = 1.5 }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  const formatted = count >= 1000 ? `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}k` : count.toLocaleString();

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{formatted}{suffix}
    </span>
  );
}

interface AnimatedStatsProps {
  stats: StatItem[];
}

export function AnimatedStats({ stats }: AnimatedStatsProps) {
  if (!stats || stats.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="grid gap-3 w-full"
      style={{ gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)` }}
    >
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 + i * 0.12, type: "spring", stiffness: 200 }}
          className="relative flex flex-col items-center gap-1 p-3 rounded-xl 
            bg-primary/5 border border-primary/15 backdrop-blur-sm overflow-hidden"
        >
          {/* Animated bar behind */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-primary/10"
            initial={{ height: 0 }}
            animate={{ height: `${Math.min(80, (stat.value / Math.max(...stats.map(s => s.value))) * 80)}%` }}
            transition={{ delay: 0.6 + i * 0.15, duration: 1, ease: "easeOut" }}
          />

          <span className="relative z-10 text-2xl md:text-3xl font-bold text-primary">
            <AnimatedCounter
              value={stat.value}
              prefix={stat.prefix}
              suffix={stat.suffix}
            />
          </span>
          <span className="relative z-10 text-xs text-muted-foreground text-center leading-tight">
            {stat.label}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import type { ChartConfig } from "@/types/presentation";

interface AnimatedChartProps {
  config: ChartConfig;
  isPlaying?: boolean;
}

const COLORS = [
  "hsl(199, 89%, 60%)",  // sky-400
  "hsl(271, 91%, 65%)",  // purple-400
  "hsl(142, 71%, 45%)",  // green-500
  "hsl(24, 95%, 53%)",   // orange-500
  "hsl(346, 77%, 50%)",  // rose-500
  "hsl(48, 96%, 53%)",   // yellow-400
];

const tooltipStyle = {
  backgroundColor: "hsl(222, 47%, 11%)",
  border: "1px solid hsl(215, 20%, 25%)",
  borderRadius: "0.5rem",
  color: "hsl(214, 32%, 91%)",
  fontSize: "0.8rem",
};

export function AnimatedChart({ config, isPlaying }: AnimatedChartProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 400);
    return () => clearTimeout(t);
  }, []);

  if (!visible) {
    return (
      <div className="w-full h-[280px] flex items-center justify-center text-muted-foreground text-sm">
        Loading chart...
      </div>
    );
  }

  const series = config.series || ["value"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="w-full max-w-2xl mx-auto"
    >
      {config.title && (
        <p className="text-center text-sm font-medium text-muted-foreground mb-2">
          {config.title}
        </p>
      )}
      <ResponsiveContainer width="100%" height={280}>
        {config.type === "bar" ? (
          <BarChart data={config.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 20%, 20%)" />
            <XAxis dataKey="name" tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 11 }} />
            <YAxis tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            {series.length > 1 && <Legend />}
            {series.map((key, i) => (
              <Bar
                key={key}
                dataKey={key}
                fill={COLORS[i % COLORS.length]}
                radius={[4, 4, 0, 0]}
                animationDuration={1200}
                animationBegin={i * 200}
              />
            ))}
          </BarChart>
        ) : config.type === "line" ? (
          <LineChart data={config.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 20%, 20%)" />
            <XAxis dataKey="name" tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 11 }} />
            <YAxis tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            {series.length > 1 && <Legend />}
            {series.map((key, i) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3, fill: COLORS[i % COLORS.length] }}
                animationDuration={1500}
                animationBegin={i * 300}
              />
            ))}
          </LineChart>
        ) : config.type === "area" ? (
          <AreaChart data={config.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 20%, 20%)" />
            <XAxis dataKey="name" tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 11 }} />
            <YAxis tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            {series.map((key, i) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[i % COLORS.length]}
                fill={COLORS[i % COLORS.length]}
                fillOpacity={0.2}
                animationDuration={1500}
              />
            ))}
          </AreaChart>
        ) : config.type === "pie" ? (
          <PieChart>
            <Tooltip contentStyle={tooltipStyle} />
            <Pie
              data={config.data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              animationDuration={1200}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={{ stroke: "hsl(215, 20%, 40%)" }}
            >
              {config.data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        ) : config.type === "radar" ? (
          <RadarChart data={config.data} cx="50%" cy="50%" outerRadius={100}>
            <PolarGrid stroke="hsl(215, 20%, 25%)" />
            <PolarAngleAxis dataKey="name" tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            {series.map((key, i) => (
              <Radar
                key={key}
                dataKey={key}
                stroke={COLORS[i % COLORS.length]}
                fill={COLORS[i % COLORS.length]}
                fillOpacity={0.25}
                animationDuration={1200}
              />
            ))}
          </RadarChart>
        ) : null}
      </ResponsiveContainer>
    </motion.div>
  );
}

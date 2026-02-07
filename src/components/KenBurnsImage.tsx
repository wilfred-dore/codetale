import { motion } from "framer-motion";

interface KenBurnsImageProps {
  src: string;
  alt: string;
  isPlaying?: boolean;
}

// Randomized Ken Burns presets for variety
const kenBurnsPresets = [
  { scale: [1, 1.15], x: [0, -20], y: [0, -10] },    // Zoom in + drift left
  { scale: [1.1, 1], x: [-10, 15], y: [-5, 5] },     // Zoom out + drift right
  { scale: [1, 1.12], x: [0, 10], y: [0, -15] },     // Zoom in + drift up-right
  { scale: [1.05, 1.15], x: [10, -10], y: [5, -10] }, // Slow zoom + pan
  { scale: [1.15, 1.05], x: [-15, 5], y: [-10, 0] },  // Zoom out + drift
];

export function KenBurnsImage({ src, alt, isPlaying = false }: KenBurnsImageProps) {
  // Pick a preset based on src hash for consistency
  const hash = src.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const preset = kenBurnsPresets[hash % kenBurnsPresets.length];

  return (
    <div className="w-full h-full overflow-hidden rounded-xl">
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-contain"
        loading="lazy"
        animate={
          isPlaying
            ? {
                scale: preset.scale,
                x: preset.x,
                y: preset.y,
              }
            : { scale: 1, x: 0, y: 0 }
        }
        transition={
          isPlaying
            ? {
                duration: 12,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }
            : { duration: 0.5 }
        }
      />
    </div>
  );
}

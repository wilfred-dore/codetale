import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GenerateButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function GenerateButton({ onClick, disabled }: GenerateButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
    >
      <Button
        variant="hero"
        size="lg"
        onClick={onClick}
        disabled={disabled}
        className="h-13 px-8 text-base rounded-xl"
      >
        <Sparkles className="w-5 h-5 mr-2" />
        Generate Presentation
      </Button>
    </motion.div>
  );
}

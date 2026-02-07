import { motion } from "framer-motion";

export type Language = "en" | "fr" | "de";

interface LanguageSelectorProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
}

const languages: { id: Language; flag: string; label: string }[] = [
  { id: "en", flag: "🇬🇧", label: "English" },
  { id: "fr", flag: "🇫🇷", label: "Français" },
  { id: "de", flag: "🇩🇪", label: "Deutsch" },
];

export function LanguageSelector({ language, onLanguageChange }: LanguageSelectorProps) {
  const selectedIndex = languages.findIndex((l) => l.id === language);

  return (
    <div className="flex items-center justify-center">
      <div className="relative flex items-center rounded-xl bg-secondary p-1 gap-1">
        <motion.div
          className="absolute top-1 bottom-1 rounded-lg bg-primary/15 border border-primary/30"
          layoutId="lang-indicator"
          animate={{
            left: `${4 + selectedIndex * (100 / languages.length)}%`,
            width: `calc(${100 / languages.length}% - 6px)`,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          style={{
            left: `calc(${selectedIndex * (100 / languages.length)}% + 4px)`,
          }}
        />

        {languages.map((lang) => (
          <button
            key={lang.id}
            onClick={() => onLanguageChange(lang.id)}
            className={`relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
              language === lang.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="text-base">{lang.flag}</span>
            <span>{lang.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

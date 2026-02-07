import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, Film, Rocket, Code2, Zap, ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const walkOfCode = [
  {
    name: "Apollo-11",
    stars: "72K",
    tagline: "The code that landed humanity on the Moon",
    year: "1969",
  },
  {
    name: "Linux",
    stars: "180K",
    tagline: "The kernel that runs the world",
    year: "1991",
  },
  {
    name: "React",
    stars: "225K",
    tagline: "The UI revolution",
    year: "2013",
  },
  {
    name: "Bitcoin",
    stars: "78K",
    tagline: "The code that created a currency",
    year: "2009",
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

export default function About() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20">
        {/* Background effects */}
        <div className="absolute inset-0 dot-grid opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        
        {/* Golden spotlight effect */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,hsl(45_80%_50%/0.15),transparent_70%)]" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-subtle text-sm text-amber-400 font-medium mb-8">
              <Film className="w-4 h-4" />
              The Hollywood Pitch
            </span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8"
          >
            <span className="text-foreground">Imagine if </span>
            <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">
              Spielberg & Lucas
            </span>
            <span className="text-foreground"> had GitHub...</span>
          </motion.h1>

          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.4, duration: 0.7 }}
            className="space-y-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12"
          >
            <p>
              <span className="text-foreground font-medium">Star Wars. Lord of the Rings. Apollo 13.</span>
              <br />These stories changed the world.
            </p>
            <p className="text-amber-400/80 font-medium">
              But you know which stories NOBODY tells?
            </p>
            <p className="text-2xl text-foreground font-semibold">
              The developers' stories.
            </p>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.6, duration: 0.7 }}
            className="glass rounded-2xl p-6 md:p-8 max-w-xl mx-auto mb-12"
          >
            <p className="text-muted-foreground mb-2">React has</p>
            <p className="text-5xl md:text-6xl font-bold gradient-text mb-2">225,000</p>
            <p className="text-muted-foreground mb-4">stars on GitHub</p>
            <p className="text-sm text-muted-foreground/70">
              That's more than the population of some cities.
              <br />Yet <span className="text-amber-400">NOBODY</span> knows how to tell its story.
            </p>
          </motion.div>

          <motion.p
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.8, duration: 0.7 }}
            className="text-xl md:text-2xl text-foreground font-medium italic"
          >
            "Developers build cathedrals...
            <br />
            <span className="text-muted-foreground">and present them with bullet points."</span>
          </motion.p>
        </div>
      </section>

      {/* What is CodeTale */}
      <section className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              <span className="gradient-text">CodeTale</span> changes that.
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Every repository has a hero's journey. We find it and tell it.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Code2,
                title: "Paste a GitHub URL",
                description: "Any public repository becomes the protagonist of your story",
              },
              {
                icon: Zap,
                title: "AI writes the script",
                description: "Cinematic narration, not boring bullet points. Ken Burns meets Silicon Valley.",
              },
              {
                icon: Play,
                title: "Watch the story",
                description: "Auto-generated visuals, voice narration, QWiki-style cinematic flow.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="glass rounded-2xl p-6 text-center"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Taglines */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-center mt-16 space-y-4"
          >
            <p className="text-2xl md:text-3xl font-bold text-foreground">
              "Every code has a tale. <span className="gradient-text">CodeTale tells yours.</span>"
            </p>
            <p className="text-lg text-amber-400/80 font-medium">
              From README.md to BLOCKBUSTER.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Walk of Code */}
      <section className="relative py-24 px-6 bg-gradient-to-b from-background to-[hsl(228,14%,6%)]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-subtle text-sm text-amber-400 font-medium mb-6">
              <Star className="w-4 h-4 fill-amber-400" />
              Walk of Code
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Every Legend Deserves Its Tale
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Like the Hollywood Walk of Fame, but for the repositories that shaped our world.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4">
            {walkOfCode.map((repo, i) => (
              <motion.div
                key={repo.name}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group relative glass rounded-xl p-5 hover:border-amber-500/30 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                    <Star className="w-6 h-6 text-amber-400 fill-amber-400/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-foreground group-hover:text-amber-400 transition-colors">
                        {repo.name}
                      </h3>
                      <span className="text-xs text-muted-foreground font-mono">
                        {repo.year}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{repo.tagline}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-mono text-primary">
                      ⭐ {repo.stars} stars
                    </span>
                  </div>
                </div>
                <div className="absolute inset-0 rounded-xl ring-1 ring-amber-500/0 group-hover:ring-amber-500/20 transition-all" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo with Apollo 11 */}
      <section className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass rounded-3xl p-8 md:p-12"
          >
            <div className="flex items-center gap-3 mb-8">
              <Rocket className="w-8 h-8 text-primary" />
              <h2 className="text-2xl md:text-3xl font-bold">The Perfect Demo</h2>
            </div>

            <div className="space-y-6 text-muted-foreground">
              <div className="glass-subtle rounded-xl p-4">
                <p className="text-xs text-muted-foreground/60 font-mono mb-2">github.com/chrislgarry/Apollo-11</p>
                <p className="text-lg text-foreground font-medium italic">
                  "Houston, We Have a Code"
                </p>
                <p className="text-sm mt-2">
                  "In 1969, before Stack Overflow, before GitHub, one woman wrote the code that landed humanity on the Moon."
                </p>
              </div>

              <div className="glass-subtle rounded-xl p-4">
                <p className="text-lg text-foreground font-medium italic">
                  "The Architecture of the Impossible"
                </p>
                <p className="text-sm mt-2">
                  "The Apollo Guidance Computer had 74KB of memory. Your phone has 6 million times more."
                </p>
              </div>

              <div className="glass-subtle rounded-xl p-4">
                <p className="text-lg text-foreground font-medium italic">
                  "The Bug That Almost Stopped Everything"
                </p>
                <p className="text-sm mt-2">
                  "Error 1202. 12 minutes from landing. Margaret Hamilton's code made the decision to continue. Automatically."
                </p>
              </div>
            </div>

            <div className="mt-10 text-center">
              <Link to="/">
                <Button size="lg" className="group rounded-xl px-8 py-6 text-lg font-semibold glow-primary">
                  Try it with Apollo-11
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Apollo 11 had an extraordinary story.
              <br />
              <span className="gradient-text">So does your code.</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-10">
              CodeTale tells it.
            </p>
            <Link to="/">
              <Button size="lg" className="rounded-xl px-10 py-6 text-lg font-semibold glow-primary">
                <Play className="w-5 h-5 mr-2 fill-current" />
                Create Your Story
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/50">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div>
            <p>Built for Paris AI Hackathon 2026</p>
            <p className="text-muted-foreground/70">Wilfred Doré</p>
          </div>
          <Link to="/" className="text-primary hover:underline">
            Back to Home
          </Link>
        </div>
      </footer>
    </div>
  );
}

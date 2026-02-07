import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check, Terminal, Code2, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";

const API_BASE_URL = `https://pdsjlioujbfvkfmeoiwe.supabase.co/functions/v1/analyze-repo`;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 p-1.5 rounded-md bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
      title="Copy to clipboard"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function CodeBlock({ code, language = "bash" }: { code: string; language?: string }) {
  return (
    <div className="relative group">
      <pre className="bg-secondary/30 border border-border/30 rounded-xl p-4 overflow-x-auto text-sm font-mono text-foreground/90 leading-relaxed">
        <code>{code}</code>
      </pre>
      <CopyButton text={code} />
    </div>
  );
}

const curlExample = `curl -X POST \\
  ${API_BASE_URL} \\
  -H "Content-Type: application/json" \\
  -d '{
    "repo_url": "https://github.com/facebook/react",
    "options": {
      "max_files": 30,
      "include_narrative": true,
      "include_mermaid": true,
      "target_audience": "developer"
    }
  }'`;

const responseExample = `{
  "status": "success",
  "analysis": {
    "project_name": "React",
    "summary": "A declarative, component-based JavaScript library for building user interfaces...",
    "main_language": "JavaScript",
    "languages": ["JavaScript", "TypeScript"],
    "framework": "React",
    "architecture_type": "library",
    "key_components": [...],
    "patterns_detected": ["Observer", "Virtual DOM", "Fiber"],
    "dependencies_highlight": [...],
    "complexity_score": 9,
    "interesting_facts": [...],
    "mermaid_architecture": "graph TD\\n  ...",
    "suggested_narrative": { ... },
    "target_audiences": { ... }
  },
  "metadata": {
    "files_scanned": 30,
    "total_files_in_repo": 4521,
    "analysis_time_ms": 12500,
    "model_used": "openai/gpt-5.2",
    "timestamp": "2026-02-07T..."
  }
}`;

const jsExample = `const response = await fetch(
  "${API_BASE_URL}",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      repo_url: "https://github.com/facebook/react",
      options: {
        max_files: 20,
        target_audience: "investor"
      }
    })
  }
);

const data = await response.json();
console.log(data.analysis.summary);`;

const pythonExample = `import requests

response = requests.post(
    "${API_BASE_URL}",
    json={
        "repo_url": "https://github.com/facebook/react",
        "options": {
            "max_files": 30,
            "include_narrative": True,
            "target_audience": "all"
        }
    }
)

data = response.json()
print(data["analysis"]["summary"])`;

export default function ApiDocs() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* Nav */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-border/50">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-xl">📖</span>
            <span className="font-display font-bold text-lg text-foreground tracking-tight">
              CodeTale
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to App
              </Button>
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono">
              <Terminal className="w-3 h-3" />
              Public REST API
            </div>
            <h1 className="text-4xl font-display font-bold text-foreground">
              Repository Analysis API
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Analyze any public GitHub repository with AI. Get architecture diagrams, complexity scores,
              key components, and narrative suggestions — all via a single POST request.
            </p>
          </motion.div>

          {/* Endpoint */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-display font-semibold text-foreground flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Endpoint
            </h2>
            <div className="bg-secondary/30 border border-border/30 rounded-xl p-4 font-mono text-sm">
              <span className="text-green-400 font-bold">POST</span>{" "}
              <span className="text-foreground break-all">{API_BASE_URL}</span>
            </div>
          </motion.section>

          {/* Request body */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-display font-semibold text-foreground flex items-center gap-2">
              <Code2 className="w-5 h-5 text-primary" />
              Request Body
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left py-3 px-4 text-muted-foreground font-mono font-medium">Parameter</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-mono font-medium">Type</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-mono font-medium">Required</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  <tr>
                    <td className="py-3 px-4 font-mono text-primary">repo_url</td>
                    <td className="py-3 px-4 font-mono text-foreground/70">string</td>
                    <td className="py-3 px-4"><span className="text-red-400 font-mono text-xs">required</span></td>
                    <td className="py-3 px-4 text-muted-foreground">Full GitHub URL (e.g. https://github.com/owner/repo)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono text-primary">options.max_files</td>
                    <td className="py-3 px-4 font-mono text-foreground/70">number</td>
                    <td className="py-3 px-4"><span className="text-muted-foreground font-mono text-xs">optional</span></td>
                    <td className="py-3 px-4 text-muted-foreground">Max files to analyze (1-50, default: 30)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono text-primary">options.include_narrative</td>
                    <td className="py-3 px-4 font-mono text-foreground/70">boolean</td>
                    <td className="py-3 px-4"><span className="text-muted-foreground font-mono text-xs">optional</span></td>
                    <td className="py-3 px-4 text-muted-foreground">Include suggested narrative (default: true)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono text-primary">options.include_mermaid</td>
                    <td className="py-3 px-4 font-mono text-foreground/70">boolean</td>
                    <td className="py-3 px-4"><span className="text-muted-foreground font-mono text-xs">optional</span></td>
                    <td className="py-3 px-4 text-muted-foreground">Include Mermaid architecture diagram (default: true)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono text-primary">options.target_audience</td>
                    <td className="py-3 px-4 font-mono text-foreground/70">string</td>
                    <td className="py-3 px-4"><span className="text-muted-foreground font-mono text-xs">optional</span></td>
                    <td className="py-3 px-4 text-muted-foreground">"developer" | "manager" | "investor" | "all" (default: "all")</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.section>

          {/* Examples */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-display font-semibold text-foreground">
              Examples
            </h2>

            <div className="space-y-4">
              <h3 className="text-sm font-mono font-semibold text-muted-foreground uppercase tracking-wider">cURL</h3>
              <CodeBlock code={curlExample} />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-mono font-semibold text-muted-foreground uppercase tracking-wider">JavaScript / TypeScript</h3>
              <CodeBlock code={jsExample} language="javascript" />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-mono font-semibold text-muted-foreground uppercase tracking-wider">Python</h3>
              <CodeBlock code={pythonExample} language="python" />
            </div>
          </motion.section>

          {/* Response */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-display font-semibold text-foreground">
              Response
            </h2>
            <CodeBlock code={responseExample} language="json" />
          </motion.section>

          {/* Rate Limits */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-display font-semibold text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Rate Limits
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-secondary/30 border border-border/30 p-4 space-y-1">
                <div className="text-2xl font-display font-bold text-foreground">10</div>
                <div className="text-xs text-muted-foreground font-mono">requests / minute</div>
              </div>
              <div className="rounded-xl bg-secondary/30 border border-border/30 p-4 space-y-1">
                <div className="text-2xl font-display font-bold text-foreground">50</div>
                <div className="text-xs text-muted-foreground font-mono">max files / request</div>
              </div>
              <div className="rounded-xl bg-secondary/30 border border-border/30 p-4 space-y-1">
                <div className="text-2xl font-display font-bold text-foreground">500</div>
                <div className="text-xs text-muted-foreground font-mono">lines / file cap</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Rate limits are per IP address. Exceeding the limit returns a <code className="text-primary font-mono">429</code> status
              with a <code className="text-primary font-mono">retry_after_seconds</code> field.
            </p>
          </motion.section>

          {/* Error Codes */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-display font-semibold text-foreground">
              Error Codes
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left py-3 px-4 text-muted-foreground font-mono font-medium">Code</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  <tr>
                    <td className="py-3 px-4 font-mono text-amber-400">400</td>
                    <td className="py-3 px-4 text-muted-foreground">Invalid or missing repo_url / no source files found</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono text-amber-400">402</td>
                    <td className="py-3 px-4 text-muted-foreground">AI credits exhausted — try again later</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono text-destructive">404</td>
                    <td className="py-3 px-4 text-muted-foreground">Repository not found or is private</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono text-destructive">429</td>
                    <td className="py-3 px-4 text-muted-foreground">Rate limit exceeded (10 req/min per IP)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono text-destructive">500</td>
                    <td className="py-3 px-4 text-muted-foreground">Internal server error</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.section>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="border-t border-border/30 pt-8 pb-4 flex items-center justify-between"
          >
            <p className="text-sm text-muted-foreground">
              Built with ❤️ for <span className="font-mono text-primary">{"{Tech: Europe}"}</span> Paris 2026
            </p>
            <Link to="/">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to App
              </Button>
            </Link>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

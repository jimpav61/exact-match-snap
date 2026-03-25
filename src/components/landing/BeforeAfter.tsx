import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

const beforePrompt = `Build me a task management app with 
a dashboard, user authentication, and 
the ability to create projects and 
assign tasks. Make it look modern.`;

const afterPrompt = `ROLE: Senior full-stack developer specializing in 
React + Supabase applications.

DESIGN PASSPORT:
  Mood: Neo-Minimal
  Palette: #FAFAFA / #111111 / #6C5CE7
  Typography: Instrument Sans (body), JetBrains Mono (code)
  Radius: 4px, sharp edges, minimal shadows

TASK: Build a task management MVP with:
  1. Auth flow (email + OAuth via Supabase)
  2. Dashboard showing active projects as cards
  3. Kanban board with drag-and-drop columns
  4. Role-based access: Owner, Editor, Viewer

CONSTRAINTS:
  - Mobile-first responsive layout
  - Optimistic UI updates for task moves
  - RLS policies on all tables
  
CONTEXT CHAIN:
  [1A – MVP Scoper]: Task management for small teams
  [1B – UX Architect]: Notion-like simplicity, Linear speed
  [1C – Data Architect]: projects → columns → tasks → assignees`;

const beforeIssues = [
  "No design direction — AI guesses everything",
  "No tech stack specified",
  "No data model or auth strategy",
  "No constraints or quality bar",
  "Produces generic, throwaway output",
];

const afterBenefits = [
  "Injected Design DNA with exact colors & fonts",
  "Platform-specific tech stack & patterns",
  "Structured data model from prior modules",
  "Security & UX constraints baked in",
  "Production-grade, copy-paste-ready output",
];

const BeforeAfter = () => {
  return (
    <section className="py-16 sm:py-32 px-4 sm:px-6 lg:px-16">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-20"
        >
          <p className="text-sm font-body uppercase tracking-[0.3em] text-accent mb-4">
            The Difference
          </p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold max-w-2xl mx-auto">
            Vague vibes vs. <span className="italic text-primary">engineered prompts.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Before */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card overflow-hidden border-destructive/30"
          >
            <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-destructive/5">
              <div className="w-2 h-2 rounded-full bg-destructive" />
              <span className="font-mono text-xs text-destructive">Before — Raw Prompt</span>
            </div>
            <pre className="p-5 font-mono text-xs leading-relaxed text-foreground/70 overflow-x-auto min-h-[200px]">
              {beforePrompt}
            </pre>
            <div className="px-5 py-4 border-t border-border space-y-2">
              {beforeIssues.map((issue) => (
                <div key={issue} className="flex items-start gap-2 text-xs font-body text-destructive/80">
                  <X className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>{issue}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* After */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="glass-card overflow-hidden border-accent/30 glow-accent"
          >
            <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-accent/5">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="font-mono text-xs text-accent">After — VibeCoder Studio</span>
            </div>
            <pre className="p-5 font-mono text-xs leading-relaxed text-foreground/80 overflow-x-auto min-h-[200px]">
              {afterPrompt}
            </pre>
            <div className="px-5 py-4 border-t border-border space-y-2">
              {afterBenefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-2 text-xs font-body text-accent/90">
                  <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BeforeAfter;

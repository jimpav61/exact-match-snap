import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Check, Sparkles } from "lucide-react";

const SECTIONS = [
  { id: "1A", name: "Product Vision & MVP Scope", phase: "Plan" },
  { id: "1B", name: "UX & Interface Design", phase: "Plan" },
  { id: "1C", name: "Data Architecture", phase: "Plan" },
  { id: "2A", name: "Full Application Build Spec", phase: "Build" },
  { id: "2B", name: "SaaS Business Logic", phase: "Build" },
  { id: "2C", name: "Visual Design Implementation", phase: "Build" },
  { id: "3A", name: "Feature Expansion Plan", phase: "Improve" },
  { id: "3B", name: "Bug Prevention & QA Strategy", phase: "Improve" },
  { id: "3C", name: "Iteration & Optimization Roadmap", phase: "Improve" },
];

const PHASE_COLORS: Record<string, string> = {
  Plan: "text-green-400",
  Build: "text-blue-400",
  Improve: "text-orange-400",
};

interface GeneratingOverlayProps {
  active: boolean;
}

const GeneratingOverlay = ({ active }: GeneratingOverlayProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!active) {
      setCurrentIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setCurrentIndex((prev) => Math.min(prev + 1, SECTIONS.length));
    }, 800);
    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="max-w-md w-full px-6">
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-4"
          >
            <Sparkles className="w-8 h-8 text-primary" />
          </motion.div>
          <h2 className="font-display text-xl font-bold">Building Your PRD</h2>
          <p className="text-sm text-muted-foreground font-body mt-1">
            Prompt Pilot is assembling 9 specialized sections…
          </p>
        </div>

        <div className="space-y-2">
          {SECTIONS.map((section, i) => {
            const isDone = i < currentIndex;
            const isActive = i === currentIndex;

            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0.3 }}
                animate={{
                  opacity: isDone || isActive ? 1 : 0.3,
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isDone ? "bg-muted/30" : isActive ? "bg-primary/10" : ""
                }`}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  {isDone ? (
                    <Check className="w-4 h-4 text-accent" />
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                  )}
                </div>
                <span className={`font-mono text-xs w-6 ${PHASE_COLORS[section.phase]}`}>
                  {section.id}
                </span>
                <span className={`font-body text-sm ${isDone ? "text-foreground" : isActive ? "text-foreground" : "text-muted-foreground/50"}`}>
                  {section.name}
                </span>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ width: `${(currentIndex / SECTIONS.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xs text-muted-foreground font-body text-center mt-2">
            {currentIndex} of {SECTIONS.length} sections
          </p>
        </div>
      </div>
    </div>
  );
};

export default GeneratingOverlay;

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2, Check, Sparkles, Brain } from "lucide-react";

const LECUN_STEPS = [
  { id: "L1", name: "Analyzing assumptions & world model", phase: "Analyze" },
  { id: "L2", name: "Challenging first principles", phase: "Analyze" },
  { id: "L3", name: "Stress-testing & grounding requirements", phase: "Analyze" },
];

const ASSEMBLY_STEPS = [
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

const ALL_STEPS = [...LECUN_STEPS, ...ASSEMBLY_STEPS];

const PHASE_COLORS: Record<string, string> = {
  Analyze: "text-purple-400",
  Plan: "text-green-400",
  Build: "text-blue-400",
  Improve: "text-orange-400",
};

interface GeneratingOverlayProps {
  active: boolean;
}

const GeneratingOverlay = ({ active }: GeneratingOverlayProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!active) {
      setCurrentIndex(0);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const advance = (index: number) => {
      if (index >= ALL_STEPS.length) return;
      const delay = index < LECUN_STEPS.length ? 2500 : 600;
      timerRef.current = setTimeout(() => {
        setCurrentIndex(index + 1);
        advance(index + 1);
      }, delay);
    };

    advance(0);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active]);

  if (!active) return null;

  const inLeCunPhase = currentIndex < LECUN_STEPS.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="max-w-md w-full px-6">
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-4"
          >
            {inLeCunPhase ? (
              <Brain className="w-8 h-8 text-purple-400" />
            ) : (
              <Sparkles className="w-8 h-8 text-primary" />
            )}
          </motion.div>
          {inLeCunPhase ? (
            <>
              <h2 className="font-display text-xl font-bold">Deep Analysis</h2>
              <p className="text-sm text-muted-foreground font-body mt-1">
                Intelligence engine is analyzing your idea through 9 reasoning frameworks…
              </p>
            </>
          ) : (
            <>
              <h2 className="font-display text-xl font-bold">Building Your PRD</h2>
              <p className="text-sm text-muted-foreground font-body mt-1">
                Prompt Pilot is assembling 9 specialized sections…
              </p>
            </>
          )}
        </div>

        <div className="space-y-2">
          {ALL_STEPS.map((step, i) => {
            const isDone = i < currentIndex;
            const isActive = i === currentIndex;

            return (
              <motion.div
                key={step.id}
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
                <span className={`font-mono text-xs w-6 ${PHASE_COLORS[step.phase]}`}>
                  {step.id}
                </span>
                <span className={`font-body text-sm ${isDone ? "text-foreground" : isActive ? "text-foreground" : "text-muted-foreground/50"}`}>
                  {step.name}
                </span>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ width: `${(currentIndex / ALL_STEPS.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xs text-muted-foreground font-body text-center mt-2">
            {currentIndex} of {ALL_STEPS.length} steps
          </p>
        </div>
      </div>
    </div>
  );
};

export default GeneratingOverlay;

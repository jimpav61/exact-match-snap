import { motion } from "framer-motion";
import { Lightbulb, Hammer, Wrench, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const routes = [
  {
    id: "idea",
    icon: Lightbulb,
    title: "I have an idea",
    description: "Start from scratch — scope, design, and plan before building.",
    phase: "Phase 1: Plan",
  },
  {
    id: "plan",
    icon: Hammer,
    title: "I have a plan, I need code",
    description: "You know what to build — jump straight to generating build prompts.",
    phase: "Phase 2: Build",
  },
  {
    id: "app",
    icon: Wrench,
    title: "I have an app, I need to improve it",
    description: "Add features, fix bugs, or run an iteration cycle on existing code.",
    phase: "Phase 3: Improve",
  },
];

interface RouterStepProps {
  selected: string;
  onSelect: (id: string) => void;
  onBack: () => void;
}

const RouterStep = ({ selected, onSelect, onBack }: RouterStepProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-3">
        Where are you in the process?
      </h2>
      <p className="text-muted-foreground font-body text-center mb-12">
        We'll route you to the right prompts for your stage.
      </p>

      <div className="grid grid-cols-1 gap-4 max-w-xl mx-auto">
        {routes.map((route) => (
          <button
            key={route.id}
            onClick={() => onSelect(route.id)}
            className={`glass-card p-6 text-left transition-all cursor-pointer group hover:border-primary/40 flex items-start gap-5 ${
              selected === route.id ? "border-primary glow-primary" : ""
            }`}
          >
            <div className="w-10 h-10 shrink-0 rounded-none bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <route.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold mb-1">
                {route.title}
              </h3>
              <p className="text-muted-foreground font-body text-sm mb-2">
                {route.description}
              </p>
              <span className="text-xs font-body text-accent">{route.phase}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <Button variant="ghost" onClick={onBack} className="gap-2 font-body text-sm rounded-none">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      </div>
    </motion.div>
  );
};

export default RouterStep;

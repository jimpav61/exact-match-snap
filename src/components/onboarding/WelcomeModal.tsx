import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Layers, Palette, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

const steps = [
  {
    icon: Sparkles,
    title: "Welcome to PromptPilot",
    description:
      "By VibeCoder Studio — the prompt engineering platform that turns your app idea into production-ready AI prompts — no guessing, no wasted tokens.",
  },
  {
    icon: Layers,
    title: "How it works",
    description:
      "Create a project, walk through guided modules, and we generate precise, structured prompts tailored to your platform — web or mobile.",
  },
  {
    icon: Palette,
    title: "Design-aware prompts",
    description:
      "Paste a URL you love, and we extract its design DNA — colors, typography, and feel — to inject into every prompt we generate for you.",
  },
  {
    icon: Rocket,
    title: "Ready to build?",
    description:
      "Create your first project and start generating prompts in under 2 minutes. Your projects, your prompts, always saved.",
  },
];

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
  onCreateProject: () => void;
}

const WelcomeModal = ({ open, onClose, onCreateProject }: WelcomeModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const isLast = currentStep === steps.length - 1;
  const step = steps[currentStep];
  const Icon = step.icon;

  const handleNext = () => {
    if (isLast) {
      onClose();
      onCreateProject();
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-border bg-background p-0 overflow-hidden">
        <DialogTitle className="sr-only">Welcome to PromptPilot</DialogTitle>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="p-8 flex flex-col items-center text-center"
          >
            <div className="w-14 h-14 rounded-none bg-primary/10 flex items-center justify-center mb-6">
              <Icon className="w-7 h-7 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-3">{step.title}</h2>
            <p className="text-muted-foreground font-body text-sm leading-relaxed mb-8 max-w-sm">
              {step.description}
            </p>

            {/* Progress dots */}
            <div className="flex gap-1.5 mb-6">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === currentStep
                      ? "w-8 bg-primary"
                      : i < currentStep
                      ? "w-4 bg-primary/40"
                      : "w-4 bg-muted"
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-3 w-full">
              {!isLast && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    onClose();
                  }}
                  className="flex-1 font-body text-sm rounded-none"
                >
                  Skip
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="flex-1 gap-2 font-body text-sm rounded-none bg-primary hover:bg-primary/90"
              >
                {isLast ? "Create my first project" : "Next"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;

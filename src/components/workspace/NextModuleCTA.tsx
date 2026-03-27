import { Button } from "@/components/ui/button";
import { MODULE_ORDER, PROMPT_TEMPLATES } from "@/lib/promptTemplates";
import { ArrowRight, PartyPopper } from "lucide-react";

interface NextModuleCTAProps {
  currentModule: string;
  onAdvance: (moduleId: string) => void;
}

const NextModuleCTA = ({ currentModule, onAdvance }: NextModuleCTAProps) => {
  const currentIndex = MODULE_ORDER.indexOf(currentModule);
  const nextModuleId = currentIndex < MODULE_ORDER.length - 1 ? MODULE_ORDER[currentIndex + 1] : null;

  if (!nextModuleId) {
    return (
      <div className="glass-card p-4 text-center space-y-2 border-accent/30 border">
        <PartyPopper className="w-6 h-6 text-accent mx-auto" />
        <p className="font-display text-sm font-semibold">All 9 Modules Complete!</p>
        <p className="text-xs text-muted-foreground font-body">
          Your full project specification is ready. Export it as a PRD to start building.
        </p>
      </div>
    );
  }

  const nextTemplate = PROMPT_TEMPLATES[nextModuleId];

  return (
    <div className="glass-card p-4 space-y-3 border-accent/30 border animate-in fade-in slide-in-from-bottom-2 duration-300">
      <p className="text-xs text-accent font-mono uppercase tracking-wider">✓ Saved — Next Step</p>
      <div>
        <p className="font-display text-sm font-semibold">
          Continue to {nextModuleId}: {nextTemplate.moduleName}
        </p>
        <p className="text-xs text-muted-foreground font-body mt-1">
          Your input from this module will automatically feed into the next one.
        </p>
      </div>
      <Button size="sm" onClick={() => onAdvance(nextModuleId)} className="w-full">
        Next Module <ArrowRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
};

export default NextModuleCTA;

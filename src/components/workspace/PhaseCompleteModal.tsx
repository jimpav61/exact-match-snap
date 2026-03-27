import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PartyPopper, ArrowRight } from "lucide-react";
import { PHASE_MODULES, PROMPT_TEMPLATES } from "@/lib/promptTemplates";

interface PhaseCompleteModalProps {
  phase: number | null;
  onClose: () => void;
  onAdvance: (moduleId: string) => void;
}

const PHASE_INFO: Record<number, { name: string; celebration: string; next: string }> = {
  1: { name: "Plan", celebration: "Your project vision, UX architecture, and data model are locked in!", next: "Time to start building." },
  2: { name: "Build", celebration: "Your app structure, SaaS features, and UI are fully specified!", next: "Now let's refine and improve." },
  3: { name: "Improve", celebration: "All 9 modules complete — your full project specification is ready!", next: "Export your PRD and start building." },
};

const PhaseCompleteModal = ({ phase, onClose, onAdvance }: PhaseCompleteModalProps) => {
  if (!phase) return null;

  const info = PHASE_INFO[phase];
  const nextPhaseModules = phase < 3 ? PHASE_MODULES[phase + 1] : null;
  const nextModuleId = nextPhaseModules?.[0];
  const nextTemplate = nextModuleId ? PROMPT_TEMPLATES[nextModuleId] : null;

  return (
    <Dialog open={!!phase} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader className="items-center">
          <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-2">
            <PartyPopper className="w-8 h-8 text-accent" />
          </div>
          <DialogTitle className="font-display text-xl">
            Phase {phase}: {info.name} Complete! 🎉
          </DialogTitle>
          <DialogDescription className="font-body text-sm">
            {info.celebration}
          </DialogDescription>
        </DialogHeader>

        <p className="text-sm text-muted-foreground font-body">{info.next}</p>

        <div className="flex flex-col gap-2 mt-2">
          {nextModuleId && nextTemplate ? (
            <Button onClick={() => { onAdvance(nextModuleId); onClose(); }}>
              Start Phase {phase + 1}: {nextTemplate.moduleName}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={onClose}>
              View Your Complete Specification
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            Stay here
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhaseCompleteModal;

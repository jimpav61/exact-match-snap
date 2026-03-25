import { PROMPT_TEMPLATES, MODULE_ORDER, PHASE_MODULES } from "@/lib/promptTemplates";
import { cn } from "@/lib/utils";

interface PhaseRailProps {
  currentPhase: number;
  currentModule: string;
  completedModules: string[];
  onModuleSelect: (moduleId: string) => void;
}

const PHASE_LABELS: Record<number, { name: string; color: string }> = {
  1: { name: "Plan", color: "text-green-400" },
  2: { name: "Build", color: "text-blue-400" },
  3: { name: "Improve", color: "text-orange-400" },
};

const PhaseRail = ({ currentPhase, currentModule, completedModules, onModuleSelect }: PhaseRailProps) => {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((phase) => {
        const phaseInfo = PHASE_LABELS[phase];
        const modules = PHASE_MODULES[phase];
        const isActivePhase = phase === currentPhase;

        return (
          <div key={phase}>
            <h4 className={cn(
              "text-xs font-mono uppercase tracking-widest mb-2",
              isActivePhase ? phaseInfo.color : "text-muted-foreground/50"
            )}>
              Phase {phase}: {phaseInfo.name}
            </h4>

            <div className="space-y-1">
              {modules.map((moduleId) => {
                const template = PROMPT_TEMPLATES[moduleId];
                const isActive = moduleId === currentModule;
                const isCompleted = completedModules.includes(moduleId);
                const isLocked = phase > currentPhase;

                return (
                  <button
                    key={moduleId}
                    onClick={() => !isLocked && onModuleSelect(moduleId)}
                    disabled={isLocked}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm font-body transition-colors rounded-sm flex items-center gap-2",
                      isActive && "bg-primary/15 text-primary border border-primary/30",
                      !isActive && isCompleted && "text-foreground/70 hover:bg-muted/50",
                      !isActive && !isCompleted && !isLocked && "text-muted-foreground hover:bg-muted/30",
                      isLocked && "text-muted-foreground/30 cursor-not-allowed"
                    )}
                  >
                    <span className="font-mono text-xs w-6">{moduleId}</span>
                    <span className="truncate">{template.moduleName}</span>
                    {isCompleted && (
                      <span className="ml-auto text-accent text-xs">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PhaseRail;

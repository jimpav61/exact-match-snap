import { Progress } from "@/components/ui/progress";
import { MODULE_ORDER, PHASE_MODULES } from "@/lib/promptTemplates";
import { CheckCircle2 } from "lucide-react";

interface ProgressIndicatorProps {
  completedModules: string[];
}

const ProgressIndicator = ({ completedModules }: ProgressIndicatorProps) => {
  const total = MODULE_ORDER.length;
  const done = completedModules.length;
  const percent = Math.round((done / total) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-muted-foreground">
          {done} of {total} modules
        </span>
        <span className="text-xs font-mono text-accent">{percent}%</span>
      </div>
      <Progress value={percent} className="h-2" />
      <div className="flex gap-1">
        {[1, 2, 3].map((phase) => {
          const modules = PHASE_MODULES[phase];
          const phaseComplete = modules.every((m) => completedModules.includes(m));
          const phaseStarted = modules.some((m) => completedModules.includes(m));
          return (
            <div
              key={phase}
              className={`flex-1 flex items-center justify-center gap-1 text-[10px] font-mono py-1 rounded-sm ${
                phaseComplete
                  ? "bg-accent/15 text-accent"
                  : phaseStarted
                  ? "bg-primary/10 text-primary"
                  : "bg-muted/30 text-muted-foreground/50"
              }`}
            >
              {phaseComplete && <CheckCircle2 className="w-3 h-3" />}
              P{phase}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator;

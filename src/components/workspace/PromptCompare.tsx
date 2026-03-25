import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface PromptCompareProps {
  currentPrompt: string;
  historicalPrompt: string;
  historicalVersion: number;
  onClose: () => void;
}

const PromptCompare = ({ currentPrompt, historicalPrompt, historicalVersion, onClose }: PromptCompareProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-sm font-semibold">Comparing with v{historicalVersion}</h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-7">
          <X className="w-3 h-3 mr-1" />
          Close
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 min-h-0">
        <div className="flex flex-col min-h-0">
          <span className="text-xs font-mono text-muted-foreground mb-1.5">v{historicalVersion} (old)</span>
          <ScrollArea className="flex-1 glass-card p-3 max-h-48 md:max-h-none">
            <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-muted-foreground">
              {historicalPrompt}
            </pre>
          </ScrollArea>
        </div>
        <div className="flex flex-col min-h-0">
          <span className="text-xs font-mono text-primary mb-1.5">Current</span>
          <ScrollArea className="flex-1 glass-card p-3 max-h-48 md:max-h-none">
            <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground/90">
              {currentPrompt}
            </pre>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default PromptCompare;

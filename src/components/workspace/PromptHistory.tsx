import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, RotateCcw, GitCompare, X, ChevronDown, ChevronUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface HistoryEntry {
  id: string;
  module_id: string;
  generated_prompt: string;
  version_number: number;
  created_at: string;
}

interface PromptHistoryProps {
  history: HistoryEntry[];
  onRestore: (entry: HistoryEntry) => void;
  onCompare: (entry: HistoryEntry) => void;
  comparing: HistoryEntry | null;
  onClearCompare: () => void;
}

const PromptHistory = ({ history, onRestore, onCompare, comparing, onClearCompare }: PromptHistoryProps) => {
  const [expanded, setExpanded] = useState(false);

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-body font-medium text-foreground">
          <History className="w-4 h-4 text-primary" />
          Prompt History
          <span className="text-xs text-muted-foreground font-mono">({history.length})</span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <ScrollArea className="max-h-64">
          <div className="divide-y divide-border">
            {history.map((entry) => (
              <div
                key={entry.id}
                className={`px-4 py-3 space-y-2 ${
                  comparing?.id === entry.id ? "bg-primary/5 ring-1 ring-inset ring-primary/20" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-primary">
                      v{entry.version_number}
                    </span>
                    <span className="text-xs text-muted-foreground font-body">
                      {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {comparing?.id === entry.id ? (
                      <Button variant="ghost" size="sm" onClick={onClearCompare} className="h-7 text-xs">
                        <X className="w-3 h-3 mr-1" />
                        Close
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => onCompare(entry)} className="h-7 text-xs">
                        <GitCompare className="w-3 h-3 mr-1" />
                        Compare
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => onRestore(entry)} className="h-7 text-xs">
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Restore
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground font-mono line-clamp-2 leading-relaxed">
                  {entry.generated_prompt.slice(0, 120)}…
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default PromptHistory;

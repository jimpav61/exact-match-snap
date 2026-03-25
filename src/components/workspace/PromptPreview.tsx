import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Check, Save } from "lucide-react";

interface PromptPreviewProps {
  prompt: string;
  onSave?: () => void;
  saving?: boolean;
  saved?: boolean;
}

const PromptPreview = ({ prompt, onSave, saving, saved }: PromptPreviewProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!prompt) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground font-body text-sm">
        <p>Fill out the form to see your assembled prompt here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold">Prompt Preview</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          {onSave && (
            <Button size="sm" onClick={onSave} disabled={saving || saved}>
              <Save className="w-4 h-4 mr-1" />
              {saved ? "Saved" : saving ? "Saving…" : "Save"}
            </Button>
          )}
        </div>
      </div>

      {/* Prompt content */}
      <ScrollArea className="flex-1 glass-card p-4">
        <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground/90">
          {prompt}
        </pre>
      </ScrollArea>

      {/* Word count */}
      <div className="mt-2 text-xs text-muted-foreground font-mono text-right">
        {prompt.split(/\s+/).length} words · {prompt.length} chars
      </div>
    </div>
  );
};

export default PromptPreview;

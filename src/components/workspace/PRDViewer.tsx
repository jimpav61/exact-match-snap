import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, Pencil, X, Save, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PRDSection {
  id: string;
  name: string;
  phase: string;
  content: string;
}

interface PRDViewerProps {
  sections: PRDSection[];
  onSectionUpdate: (sectionId: string, newContent: string) => void;
  onRegenerateFrom: (sectionId: string) => void;
  regeneratingFrom: string | null;
}

const PHASE_COLORS: Record<string, string> = {
  Plan: "text-green-400",
  Build: "text-blue-400",
  Improve: "text-orange-400",
};

const PRDViewer = ({ sections, onSectionUpdate, onRegenerateFrom, regeneratingFrom }: PRDViewerProps) => {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(sections.map((s) => s.id)));
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const startEdit = (section: PRDSection) => {
    setEditingId(section.id);
    setEditContent(section.content);
  };

  const saveEdit = (sectionId: string) => {
    onSectionUpdate(sectionId, editContent);
    setEditingId(null);
    toast({ title: "Section updated" });
  };

  const copySection = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Copied to clipboard" });
  };

  // Group by phase
  const phases = ["Plan", "Build", "Improve"];
  const grouped = phases.map((phase) => ({
    phase,
    sections: sections.filter((s) => s.phase === phase),
  }));

  return (
    <div className="space-y-6">
      {grouped.map((group) => (
        <div key={group.phase}>
          <h3 className={`text-xs font-mono uppercase tracking-widest mb-3 ${PHASE_COLORS[group.phase]}`}>
            Phase: {group.phase}
          </h3>
          <div className="space-y-2">
            {group.sections.map((section, i) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card border border-border/50 overflow-hidden"
              >
                {/* Header */}
                <button
                  onClick={() => toggleExpand(section.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-primary w-6">{section.id}</span>
                    <span className="font-body text-sm font-medium">{section.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      title="Regenerate this section + all downstream"
                      disabled={!!regeneratingFrom}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRegenerateFrom(section.id);
                      }}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${regeneratingFrom === section.id ? "animate-spin" : ""}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        copySection(section.content, section.id);
                      }}
                    >
                      {copiedId === section.id ? (
                        <Check className="w-3.5 h-3.5 text-accent" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        editingId === section.id ? setEditingId(null) : startEdit(section);
                      }}
                    >
                      {editingId === section.id ? (
                        <X className="w-3.5 h-3.5" />
                      ) : (
                        <Pencil className="w-3.5 h-3.5" />
                      )}
                    </Button>
                    {expandedIds.has(section.id) ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                    )}
                  </div>
                </button>

                {/* Content */}
                {expandedIds.has(section.id) && (
                  <div className="px-4 pb-4 border-t border-border/30">
                    {editingId === section.id ? (
                      <div className="mt-3 space-y-2">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={12}
                          className="bg-input border-border font-body text-xs resize-y"
                        />
                        <Button size="sm" onClick={() => saveEdit(section.id)} className="w-full">
                          <Save className="w-3.5 h-3.5 mr-1" /> Save Changes
                        </Button>
                      </div>
                    ) : (
                      <pre className="mt-3 text-xs font-body text-muted-foreground whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                        {section.content}
                      </pre>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PRDViewer;

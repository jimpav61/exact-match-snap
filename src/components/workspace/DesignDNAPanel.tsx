import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Globe, Loader2, Check, Sparkles, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const moods = [
  { id: "editorial", name: "Editorial / Luxe", colors: ["#1A1A2E", "#C9A96E", "#FFFFFF"] },
  { id: "brutalist", name: "Brutalist / Bold", colors: ["#000000", "#FFFFFF", "#FF0000"] },
  { id: "warm", name: "Warm / Organic", colors: ["#FFF5F0", "#E17055", "#6D4C41"] },
  { id: "dark", name: "Dark Mode Native", colors: ["#0A0A0A", "#6C5CE7", "#00F5D4"] },
  { id: "retro", name: "Retro / Playful", colors: ["#FFEB3B", "#FF5722", "#4CAF50"] },
  { id: "corporate", name: "Corporate / Clean", colors: ["#F8F9FA", "#2563EB", "#1E293B"] },
  { id: "minimal", name: "Neo-Minimal", colors: ["#FAFAFA", "#111111", "#666666"] },
  { id: "indie", name: "Indie / Craft", colors: ["#FDF6EC", "#6C5CE7", "#2D3436"] },
];

interface DesignDNA {
  mood: string;
  references: string[];
  primaryColor: string;
  secondaryColor: string;
  fontPreference: string;
}

interface DesignDNAPanelProps {
  projectId: string;
  designDNA: DesignDNA;
  onUpdate: (dna: DesignDNA) => void;
}

const DesignDNAPanel = ({ projectId, designDNA, onUpdate }: DesignDNAPanelProps) => {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [inspirationUrl, setInspirationUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scrapedFrom, setScrapedFrom] = useState<string | null>(null);
  const [localDNA, setLocalDNA] = useState<DesignDNA>(designDNA);

  const updateLocal = (partial: Partial<DesignDNA>) => {
    setLocalDNA((prev) => ({ ...prev, ...partial }));
  };

  const handleScrapeInspiration = async () => {
    if (!inspirationUrl.trim()) return;
    setScraping(true);

    try {
      const { data: result, error } = await supabase.functions.invoke("scrape-branding", {
        body: { url: inspirationUrl.trim() },
      });

      if (error || !result?.success || !result?.data) {
        toast({
          title: "Scrape failed",
          description: result?.error || error?.message || "Couldn't extract design data.",
          variant: "destructive",
        });
        setScraping(false);
        return;
      }

      const inspiration = result.data;
      const updates: Partial<DesignDNA> = {};
      if (inspiration.primaryColor) updates.primaryColor = inspiration.primaryColor;
      if (inspiration.secondaryColor) updates.secondaryColor = inspiration.secondaryColor;
      if (inspiration.colorScheme === "dark") updates.mood = "dark";
      if (inspiration.fontPrimary) updates.fontPreference = inspiration.fontPrimary;

      setLocalDNA((prev) => ({ ...prev, ...updates }));
      setScrapedFrom(inspirationUrl.trim());
      toast({
        title: "Design inspiration applied!",
        description: `Extracted from ${new URL(inspirationUrl.trim().startsWith("http") ? inspirationUrl.trim() : `https://${inspirationUrl.trim()}`).hostname} — review & save below.`,
      });
    } catch {
      toast({ title: "Error", description: "Failed to scrape. Check the URL.", variant: "destructive" });
    }

    setScraping(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("projects")
      .update({ design_dna: localDNA as any })
      .eq("id", projectId);

    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      onUpdate(localDNA);
      toast({ title: "Design DNA updated!" });
    }
    setSaving(false);
  };

  const hasChanges =
    localDNA.mood !== designDNA.mood ||
    localDNA.primaryColor !== designDNA.primaryColor ||
    localDNA.secondaryColor !== designDNA.secondaryColor ||
    localDNA.fontPreference !== designDNA.fontPreference;

  const currentMood = moods.find((m) => m.id === localDNA.mood);

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-body hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-primary" />
          <span className="font-medium">Design DNA</span>
          {currentMood && (
            <span className="text-xs text-muted-foreground">
              — {currentMood.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          )}
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm border border-border/50" style={{ backgroundColor: localDNA.primaryColor }} />
            <div className="w-3 h-3 rounded-sm border border-border/50" style={{ backgroundColor: localDNA.secondaryColor }} />
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-5">
              {/* URL Inspiration */}
              <div className="glass-card p-3 border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <Label className="font-body text-xs font-medium">Get inspired by a URL</Label>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      value={inspirationUrl}
                      onChange={(e) => setInspirationUrl(e.target.value)}
                      placeholder="https://stripe.com"
                      className="pl-8 h-8 rounded-none bg-muted/50 border-border font-body text-xs"
                      onKeyDown={(e) => e.key === "Enter" && handleScrapeInspiration()}
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleScrapeInspiration}
                    disabled={scraping || !inspirationUrl.trim()}
                    className="rounded-none font-body text-xs h-8 px-3"
                  >
                    {scraping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Extract"}
                  </Button>
                </div>
                {scrapedFrom && (
                  <p className="text-[10px] font-body text-primary mt-2 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Inspired by {new URL(scrapedFrom.startsWith("http") ? scrapedFrom : `https://${scrapedFrom}`).hostname}
                  </p>
                )}
              </div>

              {/* Mood */}
              <div>
                <Label className="font-body text-xs text-muted-foreground mb-2 block">Mood</Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {moods.map((mood) => (
                    <button
                      key={mood.id}
                      onClick={() => updateLocal({ mood: mood.id })}
                      className={`flex items-center gap-2 p-2 rounded-sm border text-left transition-all cursor-pointer text-xs font-body ${
                        localDNA.mood === mood.id
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-muted/20 text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      <div className="flex gap-0.5 shrink-0">
                        {mood.colors.map((color, i) => (
                          <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                        ))}
                      </div>
                      <span className="truncate">{mood.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="font-body text-xs text-muted-foreground mb-1.5 block">Primary</Label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={localDNA.primaryColor}
                      onChange={(e) => updateLocal({ primaryColor: e.target.value })}
                      className="w-8 h-8 rounded-none border border-border cursor-pointer"
                    />
                    <Input
                      value={localDNA.primaryColor}
                      onChange={(e) => updateLocal({ primaryColor: e.target.value })}
                      className="rounded-none bg-muted/50 border-border font-mono text-[10px] h-8"
                    />
                  </div>
                </div>
                <div>
                  <Label className="font-body text-xs text-muted-foreground mb-1.5 block">Secondary</Label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={localDNA.secondaryColor}
                      onChange={(e) => updateLocal({ secondaryColor: e.target.value })}
                      className="w-8 h-8 rounded-none border border-border cursor-pointer"
                    />
                    <Input
                      value={localDNA.secondaryColor}
                      onChange={(e) => updateLocal({ secondaryColor: e.target.value })}
                      className="rounded-none bg-muted/50 border-border font-mono text-[10px] h-8"
                    />
                  </div>
                </div>
              </div>

              {/* Font */}
              <div>
                <Label className="font-body text-xs text-muted-foreground mb-1.5 block">Font preference</Label>
                <Input
                  value={localDNA.fontPreference}
                  onChange={(e) => updateLocal({ fontPreference: e.target.value })}
                  placeholder="e.g. Inter, Playfair Display"
                  className="rounded-none bg-muted/50 border-border font-body text-xs h-8"
                />
              </div>

              {/* Save */}
              {hasChanges && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full rounded-none font-body text-xs h-8"
                    size="sm"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                    Save Design DNA
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DesignDNAPanel;

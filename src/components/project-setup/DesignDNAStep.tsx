import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Globe, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { ProjectSetupData } from "@/pages/NewProject";

const moods = [
  { id: "editorial", name: "Editorial / Luxe", colors: ["#1A1A2E", "#C9A96E", "#FFFFFF"], font: "Playfair Display" },
  { id: "brutalist", name: "Brutalist / Bold", colors: ["#000000", "#FFFFFF", "#FF0000"], font: "Space Mono" },
  { id: "warm", name: "Warm / Organic", colors: ["#FFF5F0", "#E17055", "#6D4C41"], font: "Nunito" },
  { id: "dark", name: "Dark Mode Native", colors: ["#0A0A0A", "#6C5CE7", "#00F5D4"], font: "Inter" },
  { id: "retro", name: "Retro / Playful", colors: ["#FFEB3B", "#FF5722", "#4CAF50"], font: "Press Start 2P" },
  { id: "corporate", name: "Corporate / Clean", colors: ["#F8F9FA", "#2563EB", "#1E293B"], font: "Inter" },
  { id: "minimal", name: "Neo-Minimal", colors: ["#FAFAFA", "#111111", "#666666"], font: "Instrument Sans" },
  { id: "indie", name: "Indie / Craft", colors: ["#FDF6EC", "#6C5CE7", "#2D3436"], font: "Libre Baskerville" },
];

const webReferences = ["Notion", "Linear", "Stripe", "Vercel"];
const mobileReferences = ["Instagram", "Duolingo", "Calm", "Cash App", "Arc Browser", "Things 3", "Airbnb"];

interface DesignDNAStepProps {
  data: ProjectSetupData;
  onChange: (partial: Partial<ProjectSetupData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const DesignDNAStep = ({ data, onChange, onNext, onBack }: DesignDNAStepProps) => {
  const isMobile = ["ios", "android", "cross_platform", "web_and_mobile"].includes(data.platformType);
  const references = isMobile ? [...mobileReferences, ...webReferences] : webReferences;
  const { toast } = useToast();

  const [inspirationUrl, setInspirationUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scrapedFrom, setScrapedFrom] = useState<string | null>(null);

  const updateDNA = (partial: Partial<ProjectSetupData["designDNA"]>) => {
    onChange({ designDNA: { ...data.designDNA, ...partial } });
  };

  const toggleReference = (ref: string) => {
    const current = data.designDNA.references;
    if (current.includes(ref)) {
      updateDNA({ references: current.filter((r) => r !== ref) });
    } else if (current.length < 3) {
      updateDNA({ references: [...current, ref] });
    }
  };

  const handleScrapeInspiration = async () => {
    if (!inspirationUrl.trim()) return;
    setScraping(true);

    try {
      const { data: result, error } = await supabase.functions.invoke("scrape-branding", {
        body: { url: inspirationUrl.trim() },
      });

      if (error) {
        toast({ title: "Scrape failed", description: error.message, variant: "destructive" });
        setScraping(false);
        return;
      }

      if (!result?.success || !result?.data) {
        toast({
          title: "No branding found",
          description: result?.error || "Couldn't extract design data from this URL. Try another site.",
          variant: "destructive",
        });
        setScraping(false);
        return;
      }

      const inspiration = result.data;

      // Auto-populate design tokens
      if (inspiration.primaryColor) updateDNA({ primaryColor: inspiration.primaryColor });
      if (inspiration.secondaryColor) updateDNA({ secondaryColor: inspiration.secondaryColor });

      // Try to match a mood based on color scheme
      if (inspiration.colorScheme === "dark") {
        updateDNA({ mood: "dark" });
      }

      setScrapedFrom(inspirationUrl.trim());
      toast({
        title: "Design inspiration applied!",
        description: `Extracted colors and typography from ${new URL(inspirationUrl.trim().startsWith("http") ? inspirationUrl.trim() : `https://${inspirationUrl.trim()}`).hostname}`,
      });
    } catch (err) {
      toast({ title: "Error", description: "Failed to scrape. Check the URL and try again.", variant: "destructive" });
    }

    setScraping(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-3">
        Design DNA
      </h2>
      <p className="text-muted-foreground font-body text-center mb-10">
        Define your visual identity. This gets injected into every prompt.
      </p>

      {/* URL Inspiration - Hero Feature */}
      <div className="mb-10">
        <div className="glass-card p-5 border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <Label className="font-body text-sm font-medium">
              Paste a URL for design inspiration
            </Label>
          </div>
          <p className="text-muted-foreground font-body text-xs mb-4">
            We'll extract the color palette, typography, and visual style — not copy it, but use it as a starting point for your project.
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={inspirationUrl}
                onChange={(e) => setInspirationUrl(e.target.value)}
                placeholder="https://stripe.com"
                className="pl-9 rounded-none bg-muted/50 border-border font-body text-sm"
                onKeyDown={(e) => e.key === "Enter" && handleScrapeInspiration()}
              />
            </div>
            <Button
              type="button"
              onClick={handleScrapeInspiration}
              disabled={scraping || !inspirationUrl.trim()}
              className="rounded-none font-body text-sm bg-primary hover:bg-primary/90 px-4"
            >
              {scraping ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Analyzing…
                </>
              ) : (
                "Extract"
              )}
            </Button>
          </div>
          {scrapedFrom && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-body text-primary mt-3 flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              Inspired by {new URL(scrapedFrom.startsWith("http") ? scrapedFrom : `https://${scrapedFrom}`).hostname} — colors applied below
            </motion.p>
          )}
        </div>
      </div>

      {/* Mood Grid */}
      <div className="mb-10">
        <Label className="font-body text-sm text-muted-foreground mb-3 block">Or pick a mood</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {moods.map((mood) => (
            <button
              key={mood.id}
              onClick={() => updateDNA({ mood: mood.id })}
              className={`relative glass-card p-4 text-left transition-all cursor-pointer group hover:border-primary/40 ${
                data.designDNA.mood === mood.id ? "border-primary glow-primary" : ""
              }`}
            >
              {data.designDNA.mood === mood.id && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              <div className="flex gap-1 mb-3">
                {mood.colors.map((color, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-sm border border-border/50"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <p className="font-body text-xs font-medium truncate">{mood.name}</p>
              <p className="font-body text-[10px] text-muted-foreground">{mood.font}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Reference Apps */}
      <div className="mb-10">
        <Label className="font-body text-sm text-muted-foreground mb-3 block">
          Reference apps (pick up to 3)
        </Label>
        <div className="flex flex-wrap gap-2">
          {references.map((ref) => (
            <button
              key={ref}
              onClick={() => toggleReference(ref)}
              className={`px-3 py-1.5 text-xs font-body rounded-sm border transition-colors cursor-pointer ${
                data.designDNA.references.includes(ref)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40"
              }`}
            >
              {ref}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Colors */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div>
          <Label className="font-body text-sm text-muted-foreground mb-2 block">Primary color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={data.designDNA.primaryColor}
              onChange={(e) => updateDNA({ primaryColor: e.target.value })}
              className="w-10 h-10 rounded-none border border-border cursor-pointer"
            />
            <Input
              value={data.designDNA.primaryColor}
              onChange={(e) => updateDNA({ primaryColor: e.target.value })}
              className="rounded-none bg-muted/50 border-border font-mono text-xs"
            />
          </div>
        </div>
        <div>
          <Label className="font-body text-sm text-muted-foreground mb-2 block">Secondary color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={data.designDNA.secondaryColor}
              onChange={(e) => updateDNA({ secondaryColor: e.target.value })}
              className="w-10 h-10 rounded-none border border-border cursor-pointer"
            />
            <Input
              value={data.designDNA.secondaryColor}
              onChange={(e) => updateDNA({ secondaryColor: e.target.value })}
              className="rounded-none bg-muted/50 border-border font-mono text-xs"
            />
          </div>
        </div>
      </div>

      {/* Mobile-specific settings */}
      {isMobile && (
        <div className="glass-card p-6 mb-10">
          <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            📱 Mobile Settings
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="font-body text-xs text-muted-foreground mb-1 block">Navigation pattern</Label>
              <select
                className="w-full bg-muted/50 border border-border rounded-none px-3 py-2 text-sm font-body"
                value={data.mobileConfig?.navigationPattern || "bottom_tab"}
                onChange={(e) =>
                  onChange({
                    mobileConfig: {
                      ...data.mobileConfig,
                      navigationPattern: e.target.value,
                      darkMode: data.mobileConfig?.darkMode || "both",
                      animationIntensity: data.mobileConfig?.animationIntensity || "standard",
                      useNativeComponents: data.mobileConfig?.useNativeComponents ?? true,
                    },
                  })
                }
              >
                <option value="bottom_tab">Bottom Tab Bar</option>
                <option value="drawer">Drawer Menu</option>
                <option value="stack">Navigation Stack Only</option>
                <option value="fab">Floating Action Button</option>
              </select>
            </div>
            <div>
              <Label className="font-body text-xs text-muted-foreground mb-1 block">Dark mode</Label>
              <select
                className="w-full bg-muted/50 border border-border rounded-none px-3 py-2 text-sm font-body"
                value={data.mobileConfig?.darkMode || "both"}
                onChange={(e) =>
                  onChange({
                    mobileConfig: {
                      ...data.mobileConfig!,
                      darkMode: e.target.value,
                    },
                  })
                }
              >
                <option value="light">Light only</option>
                <option value="dark">Dark only</option>
                <option value="both">Both (auto-switch)</option>
              </select>
            </div>
            <div>
              <Label className="font-body text-xs text-muted-foreground mb-1 block">Animation intensity</Label>
              <select
                className="w-full bg-muted/50 border border-border rounded-none px-3 py-2 text-sm font-body"
                value={data.mobileConfig?.animationIntensity || "standard"}
                onChange={(e) =>
                  onChange({
                    mobileConfig: {
                      ...data.mobileConfig!,
                      animationIntensity: e.target.value,
                    },
                  })
                }
              >
                <option value="minimal">Minimal</option>
                <option value="standard">Standard</option>
                <option value="playful">Playful</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2 font-body text-sm rounded-none">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!data.designDNA.mood}
          className="gap-2 font-body text-sm rounded-none bg-primary hover:bg-primary/90"
        >
          Continue <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};

export default DesignDNAStep;

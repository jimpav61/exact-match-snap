import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Globe, Loader2, Check, Sparkles, ArrowRight, ArrowLeft, Rocket, ChevronDown, ChevronUp, Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DesignDNA {
  mood: string;
  references: string[];
  primaryColor: string;
  secondaryColor: string;
  fontPreference: string;
}

interface IntakeData {
  appIdea: string;
  targetUser: string;
  coreAction: string;
  additionalContext: string;
  closestExisting: string;
  antiVision: string;
  timeline: string;
}

interface IntakeFormProps {
  projectId: string;
  projectName: string;
  designDNA: DesignDNA;
  platformType: string;
  onDesignDNAUpdate: (dna: DesignDNA) => void;
  onGenerate: (intake: IntakeData) => void;
  generating: boolean;
}

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

const STEPS = [
  { id: "idea", title: "Your App Idea", subtitle: "What are you building?" },
  { id: "design", title: "Design Direction", subtitle: "How should it look & feel?" },
  { id: "review", title: "Ready to Generate", subtitle: "Review & launch your PRD" },
];

const IntakeForm = ({
  projectId,
  projectName,
  designDNA,
  platformType,
  onDesignDNAUpdate,
  onGenerate,
  generating,
}: IntakeFormProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [intake, setIntake] = useState<IntakeData>({
    appIdea: "",
    targetUser: "",
    coreAction: "",
    additionalContext: "",
    closestExisting: "",
    antiVision: "",
    timeline: "",
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const advancedCount = [intake.closestExisting, intake.antiVision, intake.timeline].filter(v => v.trim().length > 0).length;
  const [localDNA, setLocalDNA] = useState<DesignDNA>(designDNA);
  const [inspirationUrl, setInspirationUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scrapedFrom, setScrapedFrom] = useState<string | null>(null);

  const updateDNA = (partial: Partial<DesignDNA>) => {
    setLocalDNA((prev) => ({ ...prev, ...partial }));
  };

  const handleScrape = async () => {
    if (!inspirationUrl.trim()) return;
    setScraping(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("scrape-branding", {
        body: { url: inspirationUrl.trim() },
      });
      if (error || !result?.success || !result?.data) {
        toast({ title: "Couldn't extract design", description: "Try a different URL.", variant: "destructive" });
        setScraping(false);
        return;
      }
      const ins = result.data;
      const updates: Partial<DesignDNA> = {};
      if (ins.primaryColor) updates.primaryColor = ins.primaryColor;
      if (ins.secondaryColor) updates.secondaryColor = ins.secondaryColor;
      if (ins.colorScheme === "dark") updates.mood = "dark";
      if (ins.fontPrimary) updates.fontPreference = ins.fontPrimary;
      setLocalDNA((prev) => ({ ...prev, ...updates }));
      setScrapedFrom(inspirationUrl.trim());
      toast({ title: "Design inspiration extracted!" });
    } catch {
      toast({ title: "Error scraping URL", variant: "destructive" });
    }
    setScraping(false);
  };

  const handleSaveDNA = async () => {
    await supabase
      .from("projects")
      .update({ design_dna: localDNA as any })
      .eq("id", projectId);
    onDesignDNAUpdate(localDNA);
  };

  const handleSubmit = async () => {
    await handleSaveDNA();
    onGenerate(intake);
  };

  const canAdvanceFromIdea = intake.appIdea.trim().length > 10;
  const canGenerate = canAdvanceFromIdea;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 flex-1">
            <button
              onClick={() => i <= step && setStep(i)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                i === step
                  ? "bg-primary text-primary-foreground"
                  : i < step
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </button>
            <div className="hidden sm:block">
              <p className={`text-xs font-body font-medium ${i === step ? "text-foreground" : "text-muted-foreground"}`}>
                {s.title}
              </p>
            </div>
            {i < STEPS.length - 1 && <div className="flex-1 h-px bg-border" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: App Idea */}
        {step === 0 && (
          <motion.div
            key="idea"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="font-display text-2xl font-bold">Tell us about your app</h2>
              <p className="text-muted-foreground font-body text-sm mt-1">
                Write in plain English — Prompt Pilot will turn this into a complete project specification.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="font-body text-sm font-medium">What's your app idea? *</Label>
                <Textarea
                  value={intake.appIdea}
                  onChange={(e) => setIntake((p) => ({ ...p, appIdea: e.target.value }))}
                  placeholder="e.g. A habit tracking app where users set daily goals, check them off, and see streaks over time..."
                  rows={4}
                  className="mt-1.5 bg-input border-border font-body text-sm"
                />
              </div>

              <div>
                <Label className="font-body text-sm font-medium">Who is the first user?</Label>
                <Input
                  value={intake.targetUser}
                  onChange={(e) => setIntake((p) => ({ ...p, targetUser: e.target.value }))}
                  placeholder="e.g. Busy professionals who want to build better daily habits"
                  className="mt-1.5 bg-input border-border font-body text-sm"
                />
              </div>

              <div>
                <Label className="font-body text-sm font-medium">What's the ONE core action?</Label>
                <Input
                  value={intake.coreAction}
                  onChange={(e) => setIntake((p) => ({ ...p, coreAction: e.target.value }))}
                  placeholder="e.g. Check off a habit and see their current streak"
                  className="mt-1.5 bg-input border-border font-body text-sm"
                />
              </div>

              <div>
                <Label className="font-body text-sm font-medium">Anything else we should know?</Label>
                <Textarea
                  value={intake.additionalContext}
                  onChange={(e) => setIntake((p) => ({ ...p, additionalContext: e.target.value }))}
                  placeholder="e.g. Should integrate with Apple Health, needs dark mode, targeting mobile-first..."
                  rows={3}
                  className="mt-1.5 bg-input border-border font-body text-sm"
                />
              </div>
            </div>

            {/* Deep Analysis Boost — collapsible optional section */}
            <div className="rounded-lg border border-purple-400/30 bg-purple-400/5 overflow-hidden">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center gap-2 p-3 text-left hover:bg-purple-400/10 transition-colors"
              >
                <Brain className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="text-sm font-body font-medium text-foreground">Deep Analysis Boost</span>
                {advancedCount > 0 && (
                  <span className="text-[10px] font-mono bg-purple-400/20 text-purple-400 px-1.5 py-0.5 rounded">
                    {advancedCount}/3 filled
                  </span>
                )}
                <span className="text-[10px] font-mono text-muted-foreground ml-auto mr-1">Optional</span>
                {showAdvanced ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
              </button>
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 space-y-3">
                      <div>
                        <Label className="font-body text-sm font-medium">What exists today that's closest to what you want?</Label>
                        <Input
                          value={intake.closestExisting}
                          onChange={(e) => setIntake((p) => ({ ...p, closestExisting: e.target.value }))}
                          placeholder="e.g. Habitica, Streaks, or 'nothing — this is new'"
                          className="mt-1.5 bg-input border-border font-body text-sm"
                        />
                      </div>
                      <div>
                        <Label className="font-body text-sm font-medium">What would make this a failure?</Label>
                        <Input
                          value={intake.antiVision}
                          onChange={(e) => setIntake((p) => ({ ...p, antiVision: e.target.value }))}
                          placeholder="e.g. If it becomes too complex, if nobody signs up after a week..."
                          className="mt-1.5 bg-input border-border font-body text-sm"
                        />
                      </div>
                      <div>
                        <Label className="font-body text-sm font-medium">What's your realistic timeline?</Label>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {["Weekend sprint", "1 week", "2–4 weeks", "1–3 months", "Ongoing / no deadline"].map((opt) => (
                            <button
                              key={opt}
                              onClick={() => setIntake((p) => ({ ...p, timeline: p.timeline === opt ? "" : opt }))}
                              className={`px-3 py-1.5 rounded-md text-xs font-body transition-all border ${
                                intake.timeline === opt
                                  ? "bg-purple-500 text-white border-purple-500"
                                  : "bg-muted/30 text-muted-foreground border-border hover:border-purple-400/50"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Button onClick={() => setStep(1)} disabled={!canAdvanceFromIdea} className="w-full">
              Continue to Design <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>
        )}

        {/* Step 2: Design */}
        {step === 1 && (
          <motion.div
            key="design"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="font-display text-2xl font-bold">Design Direction</h2>
              <p className="text-muted-foreground font-body text-sm mt-1">
                Set the visual identity — or drop a URL to get inspired by a site you love.
              </p>
            </div>

            {/* URL Inspiration */}
            <div className="glass-card p-4 border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <Label className="font-body text-sm font-medium">Get inspired by a URL</Label>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={inspirationUrl}
                    onChange={(e) => setInspirationUrl(e.target.value)}
                    placeholder="https://stripe.com"
                    className="pl-9 bg-muted/50 border-border font-body text-sm"
                    onKeyDown={(e) => e.key === "Enter" && handleScrape()}
                  />
                </div>
                <Button onClick={handleScrape} disabled={scraping || !inspirationUrl.trim()} variant="secondary">
                  {scraping ? <Loader2 className="w-4 h-4 animate-spin" /> : "Extract"}
                </Button>
              </div>
              {scrapedFrom && (
                <p className="text-xs font-body text-primary mt-2 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Inspired by {new URL(scrapedFrom.startsWith("http") ? scrapedFrom : `https://${scrapedFrom}`).hostname}
                </p>
              )}
            </div>

            {/* Mood */}
            <div>
              <Label className="font-body text-sm text-muted-foreground mb-2 block">Mood</Label>
              <div className="grid grid-cols-2 gap-2">
                {moods.map((mood) => (
                  <button
                    key={mood.id}
                    onClick={() => updateDNA({ mood: mood.id })}
                    className={`flex items-center gap-2 p-3 rounded-md border text-left transition-all cursor-pointer text-sm font-body ${
                      localDNA.mood === mood.id
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-muted/20 text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    <div className="flex gap-1 shrink-0">
                      {mood.colors.map((color, i) => (
                        <div key={i} className="w-4 h-4 rounded-sm" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                    <span className="truncate">{mood.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-body text-sm text-muted-foreground mb-1.5 block">Primary Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={localDNA.primaryColor}
                    onChange={(e) => updateDNA({ primaryColor: e.target.value })}
                    className="w-10 h-10 rounded border border-border cursor-pointer"
                  />
                  <Input
                    value={localDNA.primaryColor}
                    onChange={(e) => updateDNA({ primaryColor: e.target.value })}
                    className="bg-muted/50 border-border font-mono text-xs"
                  />
                </div>
              </div>
              <div>
                <Label className="font-body text-sm text-muted-foreground mb-1.5 block">Secondary Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={localDNA.secondaryColor}
                    onChange={(e) => updateDNA({ secondaryColor: e.target.value })}
                    className="w-10 h-10 rounded border border-border cursor-pointer"
                  />
                  <Input
                    value={localDNA.secondaryColor}
                    onChange={(e) => updateDNA({ secondaryColor: e.target.value })}
                    className="bg-muted/50 border-border font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Font */}
            <div>
              <Label className="font-body text-sm text-muted-foreground mb-1.5 block">Font Preference</Label>
              <Input
                value={localDNA.fontPreference}
                onChange={(e) => updateDNA({ fontPreference: e.target.value })}
                placeholder="e.g. Inter, Playfair Display"
                className="bg-muted/50 border-border font-body text-sm"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(0)} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button onClick={() => setStep(2)} className="flex-1">
                Review <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Review & Generate */}
        {step === 2 && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="font-display text-2xl font-bold">Ready to Generate Your PRD</h2>
              <p className="text-muted-foreground font-body text-sm mt-1">
                Prompt Pilot will assemble 9 specialized sections into one complete project specification.
              </p>
            </div>

            {/* Summary */}
            <div className="space-y-3">
              <div className="glass-card p-4">
                <h4 className="text-xs font-mono text-primary uppercase tracking-wider mb-2">App Idea</h4>
                <p className="text-sm font-body">{intake.appIdea}</p>
              </div>

              {intake.targetUser && (
                <div className="glass-card p-4">
                  <h4 className="text-xs font-mono text-primary uppercase tracking-wider mb-2">Target User</h4>
                  <p className="text-sm font-body">{intake.targetUser}</p>
                </div>
              )}

              {intake.coreAction && (
                <div className="glass-card p-4">
                  <h4 className="text-xs font-mono text-primary uppercase tracking-wider mb-2">Core Action</h4>
                  <p className="text-sm font-body">{intake.coreAction}</p>
                </div>
              )}

              <div className="glass-card p-4">
                <h4 className="text-xs font-mono text-primary uppercase tracking-wider mb-2">Design DNA</h4>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-6 h-6 rounded border border-border/50" style={{ backgroundColor: localDNA.primaryColor }} />
                    <div className="w-6 h-6 rounded border border-border/50" style={{ backgroundColor: localDNA.secondaryColor }} />
                  </div>
                  <span className="text-sm font-body text-muted-foreground">
                    {moods.find((m) => m.id === localDNA.mood)?.name || "No mood set"}
                    {localDNA.fontPreference && ` · ${localDNA.fontPreference}`}
                  </span>
                </div>
              </div>
            </div>

            {/* What will be generated */}
            <div className="glass-card p-4">
              <h4 className="text-xs font-mono text-accent uppercase tracking-wider mb-3">What Prompt Pilot will generate</h4>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { phase: "Plan", items: ["MVP Scope", "UX Design", "Data Model"] },
                  { phase: "Build", items: ["App Spec", "SaaS Logic", "Visual Code"] },
                  { phase: "Improve", items: ["Features", "QA & Bugs", "Optimization"] },
                ].map((g) => (
                  <div key={g.phase}>
                    <p className="text-xs font-mono text-primary mb-1">{g.phase}</p>
                    {g.items.map((item) => (
                      <p key={item} className="text-xs font-body text-muted-foreground">• {item}</p>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!canGenerate || generating}
                className="flex-1"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                    Generating PRD…
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4 mr-1" />
                    Generate My PRD
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IntakeForm;

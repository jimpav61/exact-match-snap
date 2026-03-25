import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import PhaseRail from "@/components/workspace/PhaseRail";
import SmartForm from "@/components/workspace/SmartForm";
import PromptPreview from "@/components/workspace/PromptPreview";
import PromptHistory from "@/components/workspace/PromptHistory";
import PromptCompare from "@/components/workspace/PromptCompare";
import { assemblePrompt, DesignPassport, ContextChainEntry } from "@/lib/promptEngine";
import { PROMPT_TEMPLATES } from "@/lib/promptTemplates";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface Project {
  id: string;
  name: string;
  platform_type: string;
  current_phase: number;
  current_module: string | null;
  design_dna: any;
  mobile_config: any;
}

interface ModuleResponse {
  id: string;
  module_id: string;
  form_data: any;
  generated_prompt_web: string | null;
  generated_prompt_mobile: string | null;
  is_finalized: boolean;
}

interface HistoryEntry {
  id: string;
  module_id: string;
  generated_prompt: string;
  version_number: number;
  created_at: string;
}

const ProjectWorkspace = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [project, setProject] = useState<Project | null>(null);
  const [responses, setResponses] = useState<ModuleResponse[]>([]);
  const [activeModule, setActiveModule] = useState("1A");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPhaseRail, setShowPhaseRail] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [comparingEntry, setComparingEntry] = useState<HistoryEntry | null>(null);

  const loadHistory = async (projectId: string, moduleId: string) => {
    const { data } = await supabase
      .from("prompt_history")
      .select("*")
      .eq("project_id", projectId)
      .eq("module_id", moduleId)
      .order("version_number", { ascending: false });
    setHistory((data || []) as HistoryEntry[]);
  };

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const [projRes, respRes] = await Promise.all([
        supabase.from("projects").select("*").eq("id", id).single(),
        supabase.from("module_responses").select("*").eq("project_id", id),
      ]);

      if (projRes.error || !projRes.data) {
        toast({ title: "Project not found", variant: "destructive" });
        navigate("/dashboard");
        return;
      }

      const proj = projRes.data as Project;
      const mod = proj.current_module || "1A";
      setProject(proj);
      setResponses((respRes.data || []) as ModuleResponse[]);
      setActiveModule(mod);
      setLoading(false);
      loadHistory(proj.id, mod);
    };
    load();
  }, [id]);

  useEffect(() => {
    if (project) {
      loadHistory(project.id, activeModule);
      setComparingEntry(null);
    }
  }, [activeModule, project]);

  const completedModules = useMemo(
    () => responses.filter((r) => r.is_finalized).map((r) => r.module_id),
    [responses]
  );

  const activeResponse = useMemo(
    () => responses.find((r) => r.module_id === activeModule),
    [responses, activeModule]
  );

  const contextChain: ContextChainEntry[] = useMemo(() => {
    return responses
      .filter((r) => r.is_finalized && r.module_id !== activeModule)
      .map((r) => ({
        moduleId: r.module_id,
        moduleName: PROMPT_TEMPLATES[r.module_id]?.moduleName || r.module_id,
        summary: (r.form_data as any)?.__userInput__?.slice(0, 200) || "No summary",
      }));
  }, [responses, activeModule]);

  const designPassport: DesignPassport = useMemo(() => {
    const dna = project?.design_dna as any;
    return {
      mood: dna?.mood || "",
      references: dna?.references || [],
      primaryColor: dna?.primaryColor || "#6C5CE7",
      secondaryColor: dna?.secondaryColor || "#00F5D4",
      fontPreference: dna?.fontPreference || "",
    };
  }, [project]);

  const handleFormSubmit = (formData: Record<string, string>) => {
    if (!project) return;
    const prompt = assemblePrompt({
      moduleId: activeModule,
      formData,
      designPassport,
      contextChain,
      platformType: project.platform_type,
    });
    setGeneratedPrompt(prompt);
    setSaved(false);
  };

  const handleSave = async () => {
    if (!project || !generatedPrompt) return;
    setSaving(true);

    const isMobilePlatform = project.platform_type !== "web";
    const upsertData: any = {
      project_id: project.id,
      module_id: activeModule,
      form_data: { __userInput__: generatedPrompt.split("\n\n--- DESIGN PASSPORT")[0] },
      is_finalized: true,
      ...(isMobilePlatform
        ? { generated_prompt_mobile: generatedPrompt }
        : { generated_prompt_web: generatedPrompt }),
    };

    // Save to history
    const nextVersion = history.length > 0 ? history[0].version_number + 1 : 1;
    await supabase.from("prompt_history").insert({
      project_id: project.id,
      module_id: activeModule,
      form_data: upsertData.form_data,
      generated_prompt: generatedPrompt,
      platform_type: project.platform_type,
      version_number: nextVersion,
    });

    if (activeResponse) {
      const { error } = await supabase
        .from("module_responses")
        .update(upsertData)
        .eq("id", activeResponse.id);
      if (error) {
        toast({ title: "Save failed", description: error.message, variant: "destructive" });
      } else {
        setSaved(true);
        toast({ title: "Prompt saved!" });
      }
    } else {
      const { error, data } = await supabase
        .from("module_responses")
        .insert(upsertData)
        .select()
        .single();
      if (error) {
        toast({ title: "Save failed", description: error.message, variant: "destructive" });
      } else {
        setResponses((prev) => [...prev, data as ModuleResponse]);
        setSaved(true);
        toast({ title: "Prompt saved!" });
      }
    }

    await supabase.from("projects").update({ current_module: activeModule }).eq("id", project.id);
    setSaving(false);
    loadHistory(project.id, activeModule);
  };

  const handleRestore = (entry: HistoryEntry) => {
    setGeneratedPrompt(entry.generated_prompt);
    setSaved(false);
    setComparingEntry(null);
    toast({ title: `Restored v${entry.version_number}` });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground font-body">Loading workspace…</div>
      </div>
    );
  }

  if (!project) return null;

  const currentTemplate = PROMPT_TEMPLATES[activeModule];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-14 flex items-center border-b border-border px-3 sm:px-4 gap-2 sm:gap-4 shrink-0">
            <SidebarTrigger />
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="hidden sm:inline-flex">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Dashboard
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="sm:hidden">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <h1 className="font-display text-sm font-semibold truncate">{project.name}</h1>
          </header>

          {/* Mobile Phase Rail Toggle */}
          <div className="lg:hidden border-b border-border">
            <button
              onClick={() => setShowPhaseRail(!showPhaseRail)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-body"
            >
              <span className="text-muted-foreground">
                Module <span className="text-foreground font-mono font-medium">{activeModule}</span>
                {currentTemplate && <span className="text-muted-foreground"> — {currentTemplate.moduleName}</span>}
              </span>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showPhaseRail ? "rotate-180" : ""}`} />
            </button>
            {showPhaseRail && (
              <div className="px-4 pb-4 border-t border-border/50">
                <PhaseRail
                  currentPhase={project.current_phase}
                  currentModule={activeModule}
                  completedModules={completedModules}
                  onModuleSelect={(m) => {
                    setActiveModule(m);
                    setGeneratedPrompt("");
                    setSaved(false);
                    setShowPhaseRail(false);
                  }}
                />
              </div>
            )}
          </div>

          {/* Main workspace */}
          <div className="flex-1 flex flex-col lg:flex-row min-h-0">
            {/* Phase Rail sidebar — desktop */}
            <aside className="w-56 shrink-0 border-r border-border p-4 overflow-y-auto hidden lg:block">
              <PhaseRail
                currentPhase={project.current_phase}
                currentModule={activeModule}
                completedModules={completedModules}
                onModuleSelect={(m) => {
                  setActiveModule(m);
                  setGeneratedPrompt("");
                  setSaved(false);
                }}
              />
            </aside>

            {/* Smart Form */}
            <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto border-b lg:border-b-0 lg:border-r border-border">
              <div className="max-w-xl mx-auto lg:mx-0">
                <SmartForm
                  moduleId={activeModule}
                  initialData={activeResponse?.form_data as Record<string, string> | undefined}
                  onSubmit={handleFormSubmit}
                  saving={saving}
                />
              </div>
            </div>

            {/* Prompt Preview + History */}
            <div className={`xl:w-[420px] shrink-0 p-4 sm:p-6 overflow-y-auto ${generatedPrompt || history.length > 0 ? "flex flex-col gap-4" : "hidden xl:flex xl:flex-col"}`}>
              {comparingEntry && generatedPrompt ? (
                <PromptCompare
                  currentPrompt={generatedPrompt}
                  historicalPrompt={comparingEntry.generated_prompt}
                  historicalVersion={comparingEntry.version_number}
                  onClose={() => setComparingEntry(null)}
                />
              ) : (
                <PromptPreview
                  prompt={generatedPrompt}
                  onSave={handleSave}
                  saving={saving}
                  saved={saved}
                />
              )}
              <PromptHistory
                history={history}
                onRestore={handleRestore}
                onCompare={setComparingEntry}
                comparing={comparingEntry}
                onClearCompare={() => setComparingEntry(null)}
              />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ProjectWorkspace;

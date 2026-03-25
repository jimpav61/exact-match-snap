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
import { assemblePrompt, DesignPassport, ContextChainEntry } from "@/lib/promptEngine";
import { PROMPT_TEMPLATES } from "@/lib/promptTemplates";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

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

const ProjectWorkspace = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [responses, setResponses] = useState<ModuleResponse[]>([]);
  const [activeModule, setActiveModule] = useState("1A");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch project + existing responses
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

      setProject(projRes.data as Project);
      setResponses((respRes.data || []) as ModuleResponse[]);
      setActiveModule(projRes.data.current_module || "1A");
      setLoading(false);
    };
    load();
  }, [id]);

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

    const isMobile = project.platform_type !== "web";
    const upsertData: any = {
      project_id: project.id,
      module_id: activeModule,
      form_data: { __userInput__: generatedPrompt.split("\n\n--- DESIGN PASSPORT")[0] },
      is_finalized: true,
      ...(isMobile
        ? { generated_prompt_mobile: generatedPrompt }
        : { generated_prompt_web: generatedPrompt }),
    };

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

    // Update project current_module
    await supabase.from("projects").update({ current_module: activeModule }).eq("id", project.id);
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground font-body">Loading workspace…</div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-14 flex items-center border-b border-border px-4 gap-4 shrink-0">
            <SidebarTrigger />
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Dashboard
            </Button>
            <div className="h-4 w-px bg-border" />
            <h1 className="font-display text-sm font-semibold truncate">{project.name}</h1>
          </header>

          {/* Main workspace: Phase Rail + Form + Preview */}
          <div className="flex-1 flex min-h-0">
            {/* Phase Rail sidebar */}
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
            <div className="flex-1 min-w-0 p-6 lg:p-8 overflow-y-auto border-r border-border">
              <div className="max-w-xl">
                <SmartForm
                  moduleId={activeModule}
                  initialData={activeResponse?.form_data as Record<string, string> | undefined}
                  onSubmit={handleFormSubmit}
                  saving={saving}
                />
              </div>
            </div>

            {/* Prompt Preview */}
            <div className="w-[420px] shrink-0 p-6 overflow-y-auto hidden xl:flex xl:flex-col">
              <PromptPreview
                prompt={generatedPrompt}
                onSave={handleSave}
                saving={saving}
                saved={saved}
              />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ProjectWorkspace;

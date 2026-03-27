import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import IntakeForm from "@/components/workspace/IntakeForm";
import PRDViewer from "@/components/workspace/PRDViewer";
import ExportPanel from "@/components/workspace/ExportPanel";
import GeneratingOverlay from "@/components/workspace/GeneratingOverlay";
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

interface PRDSection {
  id: string;
  name: string;
  phase: string;
  content: string;
}

const ProjectWorkspace = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [regeneratingFrom, setRegeneratingFrom] = useState<string | null>(null);
  const [prdSections, setPrdSections] = useState<PRDSection[]>([]);
  const [hasPRD, setHasPRD] = useState(false);

  // Load project and check if PRD already exists
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
      setProject(proj);

      // Check if we already have finalized module responses (PRD exists)
      const responses = respRes.data || [];
      const finalized = responses.filter((r: any) => r.is_finalized);

      if (finalized.length > 0) {
        // Reconstruct PRD sections from saved responses
        const sectionNames: Record<string, { name: string; phase: string }> = {
          "1A": { name: "Product Vision & MVP Scope", phase: "Plan" },
          "1B": { name: "UX & Interface Design", phase: "Plan" },
          "1C": { name: "Data Architecture", phase: "Plan" },
          "2A": { name: "Full Application Build Spec", phase: "Build" },
          "2B": { name: "SaaS Business Logic", phase: "Build" },
          "2C": { name: "Visual Design Implementation", phase: "Build" },
          "3A": { name: "Feature Expansion Plan", phase: "Improve" },
          "3B": { name: "Bug Prevention & QA Strategy", phase: "Improve" },
          "3C": { name: "Iteration & Optimization Roadmap", phase: "Improve" },
        };

        const sections: PRDSection[] = finalized
          .map((r: any) => ({
            id: r.module_id,
            name: sectionNames[r.module_id]?.name || r.module_id,
            phase: sectionNames[r.module_id]?.phase || "Plan",
            content: r.generated_prompt_web || r.generated_prompt_mobile || "",
          }))
          .sort((a: PRDSection, b: PRDSection) => a.id.localeCompare(b.id));

        setPrdSections(sections);
        setHasPRD(true);
      }

      setLoading(false);
    };
    load();
  }, [id]);

  const designPassport = useMemo(() => {
    const dna = project?.design_dna as any;
    return {
      mood: dna?.mood || "",
      references: dna?.references || [],
      primaryColor: dna?.primaryColor || "#6C5CE7",
      secondaryColor: dna?.secondaryColor || "#00F5D4",
      fontPreference: dna?.fontPreference || "",
    };
  }, [project]);

  const handleGenerate = async (intake: { appIdea: string; targetUser: string; coreAction: string; additionalContext: string }) => {
    if (!project) return;
    setGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-prd", {
        body: {
          intake,
          designPassport,
          platformType: project.platform_type,
          projectId: project.id,
        },
      });

      if (error) throw error;

      setPrdSections(data.sections);
      setHasPRD(true);
      toast({ title: "PRD generated!", description: "Your complete project specification is ready." });
    } catch (err: any) {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    }

    setGenerating(false);
  };

  const handleSectionUpdate = async (sectionId: string, newContent: string) => {
    setPrdSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, content: newContent } : s))
    );

    // Save to DB
    if (project) {
      const isMobile = project.platform_type !== "web";
      const updateData = isMobile
        ? { generated_prompt_mobile: newContent }
        : { generated_prompt_web: newContent };

      await supabase
        .from("module_responses")
        .update(updateData)
        .eq("project_id", project.id)
        .eq("module_id", sectionId);
    }
  };

  const handleRegenerateFrom = async (sectionId: string) => {
    if (!project) return;
    setRegeneratingFrom(sectionId);

    try {
      const { data, error } = await supabase.functions.invoke("regenerate-section", {
        body: {
          projectId: project.id,
          fromModuleId: sectionId,
          designPassport,
          platformType: project.platform_type,
        },
      });

      if (error) throw error;

      // Merge updated sections into current state
      setPrdSections((prev) => {
        const updated = new Map(data.updatedSections.map((s: PRDSection) => [s.id, s]));
        return prev.map((s) => (updated.has(s.id) ? (updated.get(s.id) as PRDSection) : s));
      });

      toast({ title: "Sections regenerated", description: `${sectionId} and all downstream sections updated.` });
    } catch (err: any) {
      toast({ title: "Regeneration failed", description: err.message, variant: "destructive" });
    }

    setRegeneratingFrom(null);
  };

  const handleStartOver = () => {
    setHasPRD(false);
    setPrdSections([]);
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
            {hasPRD && (
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-accent font-mono hidden sm:inline">PRD Complete ✓</span>
                <Button variant="outline" size="sm" onClick={handleStartOver} className="text-xs">
                  New PRD
                </Button>
              </div>
            )}
          </header>

          {/* Main content */}
          <div className="flex-1 overflow-y-auto">
            {!hasPRD ? (
              /* Intake Form */
              <div className="p-4 sm:p-6 lg:p-8">
                <IntakeForm
                  projectId={project.id}
                  projectName={project.name}
                  designDNA={designPassport}
                  platformType={project.platform_type}
                  onDesignDNAUpdate={(dna) => {
                    setProject((prev) => prev ? { ...prev, design_dna: dna } : prev);
                  }}
                  onGenerate={handleGenerate}
                  generating={generating}
                />
              </div>
            ) : (
              /* PRD View + Export */
              <div className="flex flex-col lg:flex-row min-h-0">
                {/* PRD Sections */}
                <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                  <div className="max-w-3xl mx-auto">
                    <div className="mb-6">
                      <h2 className="font-display text-2xl font-bold">Your Complete PRD</h2>
                      <p className="text-sm text-muted-foreground font-body mt-1">
                        9 sections assembled from your input. Click any section to edit, or export for your platform.
                      </p>
                    </div>
                    <PRDViewer
                      sections={prdSections}
                      onSectionUpdate={handleSectionUpdate}
                      onRegenerateFrom={handleRegenerateFrom}
                      regeneratingFrom={regeneratingFrom}
                    />
                  </div>
                </div>

                {/* Export Panel — sidebar on desktop, bottom on mobile */}
                <div className="lg:w-[380px] shrink-0 border-t lg:border-t-0 lg:border-l border-border p-4 sm:p-6 overflow-y-auto">
                  <ExportPanel
                    sections={prdSections}
                    projectName={project.name}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Generating Overlay */}
        <GeneratingOverlay active={generating} />
      </div>
    </SidebarProvider>
  );
};

export default ProjectWorkspace;

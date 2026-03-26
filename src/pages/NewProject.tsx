import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import PlatformStep from "@/components/project-setup/PlatformStep";
import RouterStep from "@/components/project-setup/RouterStep";
import DesignDNAStep from "@/components/project-setup/DesignDNAStep";
import ProjectNameStep from "@/components/project-setup/ProjectNameStep";

export interface ProjectSetupData {
  platformType: string;
  routerSelection: string;
  designDNA: {
    mood: string;
    references: string[];
    primaryColor: string;
    secondaryColor: string;
    fontPreference: string;
  };
  mobileConfig?: {
    navigationPattern: string;
    darkMode: string;
    animationIntensity: string;
    useNativeComponents: boolean;
  };
  projectName: string;
}

const NewProject = () => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<ProjectSetupData>({
    platformType: "",
    routerSelection: "",
    designDNA: {
      mood: "",
      references: [],
      primaryColor: "#6C5CE7",
      secondaryColor: "#00F5D4",
      fontPreference: "",
    },
    projectName: "",
  });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const updateData = (partial: Partial<ProjectSetupData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  const handleCreate = async () => {
    if (!user) return;
    setSaving(true);

    const phaseMap: Record<string, number> = {
      idea: 1,
      plan: 2,
      app: 3,
    };

    const { error } = await supabase.from("projects").insert({
      user_id: user.id,
      name: data.projectName,
      platform_type: data.platformType,
      current_phase: phaseMap[data.routerSelection] || 1,
      router_selection: data.routerSelection,
      design_dna: data.designDNA as any,
      mobile_config: data.mobileConfig as any,
    });

    if (error) {
      toast({ title: "Error creating project", description: error.message, variant: "destructive" });
      setSaving(false);
    } else {
      toast({ title: "Project created!" });
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-3xl">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1 rounded-full transition-all duration-300 ${
                s === step
                  ? "w-12 bg-primary"
                  : s < step
                  ? "w-8 bg-primary/40"
                  : "w-8 bg-muted"
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <PlatformStep
            selected={data.platformType}
            onSelect={(platformType) => {
              updateData({ platformType });
              setStep(2);
            }}
          />
        )}

        {step === 2 && (
          <RouterStep
            selected={data.routerSelection}
            onSelect={(routerSelection) => {
              updateData({ routerSelection });
              setStep(3);
            }}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <DesignDNAStep
            data={data}
            onChange={updateData}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 && (
          <ProjectNameStep
            name={data.projectName}
            onChange={(projectName) => updateData({ projectName })}
            onSubmit={handleCreate}
            onBack={() => setStep(3)}
            saving={saving}
          />
        )}
      </div>
    </div>
  );
};

export default NewProject;

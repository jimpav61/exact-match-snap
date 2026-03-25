import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Plus, Globe, Smartphone, Monitor, Clock } from "lucide-react";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface Project {
  id: string;
  name: string;
  platform_type: string;
  current_phase: number;
  current_module: string;
  design_dna: any;
  updated_at: string;
}

const platformIcons: Record<string, React.ReactNode> = {
  web: <Globe className="w-4 h-4" />,
  ios: <Smartphone className="w-4 h-4" />,
  android: <Smartphone className="w-4 h-4" />,
  cross_platform: <><Smartphone className="w-3.5 h-3.5" /><Smartphone className="w-3.5 h-3.5" /></>,
  web_and_mobile: <><Globe className="w-3.5 h-3.5" /><Smartphone className="w-3.5 h-3.5" /></>,
};

const phaseLabels: Record<number, { label: string; color: string }> = {
  1: { label: "Plan", color: "bg-green-500/20 text-green-400" },
  2: { label: "Build", color: "bg-blue-500/20 text-blue-400" },
  3: { label: "Improve", color: "bg-orange-500/20 text-orange-400" },
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("updated_at", { ascending: false });

      if (!error && data) setProjects(data);
      setLoading(false);
    };

    fetchProjects();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays}d ago`;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b border-border px-4 gap-4">
            <SidebarTrigger />
            <h1 className="font-body text-sm font-medium text-muted-foreground">Dashboard</h1>
          </header>

          <main className="flex-1 p-6 lg:p-10">
            <div className="max-w-6xl mx-auto">
              <div className="mb-10">
                <h2 className="font-display text-3xl font-bold mb-2">
                  Welcome back{user?.user_metadata?.display_name ? `, ${user.user_metadata.display_name}` : ""}
                </h2>
                <p className="text-muted-foreground font-body">
                  Your prompt engineering command center
                </p>
              </div>

              {/* New Project CTA */}
              <button
                onClick={() => navigate("/project/new")}
                className="w-full glass-card p-6 mb-8 flex items-center gap-4 hover:border-primary/40 transition-colors group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-none bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-display text-lg font-semibold">New Project</h3>
                  <p className="text-muted-foreground font-body text-sm">
                    Start a new web or mobile app project
                  </p>
                </div>
              </button>

              {/* Project Grid */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="glass-card p-6 animate-pulse">
                      <div className="h-5 bg-muted rounded w-2/3 mb-3" />
                      <div className="h-4 bg-muted rounded w-1/3" />
                    </div>
                  ))}
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-20">
                  <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-body">
                    No projects yet. Create your first one!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map((project) => {
                    const phase = phaseLabels[project.current_phase];
                    return (
                      <button
                        key={project.id}
                        onClick={() => navigate(`/project/${project.id}`)}
                        className="glass-card p-6 text-left hover:border-primary/30 transition-colors cursor-pointer"
                      >
                        <h3 className="font-display text-lg font-semibold mb-2 truncate">
                          {project.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`inline-flex items-center px-2 py-0.5 text-xs font-body font-medium rounded-sm ${phase.color}`}>
                            {phase.label}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-body text-muted-foreground bg-muted/50 rounded-sm">
                            {platformIcons[project.platform_type]}
                            {project.platform_type.replace("_", " ")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground font-body">
                          <Clock className="w-3 h-3" />
                          {formatDate(project.updated_at)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;

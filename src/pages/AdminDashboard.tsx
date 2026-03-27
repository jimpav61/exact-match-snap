import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FolderOpen, Zap, TrendingUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface AuthUser {
  id: string;
  email: string;
  last_sign_in_at: string | null;
  created_at: string;
}

interface UserProfile {
  id: string;
  display_name: string | null;
  subscription_tier: string;
  created_at: string;
}

interface ProjectOverview {
  id: string;
  name: string;
  platform_type: string;
  current_phase: number;
  created_at: string;
  user_id: string;
}

interface UsageStat {
  user_id: string;
  count: number;
}

const AdminDashboard = () => {
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [projects, setProjects] = useState<ProjectOverview[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [profilesRes, projectsRes, usageRes, authRes] = await Promise.all([
        supabase.from("profiles").select("id, display_name, subscription_tier, created_at").order("created_at", { ascending: false }),
        supabase.from("projects").select("id, name, platform_type, current_phase, created_at, user_id").order("created_at", { ascending: false }),
        supabase.from("usage_tracking").select("user_id"),
        supabase.functions.invoke("admin-list-users"),
      ]);

      setProfiles((profilesRes.data || []) as UserProfile[]);
      setProjects((projectsRes.data || []) as ProjectOverview[]);
      if (authRes.data && Array.isArray(authRes.data)) {
        setAuthUsers(authRes.data as AuthUser[]);
      }

      // Aggregate usage by user
      const usageMap = new Map<string, number>();
      (usageRes.data || []).forEach((row: any) => {
        usageMap.set(row.user_id, (usageMap.get(row.user_id) || 0) + 1);
      });
      setUsageStats(Array.from(usageMap, ([user_id, count]) => ({ user_id, count })));

      setLoading(false);
    };
    load();
  }, []);

  const totalGenerations = usageStats.reduce((sum, s) => sum + s.count, 0);
  const getUserName = (userId: string) => {
    const p = profiles.find((pr) => pr.id === userId);
    return p?.display_name || "Unknown";
  };
  const getUserEmail = (userId: string) => {
    const u = authUsers.find((a) => a.id === userId);
    return u?.email || "—";
  };
  const getUserLastSignIn = (userId: string) => {
    const u = authUsers.find((a) => a.id === userId);
    return u?.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : "Never";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground font-body">Loading admin…</div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border px-4 gap-4 shrink-0">
            <SidebarTrigger />
            <h1 className="font-display text-lg font-bold">Admin Dashboard</h1>
          </header>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-body text-muted-foreground">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-display font-bold">{profiles.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-body text-muted-foreground">Total Projects</CardTitle>
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-display font-bold">{projects.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-body text-muted-foreground">Prompt Generations</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-display font-bold">{totalGenerations}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-body text-muted-foreground">Paid Users</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-display font-bold">
                    {profiles.filter((p) => p.subscription_tier !== "free").length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-body">Name</TableHead>
                        <TableHead className="font-body">Email</TableHead>
                        <TableHead className="font-body">Tier</TableHead>
                        <TableHead className="font-body">Projects</TableHead>
                        <TableHead className="font-body">Generations</TableHead>
                        <TableHead className="font-body">Last Sign In</TableHead>
                        <TableHead className="font-body">Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profiles.map((profile) => {
                        const userProjects = projects.filter((p) => p.user_id === profile.id);
                        const userUsage = usageStats.find((u) => u.user_id === profile.id);
                        return (
                          <TableRow key={profile.id}>
                            <TableCell className="font-body font-medium">
                              {profile.display_name || "—"}
                            </TableCell>
                            <TableCell className="font-body text-sm">
                              {getUserEmail(profile.id)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={profile.subscription_tier === "free" ? "secondary" : "default"} className="font-body">
                                {profile.subscription_tier}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-body">{userProjects.length}</TableCell>
                            <TableCell className="font-body">{userUsage?.count || 0}</TableCell>
                            <TableCell className="font-body text-muted-foreground text-sm">
                              {getUserLastSignIn(profile.id)}
                            </TableCell>
                            <TableCell className="font-body text-muted-foreground text-sm">
                              {new Date(profile.created_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {profiles.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground font-body py-8">
                            No users yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Projects Table */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display">All Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-body">Project</TableHead>
                        <TableHead className="font-body">Owner</TableHead>
                        <TableHead className="font-body">Platform</TableHead>
                        <TableHead className="font-body">Phase</TableHead>
                        <TableHead className="font-body">Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projects.map((project) => (
                        <TableRow key={project.id}>
                          <TableCell className="font-body font-medium">{project.name}</TableCell>
                          <TableCell className="font-body">{getUserName(project.user_id)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-body">{project.platform_type}</Badge>
                          </TableCell>
                          <TableCell className="font-body">Phase {project.current_phase}</TableCell>
                          <TableCell className="font-body text-muted-foreground text-sm">
                            {new Date(project.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                      {projects.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground font-body py-8">
                            No projects yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;

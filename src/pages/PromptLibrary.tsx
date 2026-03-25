import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Lock,
  Sparkles,
  Rocket,
  Layout,
  Database,
  Code2,
  Wrench,
  Bug,
  RefreshCcw,
  ArrowRight,
  Eye,
} from "lucide-react";

interface PromptCategory {
  id: string;
  moduleId: string;
  name: string;
  phase: "plan" | "build" | "improve";
  icon: React.ElementType;
  description: string;
  previewSnippet: string;
  fullPreview: string;
  tags: string[];
}

const CATEGORIES: PromptCategory[] = [
  {
    id: "mvp-scoper",
    moduleId: "1A",
    name: "MVP Scoper",
    phase: "plan",
    icon: Rocket,
    description:
      "Turn your idea into a same-day launch plan. Ruthless scoping cuts to the 3 features that matter, with hourly milestones and deployable code.",
    previewSnippet:
      "You are a product engineer from OpenAI's rapid prototyping team who ships minimum viable products in hours not months…",
    fullPreview:
      "…Ruthless scoping: cut my idea down to the 3 features that MUST work • No-code fast path evaluation • Auth decision matrix • One-page version assessment • Deploy in 10 minutes • Landing page + feedback mechanism • What to skip list",
    tags: ["MVP", "Launch", "Scoping"],
  },
  {
    id: "ux-architect",
    moduleId: "1B",
    name: "UX Architect",
    phase: "plan",
    icon: Layout,
    description:
      "Design interfaces so intuitive users never need instructions. Complete UI spec with layout, navigation, empty states, and micro-interactions.",
    previewSnippet:
      "You are a senior UX designer from Tesla's software team who worked under Karpathy's philosophy that technology should be invisible…",
    fullPreview:
      "…Layout structure • Navigation flow • Component selection • Visual hierarchy • Empty, loading & error states • Mobile adaptation • Accessibility • Micro-interactions",
    tags: ["UX", "Design", "UI Spec"],
  },
  {
    id: "data-architect",
    moduleId: "1C",
    name: "Data Architect",
    phase: "plan",
    icon: Database,
    description:
      "Design a complete database from plain English. Tables, relationships, sample data, and a query library — no SQL knowledge needed.",
    previewSnippet:
      "You are a senior database architect who trained under Karpathy's methodology of making AI infrastructure invisible…",
    fullPreview:
      "…Data identification • Table creation • Relationships • Required fields • Unique constraints • Sample data • Query library • Search functionality",
    tags: ["Database", "Schema", "Backend"],
  },
  {
    id: "full-app-builder",
    moduleId: "2A",
    name: "Full App Builder",
    phase: "build",
    icon: Code2,
    description:
      "Build a complete working web application from a plain English description. Frontend, backend, database, auth, and one-command deployment.",
    previewSnippet:
      "You are a senior staff engineer at Tesla who builds entire applications from plain English descriptions…",
    fullPreview:
      "…Requirement translation • Tech stack selection • Frontend + Backend build • Database design • User flow • Responsive design • Error handling • One-command deployment",
    tags: ["Full Stack", "Web App", "Deploy"],
  },
  {
    id: "saas-builder",
    moduleId: "2B",
    name: "SaaS Builder",
    phase: "build",
    icon: Sparkles,
    description:
      "Generate an entire SaaS application: landing page, auth, dashboard, Stripe billing, admin panel, and deployment — all from one prompt.",
    previewSnippet:
      "You are the embodiment of Karpathy's vibe coding vision — an AI that can take a complete SaaS business idea…",
    fullPreview:
      "…Landing page • Authentication • Dashboard • Core feature • Settings • Stripe pricing + billing • Database • API • Admin panel • Deployment",
    tags: ["SaaS", "Stripe", "Billing"],
  },
  {
    id: "screenshot-to-code",
    moduleId: "2C",
    name: "Screenshot-to-Code",
    phase: "build",
    icon: Eye,
    description:
      "Upload a screenshot or mockup and get pixel-perfect working code. Color extraction, typography matching, and responsive adaptation included.",
    previewSnippet:
      "You are a senior computer vision engineer from Karpathy's Tesla Autopilot team who can look at any screenshot…",
    fullPreview:
      "…Layout replication • Component identification • Color extraction • Typography matching • Interactive elements • Responsive adaptation • Hover states • Clean code",
    tags: ["Screenshot", "Clone", "Pixel-perfect"],
  },
  {
    id: "feature-builder",
    moduleId: "3A",
    name: "Feature Builder",
    phase: "improve",
    icon: Wrench,
    description:
      "Add new features to your existing app using plain English. Impact assessment, edge cases, integration points, and rollback plan included.",
    previewSnippet:
      "You are a Stanford CS PhD from Karpathy's research group who specializes in translating non-technical feature requests…",
    fullPreview:
      "…Feature understanding • Impact assessment • UI changes • Data changes • Business logic • Edge cases • Integration points • Testing plan • Rollback plan",
    tags: ["Feature", "Enhancement", "Iteration"],
  },
  {
    id: "bug-doctor",
    moduleId: "3B",
    name: "Bug Doctor",
    phase: "improve",
    icon: Bug,
    description:
      "Describe the symptom in plain English, get the cure. Root cause analysis, side-effect checks, and prevention measures.",
    previewSnippet:
      "You are a founding engineer at OpenAI who can diagnose and fix any software bug from a plain-English description…",
    fullPreview:
      "…Symptom translation • Root cause analysis • Reproduction steps • The fix • Side effect check • Prevention measure • Testing verification • Related bugs",
    tags: ["Debug", "Fix", "Diagnose"],
  },
  {
    id: "iteration-engine",
    moduleId: "3C",
    name: "Iteration Engine",
    phase: "improve",
    icon: RefreshCcw,
    description:
      "AI-driven improvement cycle: performance audit, code cleanup, security hardening, SEO, accessibility, and a reusable weekly iteration template.",
    previewSnippet:
      "You are a senior AI systems architect who has implemented Karpathy's most radical prediction: AI systems that improve themselves…",
    fullPreview:
      "…Current state audit • Priority ranking • Performance optimization • Code cleanup • Security hardening • Error handling • SEO • Accessibility • Mobile performance",
    tags: ["Optimize", "Refactor", "Security"],
  },
];

const phaseLabel = (phase: string) => {
  switch (phase) {
    case "plan":
      return "Phase 1 · Plan";
    case "build":
      return "Phase 2 · Build";
    case "improve":
      return "Phase 3 · Improve";
    default:
      return phase;
  }
};

const phaseColor = (phase: string) => {
  switch (phase) {
    case "plan":
      return "bg-primary/20 text-primary border-primary/30";
    case "build":
      return "bg-accent/20 text-accent border-accent/30";
    case "improve":
      return "bg-[hsl(var(--gold))]/20 text-[hsl(var(--gold))] border-[hsl(var(--gold))]/30";
    default:
      return "";
  }
};

const PromptLibrary = () => {
  const { session } = useAuth();
  const [search, setSearch] = useState("");
  const [activePhase, setActivePhase] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = CATEGORIES.filter((c) => {
    const matchesSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesPhase = !activePhase || c.phase === activePhase;
    return matchesSearch && matchesPhase;
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="pt-24 pb-20">
        {/* Hero */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-16 text-center mb-16">
          <Badge
            variant="outline"
            className="mb-4 border-primary/40 text-primary font-mono text-xs"
          >
            9 PROMPT TEMPLATES
          </Badge>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            Prompt <span className="text-primary">Library</span>
          </h1>
          <p className="font-body text-muted-foreground text-lg max-w-2xl mx-auto">
            Browse our curated collection of AI-engineering prompts. Each template is
            battle-tested for vibe coding — from MVP scoping to production iteration.
          </p>
        </section>

        {/* Search + Filters */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-16 mb-10">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search prompts..."
                className="pl-10 bg-card border-border font-body"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { key: null, label: "All" },
                { key: "plan", label: "Plan" },
                { key: "build", label: "Build" },
                { key: "improve", label: "Improve" },
              ].map((f) => (
                <Button
                  key={f.label}
                  variant={activePhase === f.key ? "default" : "outline"}
                  size="sm"
                  className="font-body text-xs rounded-none"
                  onClick={() => setActivePhase(f.key)}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((cat) => {
              const isExpanded = expandedId === cat.id;
              return (
                <div
                  key={cat.id}
                  className="group bg-card border border-border rounded-lg p-6 flex flex-col transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center">
                        <cat.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-display text-base font-semibold">
                          {cat.name}
                        </h3>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {cat.moduleId}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-mono ${phaseColor(cat.phase)}`}
                    >
                      {phaseLabel(cat.phase)}
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="font-body text-sm text-muted-foreground mb-4 flex-1">
                    {cat.description}
                  </p>

                  {/* Preview snippet */}
                  <div className="relative mb-4">
                    <div className="bg-secondary/50 border border-border rounded p-3 font-mono text-xs text-muted-foreground leading-relaxed">
                      <span className="text-foreground/70 italic">
                        "{cat.previewSnippet}"
                      </span>
                      {isExpanded && (
                        <p className="mt-2 text-foreground/50">
                          {cat.fullPreview}
                        </p>
                      )}
                    </div>
                    {/* Blur overlay for non-expanded */}
                    {!isExpanded && (
                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent rounded-b" />
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {cat.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-secondary text-muted-foreground font-mono text-[10px] rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 font-body text-xs rounded-none"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : cat.id)
                      }
                    >
                      {isExpanded ? "Collapse" : "Preview"}
                    </Button>

                    {session ? (
                      <Button
                        size="sm"
                        className="flex-1 font-body text-xs rounded-none bg-primary hover:bg-primary/90"
                        asChild
                      >
                        <Link to="/project/new">
                          Use Template <ArrowRight className="w-3 h-3 ml-1" />
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="flex-1 font-body text-xs rounded-none bg-primary hover:bg-primary/90"
                        asChild
                      >
                        <Link to="/signup">
                          <Lock className="w-3 h-3 mr-1" /> Sign up to use
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-muted-foreground font-body">
              No prompts match your search. Try a different keyword.
            </div>
          )}
        </section>

        {/* CTA */}
        {!session && (
          <section className="container mx-auto px-4 sm:px-6 lg:px-16 mt-20 text-center">
            <div className="bg-card border border-border rounded-lg p-10 max-w-2xl mx-auto">
              <Lock className="w-8 h-8 text-primary mx-auto mb-4" />
              <h2 className="font-display text-2xl font-bold mb-2">
                Unlock Full Prompt Generation
              </h2>
              <p className="font-body text-muted-foreground text-sm mb-6">
                Sign up free and get 3 prompt generations per month. Upgrade for
                unlimited access to all 9 templates with Design Passport injection.
              </p>
              <Button
                size="lg"
                className="font-body rounded-none bg-primary hover:bg-primary/90"
                asChild
              >
                <Link to="/signup">
                  Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PromptLibrary;

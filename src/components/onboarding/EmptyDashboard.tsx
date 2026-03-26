import { motion } from "framer-motion";
import { ArrowRight, Globe, Palette, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Globe,
    title: "Choose your platform",
    desc: "Web, iOS, Android, or cross-platform",
  },
  {
    icon: Palette,
    title: "Define your Design DNA",
    desc: "Paste a URL or pick a mood preset",
  },
  {
    icon: Sparkles,
    title: "Generate smart prompts",
    desc: "Guided modules produce tailored prompts",
  },
  {
    icon: Zap,
    title: "Ship faster",
    desc: "Copy prompts into your AI tool of choice",
  },
];

interface EmptyDashboardProps {
  onCreateProject: () => void;
}

const EmptyDashboard = ({ onCreateProject }: EmptyDashboardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-center py-12"
    >
      <div className="w-16 h-16 rounded-none bg-primary/10 flex items-center justify-center mx-auto mb-6">
        <Sparkles className="w-8 h-8 text-primary" />
      </div>
      <h3 className="font-display text-2xl font-bold mb-2">
        Your command center is empty
      </h3>
      <p className="text-muted-foreground font-body text-sm mb-10 max-w-md mx-auto">
        Create your first project and start generating production-ready prompts in under 2 minutes.
      </p>

      {/* How it works */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-2xl mx-auto">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            className="glass-card p-4 text-left"
          >
            <f.icon className="w-5 h-5 text-primary mb-3" />
            <p className="font-body text-xs font-medium mb-1">{f.title}</p>
            <p className="font-body text-[10px] text-muted-foreground">{f.desc}</p>
          </motion.div>
        ))}
      </div>

      <Button
        onClick={onCreateProject}
        size="lg"
        className="gap-2 font-body text-sm rounded-none bg-primary hover:bg-primary/90 px-8"
      >
        Create your first project
        <ArrowRight className="w-4 h-4" />
      </Button>
    </motion.div>
  );
};

export default EmptyDashboard;

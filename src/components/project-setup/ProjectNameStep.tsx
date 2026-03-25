import { motion } from "framer-motion";
import { ArrowLeft, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProjectNameStepProps {
  name: string;
  onChange: (name: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  saving: boolean;
}

const ProjectNameStep = ({ name, onChange, onSubmit, onBack, saving }: ProjectNameStepProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-md mx-auto"
    >
      <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-3">
        Name your project
      </h2>
      <p className="text-muted-foreground font-body text-center mb-10">
        You can always change this later.
      </p>

      <div className="mb-8">
        <Label htmlFor="projectName" className="font-body text-sm text-muted-foreground mb-2 block">
          Project name
        </Label>
        <Input
          id="projectName"
          type="text"
          value={name}
          onChange={(e) => onChange(e.target.value)}
          placeholder="My Awesome App"
          autoFocus
          className="rounded-none bg-muted/50 border-border text-lg py-6 font-body"
          onKeyDown={(e) => {
            if (e.key === "Enter" && name.trim()) onSubmit();
          }}
        />
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2 font-body text-sm rounded-none">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!name.trim() || saving}
          className="gap-2 font-body text-sm rounded-none bg-primary hover:bg-primary/90"
        >
          {saving ? "Creating..." : "Create Project"}
          <Rocket className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};

export default ProjectNameStep;

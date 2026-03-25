import { motion } from "framer-motion";
import { Globe, Smartphone, Monitor } from "lucide-react";

const platforms = [
  {
    id: "web",
    icon: Globe,
    name: "Web App",
    description: "Next.js, React, Vercel",
  },
  {
    id: "ios",
    icon: Smartphone,
    name: "iOS App",
    description: "Swift / React Native",
  },
  {
    id: "android",
    icon: Smartphone,
    name: "Android App",
    description: "Kotlin / React Native",
  },
  {
    id: "cross_platform",
    icon: Monitor,
    name: "Cross-Platform Mobile",
    description: "Expo, React Native, Flutter",
  },
  {
    id: "web_and_mobile",
    icon: Globe,
    name: "Web + Mobile",
    description: "Full web + companion mobile",
  },
];

interface PlatformStepProps {
  selected: string;
  onSelect: (id: string) => void;
}

const PlatformStep = ({ selected, onSelect }: PlatformStepProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-3">
        What are you building?
      </h2>
      <p className="text-muted-foreground font-body text-center mb-12">
        This determines your tech stack, design tokens, and deployment targets.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => onSelect(platform.id)}
            className={`glass-card p-6 text-left transition-all cursor-pointer group hover:border-primary/40 ${
              selected === platform.id ? "border-primary glow-primary" : ""
            }`}
          >
            <div className="w-10 h-10 rounded-none bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <platform.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-1">
              {platform.name}
            </h3>
            <p className="text-muted-foreground font-body text-xs">
              {platform.description}
            </p>
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default PlatformStep;

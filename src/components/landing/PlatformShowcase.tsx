import { motion } from "framer-motion";

const webPrompt = `ROLE: You are a senior full-stack developer.
PLATFORM: Web Application (Next.js + Supabase)
DESIGN: Dark Mode Native mood
  → Font: Inter + JetBrains Mono
  → Radius: 8px, Glass-morphism cards
  → Accent: #6C5CE7
TASK: Build a project dashboard with...`;

const mobilePrompt = `ROLE: You are a senior mobile developer.
PLATFORM: iOS + Android (Expo / React Native)
DESIGN: Dark Mode Native mood
  → System fonts (SF Pro / Roboto)
  → Corner radius: 12px, Native sheets
  → Navigation: Bottom tab bar (4 tabs)
TASK: Build a project dashboard with...`;

const PlatformShowcase = () => {
  return (
    <section className="py-16 sm:py-32 px-4 sm:px-6 lg:px-16 bg-card/30">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-body uppercase tracking-[0.3em] text-accent mb-4">
            Platform Intelligence
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold max-w-2xl mx-auto">
            Same idea, <span className="italic text-primary">different platform.</span>
          </h2>
          <p className="text-muted-foreground font-body mt-4 max-w-lg mx-auto">
            One project generates platform-specific prompts with the right tech stack, design tokens, and deployment targets.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {[
            { label: "Web Prompt", code: webPrompt, accent: "primary" },
            { label: "Mobile Prompt", code: mobilePrompt, accent: "accent" },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="glass-card overflow-hidden"
            >
              <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
                <div className={`w-2 h-2 rounded-full ${item.accent === "primary" ? "bg-primary" : "bg-accent"}`} />
                <span className="font-mono text-xs text-muted-foreground">{item.label}</span>
              </div>
              <pre className="p-5 font-mono text-xs leading-relaxed text-foreground/80 overflow-x-auto">
                {item.code}
              </pre>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlatformShowcase;

import { motion } from "framer-motion";
import { Compass, FormInput, Palette, Layers } from "lucide-react";

const features = [
  {
    icon: Compass,
    title: "The Router",
    description:
      "Asks where you are and what you're building, then directs you to the exact right phase and prompt.",
  },
  {
    icon: FormInput,
    title: "Smart Forms",
    description:
      "Breaks mega-prompts into 4–8 focused questions that adapt based on your platform and context.",
  },
  {
    icon: Palette,
    title: "Design DNA",
    description:
      "Captures your aesthetic preferences once and injects distinct visual identity into every prompt.",
  },
  {
    icon: Layers,
    title: "Platform Intelligence",
    description:
      "Adapts every prompt, tech stack, and design pattern to web, iOS, Android, or all three.",
  },
];

const Features = () => {
  return (
    <section className="py-16 sm:py-32 px-4 sm:px-6 lg:px-16">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <p className="text-sm font-body uppercase tracking-[0.3em] text-accent mb-4">
            How It Works
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold max-w-xl">
            Four layers of
            <br />
            <span className="italic text-primary">prompt intelligence.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="glass-card p-8 group hover:border-primary/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-none bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-3">
                {feature.title}
              </h3>
              <p className="font-body text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "I went from spending 30 minutes crafting prompts to 3 minutes. The Design DNA alone is worth it.",
    name: "Sarah K.",
    role: "Indie Maker",
    avatar: "SK",
  },
  {
    quote: "The mobile prompt adaptation is insane. Same project, totally different outputs for iOS vs web.",
    name: "Marcus T.",
    role: "Full-Stack Developer",
    avatar: "MT",
  },
  {
    quote: "Context chaining changed everything. My AI builds on previous prompts instead of starting from scratch.",
    name: "Priya R.",
    role: "Product Designer",
    avatar: "PR",
  },
];

const SocialProof = () => {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-16 bg-card/30">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-sm font-body uppercase tracking-[0.3em] text-accent mb-4">
            Early Builders
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold">
            Loved by <span className="italic text-primary">vibe coders.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />
                ))}
              </div>
              <p className="font-body text-sm text-foreground/80 leading-relaxed mb-6 italic">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-xs font-mono font-bold text-primary">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-body text-sm font-medium">{t.name}</p>
                  <p className="font-body text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;

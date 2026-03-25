import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Start building with web prompts",
    features: [
      "3 projects",
      "All 9 prompt modules",
      "Basic Design DNA (3 moods)",
      "Web platform only",
      "Last 5 prompt history",
    ],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "Full power — web + mobile + Design DNA",
    features: [
      "Unlimited projects",
      "All 8 moods + custom",
      "Web + Mobile platforms",
      "Mobile design tokens",
      "Context chaining",
      "Unlimited prompt history",
      "JSON export",
      "Platform-specific AI recs",
    ],
    cta: "Start Pro Trial",
    highlight: true,
  },
  {
    name: "Team",
    price: "$49",
    period: "/month",
    description: "Shared projects & prompt library",
    features: [
      "Everything in Pro",
      "Shared projects",
      "Team prompt library",
      "Design system export",
      "PDF export",
      "Priority chat support",
    ],
    cta: "Contact Us",
    highlight: false,
  },
];

const Pricing = () => {
  return (
    <section className="py-32 px-6 lg:px-16">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-sm font-body uppercase tracking-[0.3em] text-accent mb-4">
            Pricing
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            Simple, transparent <span className="italic text-primary">pricing.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative p-8 ${
                tier.highlight
                  ? "glass-card glow-primary border-primary/40"
                  : "glass-card"
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-8 bg-primary px-4 py-1 text-xs font-body font-semibold text-primary-foreground uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              <h3 className="font-display text-2xl font-bold mb-1">{tier.name}</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="font-display text-4xl font-bold">{tier.price}</span>
                <span className="text-muted-foreground font-body text-sm">
                  {tier.period}
                </span>
              </div>
              <p className="text-muted-foreground font-body text-sm mb-8">
                {tier.description}
              </p>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm font-body"
                  >
                    <Check className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                    <span className="text-secondary-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full rounded-none py-5 font-body font-semibold ${
                  tier.highlight
                    ? "bg-primary hover:bg-primary/90"
                    : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                }`}
              >
                {tier.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;

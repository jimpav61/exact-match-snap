import { motion } from "framer-motion";
import { ArrowRight, Smartphone, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-16 py-20 sm:py-32">
        <div className="max-w-4xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-sm font-body uppercase tracking-[0.3em] text-accent mb-8"
          >
            The Prompt Engineering Command Center
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight mb-6 sm:mb-8"
          >
            Stop Vibe
            <br />
            Coding{" "}
            <span className="text-gradient-primary italic">Blind.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="font-body text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-12"
          >
            VibeCoder Studio transforms chaotic copy-paste-into-AI workflows into a
            guided, intelligent prompt engineering system — for web apps and native
            mobile apps.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button size="lg" className="group gap-3 rounded-none px-8 py-6 text-base font-body font-semibold bg-primary hover:bg-primary/90">
              <Globe className="w-5 h-5" />
              Build a Web App
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="group gap-3 rounded-none px-8 py-6 text-base font-body font-semibold border-foreground/20 hover:bg-foreground/10 hover:text-foreground"
            >
              <Smartphone className="w-5 h-5" />
              Build a Mobile App
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;

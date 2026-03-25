import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import BeforeAfter from "@/components/landing/BeforeAfter";
import PlatformShowcase from "@/components/landing/PlatformShowcase";
import SocialProof from "@/components/landing/SocialProof";
import Pricing from "@/components/landing/Pricing";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <div id="features">
        <Features />
      </div>
      <BeforeAfter />
      <PlatformShowcase />
      <SocialProof />
      <div id="pricing">
        <Pricing />
      </div>
      <Footer />
    </div>
  );
};

export default Index;

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleAnchorClick = (hash: string) => {
    setMobileOpen(false);
    if (location.pathname === "/") {
      const el = document.querySelector(hash);
      el?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/" + hash);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-16 h-16">
        <Link to="/" className="font-display text-xl font-bold">
          Vibe<span className="text-primary">Coder</span> Studio
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8 font-body text-sm">
          <button onClick={() => handleAnchorClick("#features")} className="text-muted-foreground hover:text-foreground transition-colors">Features</button>
          <button onClick={() => handleAnchorClick("#pricing")} className="text-muted-foreground hover:text-foreground transition-colors">Pricing</button>
          <Link to="/library" className="text-muted-foreground hover:text-foreground transition-colors">Prompt Library</Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" className="font-body text-sm rounded-none" asChild>
            <Link to="/login">Log in</Link>
          </Button>
          <Button size="sm" className="font-body text-sm rounded-none bg-primary hover:bg-primary/90" asChild>
            <Link to="/signup">Sign up</Link>
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl px-4 py-4 space-y-3">
          <button onClick={() => handleAnchorClick("#features")} className="block font-body text-sm text-muted-foreground hover:text-foreground py-2 w-full text-left">Features</button>
          <button onClick={() => handleAnchorClick("#pricing")} className="block font-body text-sm text-muted-foreground hover:text-foreground py-2 w-full text-left">Pricing</button>
          <Link to="/library" onClick={() => setMobileOpen(false)} className="block font-body text-sm text-muted-foreground hover:text-foreground py-2">Prompt Library</Link>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" size="sm" className="font-body text-sm rounded-none flex-1" asChild>
              <Link to="/login" onClick={() => setMobileOpen(false)}>Log in</Link>
            </Button>
            <Button size="sm" className="font-body text-sm rounded-none bg-primary hover:bg-primary/90 flex-1" asChild>
              <Link to="/signup" onClick={() => setMobileOpen(false)}>Sign up</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

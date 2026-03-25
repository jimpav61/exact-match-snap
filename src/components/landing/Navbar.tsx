import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between px-6 lg:px-16 h-16">
        <Link to="/" className="font-display text-xl font-bold">
          Vibe<span className="text-primary">Coder</span> Studio
        </Link>

        <div className="hidden md:flex items-center gap-8 font-body text-sm">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          <span className="text-muted-foreground cursor-default opacity-50" title="Coming soon">Prompt Library</span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="font-body text-sm rounded-none" asChild>
            <Link to="/login">Log in</Link>
          </Button>
          <Button size="sm" className="font-body text-sm rounded-none bg-primary hover:bg-primary/90" asChild>
            <Link to="/signup">Sign up</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

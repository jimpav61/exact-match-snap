const Footer = () => {
  return (
    <footer className="border-t border-border py-16 px-6 lg:px-16">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
        <div>
          <h3 className="font-display text-2xl font-bold mb-2">
            Vibe<span className="text-primary">Coder</span> Studio
          </h3>
          <p className="text-muted-foreground font-body text-sm max-w-xs">
            The operating system for vibe coding — the layer between your idea
            and whichever AI builds it.
          </p>
        </div>

        <div className="flex gap-16">
          <div>
            <h4 className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Product
            </h4>
            <ul className="space-y-2 font-body text-sm">
              <li><a href="#" className="text-foreground/70 hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#" className="text-foreground/70 hover:text-foreground transition-colors">Pricing</a></li>
              <li><a href="#" className="text-foreground/70 hover:text-foreground transition-colors">Prompt Library</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Company
            </h4>
            <ul className="space-y-2 font-body text-sm">
              <li><a href="#" className="text-foreground/70 hover:text-foreground transition-colors">About</a></li>
              <li><a href="#" className="text-foreground/70 hover:text-foreground transition-colors">Blog</a></li>
              <li><a href="#" className="text-foreground/70 hover:text-foreground transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="container mx-auto mt-12 pt-8 border-t border-border">
        <p className="text-muted-foreground font-body text-xs">
          © 2026 VibeCoder Studio. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

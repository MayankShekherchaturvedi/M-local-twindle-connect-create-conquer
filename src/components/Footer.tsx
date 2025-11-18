import { Link } from "react-router-dom";
import { Github, Linkedin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-footer text-primary-foreground mt-20">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left - Links */}
          <div className="flex items-center gap-8 text-sm">
            <Link to="/" className="hover:text-accent transition-colors">
              Home
            </Link>
            <Link to="/connect" className="hover:text-accent transition-colors">
              Connect
            </Link>
            <Link to="/community" className="hover:text-accent transition-colors">
              Community
            </Link>
            <Link to="/feed" className="hover:text-accent transition-colors">
              AI Feed
            </Link>
          </div>

          {/* Center - Copyright */}
          <div className="text-sm text-muted-foreground">
            Twindle © 2025
          </div>

          {/* Right - Socials */}
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-accent transition-colors">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href="#" className="hover:text-accent transition-colors">
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Bottom Links */}
        <div className="mt-6 pt-6 border-t border-primary-foreground/20 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <Link to="/privacy" className="hover:text-accent transition-colors">
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-accent transition-colors">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
};

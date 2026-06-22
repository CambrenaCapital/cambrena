import logo from "@/assets/cambrena-logo.svg";
import { Linkedin } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, type ReactNode } from "react";

const WritingLayout = ({ children }: { children: ReactNode }) => {
  // The writing section scrolls, but the site applies a global
  // `body { overflow: hidden }`. Lift that restriction while these pages mount.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <div className="min-h-screen w-full relative bg-background">
      {/* Logo */}
      <Link
        to="/"
        className="absolute top-6 left-4 sm:top-8 sm:left-8 md:top-12 md:left-16 hover:opacity-80 transition-opacity z-20"
      >
        <img
          src={logo}
          alt="Cambrena Capital Logo"
          className="h-16 sm:h-20 md:h-24 object-contain"
        />
      </Link>

      {/* Top Right Nav */}
      <div className="absolute top-6 right-4 sm:top-8 sm:right-8 md:top-12 md:right-16 flex items-center gap-4 sm:gap-6 text-xs font-bold tracking-wider z-20">
        <Link to="/vc-exits-explorer" className="hover:opacity-60 transition-opacity whitespace-nowrap">
          Exit Explorer
        </Link>
        <Link to="/writing" className="hover:opacity-60 transition-opacity whitespace-nowrap">
          Musings
        </Link>
        <Link to="/about-us" className="hover:opacity-60 transition-opacity whitespace-nowrap">
          About Us
        </Link>
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-32 sm:pt-36 md:pt-44 pb-16">
        {children}
      </main>

      {/* Footer Links */}
      <footer className="w-full px-4 pb-8 pt-4">
        <nav aria-label="Footer navigation">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-8 text-xs tracking-wider">
            <Link to="/imprint" className="hover:opacity-60 transition-opacity whitespace-nowrap">
              Imprint
            </Link>
            <span className="hidden sm:inline">|</span>
            <Link to="/privacy-policy" className="hover:opacity-60 transition-opacity whitespace-nowrap">
              Privacy Policy
            </Link>
            <span className="hidden sm:inline">|</span>
            <a href="mailto:contact@cambrena.net" className="hover:opacity-60 transition-opacity">
              contact@cambrena.net
            </a>
            <span className="hidden sm:inline">|</span>
            <a
              href="https://www.linkedin.com/company/cambrena-capital/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-60 transition-opacity"
              aria-label="LinkedIn"
            >
              <Linkedin size={16} />
            </a>
          </div>
        </nav>
      </footer>
    </div>
  );
};

export default WritingLayout;

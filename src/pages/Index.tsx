import { useState, useEffect } from "react";
import TriangleAccent from "@/components/TriangleAccent";
import logo from "@/assets/cambrena-logo.gif";
import { Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden relative flex items-center justify-center bg-background">
      {/* Logo */}
      <div
        className={`absolute transition-all duration-[1500ms] ease-in-out ${
          animationComplete
            ? 'top-6 left-4 sm:top-8 sm:left-8 md:top-12 md:left-16 scale-100'
            : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-200'
        }`}
      >
        <img
          src={logo}
          alt="Cambrena Capital - Venture Capital Firm"
          className="h-16 sm:h-20 md:h-24 object-contain"
        />
      </div>

      {/* Main Content */}
      <main
        className={`relative z-10 max-w-4xl mx-auto px-4 sm:px-6 md:px-8 text-center transition-opacity duration-700 ${
          animationComplete ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* SEO-optimized H1 for search engines */}
        <h1 className="sr-only">
          Cambrena Capital - Venture Capital for Early-Stage Startups in Switzerland
        </h1>

        {/* Visual H1 for brand consistency */}
        <h1 aria-hidden="true" className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 tracking-tight leading-none">
          BUILT FOR WHAT'S NEXT
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl mb-8 sm:mb-12 max-w-2xl mx-auto tracking-wide">
          We invest at the earliest stages of a company's growth, using capital that isn't bound by traditional fund lifecycles
        </p>
      </main>

      {/* Footer Links */}
      <footer
        className={`absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 w-full px-4 transition-opacity duration-700 ${
          animationComplete ? 'opacity-100' : 'opacity-0'
        }`}
      >
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
          <a
            href="mailto:contact@cambrena.net"
            className="hover:opacity-60 transition-opacity"
          >
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

export default Index;

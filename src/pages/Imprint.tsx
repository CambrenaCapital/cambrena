import logo from "@/assets/cambrena-logo.svg";
import { Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

const Imprint = () => {
  return (
    <div className="h-screen w-screen overflow-hidden relative flex items-center justify-center bg-background">
      {/* Logo */}
      <Link to="/" className="absolute top-6 left-4 sm:top-8 sm:left-8 md:top-12 md:left-16 hover:opacity-80 transition-opacity">
        <img
          src={logo}
          alt="Cambrena Logo"
          className="h-16 sm:h-20 md:h-24 object-contain"
        />
      </Link>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 md:px-8 text-center">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Imprint</h1>
        <div className="space-y-2 text-sm">
          <p>Cambrena AG</p>
          <p>Haldenstrasse 1</p>
          <p>6340 Baar</p>
          <p>Switzerland</p>
          <p className="mt-4">UID: CHE-307.299.793</p>
          <p className="mt-4">
            <a href="mailto:contact@cambrena.net" className="hover:opacity-60 transition-opacity">
              contact@cambrena.net
            </a>
          </p>
        </div>
      </main>

      {/* Footer Links */}
      <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 w-full px-4">
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
      </div>
    </div>
  );
};

export default Imprint;

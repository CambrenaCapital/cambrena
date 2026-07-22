import { Link } from "react-router-dom";
import { Linkedin } from "lucide-react";

interface Props {
  /** Positioning/spacing classes for the <footer> element. */
  className?: string;
}

/** Shared footer nav: Imprint · Privacy Policy · email · LinkedIn. */
const SiteFooter = ({ className = "w-full px-4 pb-8 pt-4" }: Props) => (
  <footer className={className}>
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
);

export default SiteFooter;

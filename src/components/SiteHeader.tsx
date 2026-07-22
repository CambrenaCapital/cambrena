import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "@/assets/cambrena-logo.svg";

const NAV_LINKS = [
  { to: "/vc-exits-explorer", label: "Exit Explorer" },
  { to: "/musings", label: "Musings" },
  { to: "/about-us", label: "About Us" },
];

interface Props {
  /** Render the top-left logo. Set false on pages that draw their own (e.g. the animated landing logo). */
  showLogo?: boolean;
  /** Override the logo image sizing classes. */
  logoClassName?: string;
}

/**
 * Shared site header: absolute-overlay logo (top-left) + nav (top-right).
 * Below `md` the nav collapses into a hamburger menu.
 */
const SiteHeader = ({ showLogo = true, logoClassName = "h-16 sm:h-20 md:h-24" }: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {showLogo && (
        <Link
          to="/"
          className="absolute top-6 left-4 sm:top-8 sm:left-8 md:top-12 md:left-16 hover:opacity-80 transition-opacity z-30"
        >
          <img src={logo} alt="Cambrena Capital Logo" className={`${logoClassName} object-contain`} />
        </Link>
      )}

      <div className="absolute top-6 right-4 sm:top-8 sm:right-8 md:top-12 md:right-16 z-30">
        {/* Desktop inline nav */}
        <nav className="hidden md:flex items-center gap-4 sm:gap-6 text-xs font-bold tracking-wider">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="hover:opacity-60 transition-opacity whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
          className="md:hidden flex items-center justify-center h-11 w-11 -mr-2 rounded-md hover:bg-foreground/5 transition-colors"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu overlay + panel */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-20" onClick={() => setMenuOpen(false)}>
          <nav
            className="absolute top-16 right-4 sm:right-8 min-w-[180px] rounded-lg border border-border/40 bg-background shadow-lg py-1 text-sm font-bold tracking-wider"
            onClick={(e) => e.stopPropagation()}
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 hover:bg-foreground/5 transition-colors whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
};

export default SiteHeader;

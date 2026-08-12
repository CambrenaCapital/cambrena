import logo from "@/assets/cambrena-logo.svg";
import mountain from "@/assets/cambrena-mountain.webp";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

/**
 * Landing page. Everything is displayed on load; only the mountain animates in
 * (a bottom-up point-cloud assemble driven purely by CSS — see .hero-mountain in
 * index.css, with a reduced-motion fallback). No JS state or timers.
 */
const Index = () => {
  return (
    <div className="min-h-[100svh] w-full overflow-hidden relative flex items-center justify-center bg-background">
      {/* Cambrena mountain — dithered point-cloud rendering, bottom-anchored backdrop */}
      <img
        src={mountain}
        alt=""
        aria-hidden="true"
        draggable={false}
        loading="eager"
        decoding="async"
        className="hero-mountain pointer-events-none select-none absolute bottom-0 left-1/2 -translate-x-1/2 w-full min-w-[760px] max-w-none h-auto z-0"
      />

      {/* Logo — static, top-left */}
      <div className="absolute z-30 top-6 left-4 sm:top-8 sm:left-8 md:top-12 md:left-16">
        <img
          src={logo}
          alt="Cambrena Capital"
          className="h-16 sm:h-20 md:h-24 object-contain"
        />
      </div>

      {/* Nav / hamburger */}
      <SiteHeader showLogo={false} />

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 md:px-8 text-center">
        {/* SEO-optimized H1 for search engines */}
        <h1 className="sr-only">
          Cambrena Capital - Venture Capital and Growth Equity Investments
        </h1>

        {/* Visual H1 for brand consistency */}
        <h1 aria-hidden="true" className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 tracking-tight leading-none">
          BUILDING FOR WHAT'S NEXT
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base md:text-lg mb-8 sm:mb-12 max-w-2xl mx-auto tracking-wide">
          We back exceptional founders across venture and growth equity stages, using capital that isn't bound by traditional fund constraints
        </p>
      </main>

      <SiteFooter className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 w-full px-4" />
    </div>
  );
};

export default Index;

import { useState, useEffect } from "react";
import logo from "@/assets/cambrena-logo.gif";
import mountain from "@/assets/cambrena-mountain.webp";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const Index = () => {
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

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
        className={`pointer-events-none select-none absolute bottom-0 left-1/2 -translate-x-1/2 w-full min-w-[760px] max-w-none h-auto z-0 transition-opacity duration-700 [mask-image:linear-gradient(to_bottom,transparent,black_45%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent,black_45%)] ${
          animationComplete ? 'opacity-80' : 'opacity-0'
        }`}
      />

      {/* Animated logo (center → corner) */}
      <div
        className={`absolute z-30 transition-all duration-[1500ms] ease-in-out ${
          animationComplete
            ? 'top-6 left-4 sm:top-8 sm:left-8 md:top-12 md:left-16 scale-100'
            : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-200'
        }`}
      >
        <img
          src={logo}
          alt="Cambrena Capital"
          className="h-16 sm:h-20 md:h-24 object-contain"
        />
      </div>

      {/* Nav / hamburger — fades in after the logo animation */}
      <div
        className={`transition-opacity duration-700 ${
          animationComplete ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <SiteHeader showLogo={false} />
      </div>

      {/* Main Content */}
      <main
        className={`relative z-10 max-w-4xl mx-auto px-4 sm:px-6 md:px-8 text-center transition-opacity duration-700 ${
          animationComplete ? 'opacity-100' : 'opacity-0'
        }`}
      >
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

      <SiteFooter
        className={`absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 w-full px-4 transition-opacity duration-700 ${
          animationComplete ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};

export default Index;

import { type ReactNode } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const WritingLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-[100svh] w-full relative flex flex-col bg-background">
      <SiteHeader />

      {/* Main Content */}
      <main className="flex-1 relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-32 sm:pt-36 md:pt-44 pb-16">
        {children}
      </main>

      <SiteFooter />
    </div>
  );
};

export default WritingLayout;

import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const Imprint = () => {
  return (
    <div className="min-h-[100svh] w-full relative flex flex-col bg-background">
      <SiteHeader />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 md:px-8 pt-28 sm:pt-32 md:pt-40 pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Imprint</h1>
          <div className="space-y-2 text-sm">
            <p>Cambrena Capital AG</p>
            <p>Haldenstrasse 1</p>
            <p>6340 Baar</p>
            <p>Switzerland</p>
            <p className="mt-4">UID: CHE-174.199.372</p>
            <p className="mt-4">
              <a href="mailto:contact@cambrena.net" className="hover:opacity-60 transition-opacity">
                contact@cambrena.net
              </a>
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Imprint;

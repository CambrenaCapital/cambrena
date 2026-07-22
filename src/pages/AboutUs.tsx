import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const AboutUs = () => {
  return (
    <div className="min-h-[100svh] w-full relative flex flex-col bg-background">
      <SiteHeader />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 md:px-8 pt-28 sm:pt-32 md:pt-40 pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">About Us</h1>
          <div className="space-y-2 text-sm">
            <p>At Cambrena, we back exceptional founders and businesses across venture and growth equity stages, using capital that isn't bound by traditional fund constraints. Our structure allows for speed and simplicity in decision-making, fewer stakeholders, and the ability to deploy when others can't. We support our companies across stages and through market cycles, focused on long-term value creation rather than forced exits.
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default AboutUs;

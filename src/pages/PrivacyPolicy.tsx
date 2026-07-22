import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-[100svh] w-full relative flex flex-col bg-background">
      <SiteHeader />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 md:px-8 pt-28 sm:pt-32 md:pt-40 pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Privacy Policy</h1>
          <div className="space-y-2 text-sm">
            <p>This website is for information purposes only. You can visit our website without having to provide any personal details. Our website does not use any cookies. No data is collected or analyzed from visitors to the website.</p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default PrivacyPolicy;

import type { RouteRecord } from "vite-react-ssg";
import { ClientOnly } from "vite-react-ssg";
import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import Imprint from "./pages/Imprint";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AboutUs from "./pages/AboutUs";
import NotFound from "./pages/NotFound";
import VCExitsExplorer from "./pages/VCExitsExplorer";
import Writing from "./pages/Writing";
import WritingArticle from "./pages/WritingArticle";
import { posts } from "@/lib/posts";

/**
 * Root layout: shared providers + the routed <Outlet>. Toasters render only on
 * the client (they portal into document.body, which doesn't exist during SSG).
 */
const RootLayout = () => (
  <TooltipProvider>
    <Outlet />
    <ClientOnly>
      {() => (
        <>
          <Toaster />
          <Sonner />
        </>
      )}
    </ClientOnly>
  </TooltipProvider>
);

export const routes: RouteRecord[] = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Index /> },
      { path: "imprint", element: <Imprint /> },
      { path: "privacy-policy", element: <PrivacyPolicy /> },
      { path: "about-us", element: <AboutUs /> },
      {
        // Interactive tool: workers + runtime API. Client-only, so SSG renders
        // an empty shell rather than executing its render path on the server.
        path: "vc-exits-explorer",
        element: <ClientOnly>{() => <VCExitsExplorer />}</ClientOnly>,
      },
      { path: "musings", element: <Writing /> },
      {
        path: "musings/:slug",
        element: <WritingArticle />,
        getStaticPaths: () => posts.map((p) => `/musings/${p.slug}`),
      },
      // Catch-all: also drives the static 404 fallback.
      { path: "*", element: <NotFound /> },
    ],
  },
];

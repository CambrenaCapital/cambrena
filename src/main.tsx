import { ViteReactSSG } from "vite-react-ssg";
import { routes } from "./App";
import "./index.css";

// Static-site generation entry. vite-react-ssg renders each route to HTML at
// build time and hydrates on the client. Keeps the dynamic GitHub Pages base.
export const createRoot = ViteReactSSG({
  routes,
  basename: import.meta.env.BASE_URL,
});

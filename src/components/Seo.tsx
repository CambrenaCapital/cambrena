import { Head } from "vite-react-ssg";

interface SeoProps {
  title: string;
  description?: string;
  /** Absolute URL to a social image. */
  image?: string;
}

/**
 * Per-route document metadata. Rendered into the static HTML at build time
 * (so AI crawlers and social scrapers see it) and updated on client navigation.
 * Mirrors the tag set declared in index.html.
 */
const Seo = ({ title, description, image }: SeoProps) => (
  <Head>
    <title>{title}</title>
    <meta property="og:title" content={title} />
    <meta name="twitter:title" content={title} />
    {description && <meta name="description" content={description} />}
    {description && <meta property="og:description" content={description} />}
    {description && <meta name="twitter:description" content={description} />}
    {image && <meta property="og:image" content={image} />}
    {image && <meta name="twitter:image" content={image} />}
  </Head>
);

export default Seo;

import yaml from "js-yaml";

export interface Post {
  title: string;
  slug: string;
  date: string;
  author?: string;
  excerpt: string;
  coverImage?: string;
  tags: string[];
  body: string;
}

/**
 * Resolve an asset path referenced from post frontmatter or markdown body.
 * The content authors reference images as "./public/foo.png"; the images live
 * in /public and are served from the site root (respecting Vite's base path,
 * which differs between the custom domain and GitHub Pages deploys).
 */
export function resolveAsset(src: string): string {
  if (/^https?:\/\//.test(src)) return src;
  const clean = src.replace(/^\.\/public\//, "").replace(/^\/+/, "");
  return `${import.meta.env.BASE_URL}${clean}`;
}

/** Format an ISO date (YYYY-MM-DD) as e.g. "19 June 2026". */
export function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Native, file-based content: every markdown file in src/content/writing
// becomes a post. Publishing a new article is just adding one .md file.
const modules = import.meta.glob("../content/writing/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

function parsePost(raw: string): Post {
  const match = raw.match(FRONTMATTER);
  if (!match) {
    throw new Error("Markdown file is missing a frontmatter block");
  }
  const data = (yaml.load(match[1]) ?? {}) as Record<string, unknown>;
  return {
    title: String(data.title ?? ""),
    slug: String(data.slug ?? ""),
    date: String(data.date ?? ""),
    author: data.author ? String(data.author) : undefined,
    excerpt: String(data.excerpt ?? ""),
    coverImage: data.coverImage ? resolveAsset(String(data.coverImage)) : undefined,
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    body: match[2],
  };
}

export const posts: Post[] = Object.values(modules)
  .map(parsePost)
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug);
}

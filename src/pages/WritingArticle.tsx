import { Link, useParams } from "react-router-dom";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import WritingLayout from "@/components/WritingLayout";
import rehypeFigureCaptions from "@/lib/figureCaptions";
import { getPostBySlug, formatDate, resolveAsset } from "@/lib/posts";
import Seo from "@/components/Seo";

const components: Components = {
  h1: ({ node, ...props }) => (
    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight mt-2 mb-6" {...props} />
  ),
  h2: ({ node, ...props }) => (
    <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-10 mb-3" {...props} />
  ),
  h3: ({ node, ...props }) => (
    <h3 className="text-base sm:text-lg font-bold tracking-tight mt-6 mb-2" {...props} />
  ),
  p: ({ node, ...props }) => (
    <p className="text-sm sm:text-base leading-relaxed text-foreground/90 mb-4" {...props} />
  ),
  a: ({ node, href, ...props }) => {
    const external = /^https?:\/\//.test(href ?? "");
    return (
      <a
        href={href}
        className="underline underline-offset-2 hover:opacity-60 transition-opacity"
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...props}
      />
    );
  },
  ul: ({ node, ...props }) => (
    <ul className="list-disc pl-6 space-y-2 mb-4 text-sm sm:text-base leading-relaxed text-foreground/90" {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol className="list-decimal pl-6 space-y-2 mb-4 text-sm sm:text-base leading-relaxed text-foreground/90" {...props} />
  ),
  blockquote: ({ node, ...props }) => (
    <blockquote className="border-l-2 border-foreground/40 pl-4 italic text-foreground/80 my-6" {...props} />
  ),
  hr: ({ node, ...props }) => <hr className="my-8 border-border/40" {...props} />,
  code: ({ node, ...props }) => (
    <code className="font-mono text-[0.9em] bg-secondary/60 px-1 py-0.5" {...props} />
  ),
  img: ({ node, src, alt, ...props }) => (
    <img
      src={resolveAsset(typeof src === "string" ? src : "")}
      alt={alt ?? ""}
      loading="lazy"
      className="w-full h-auto"
      {...props}
    />
  ),
  figure: ({ node, ...props }) => <figure className="my-8" {...props} />,
  figcaption: ({ node, ...props }) => (
    <figcaption
      className="mt-2 text-xs sm:text-sm italic text-muted-foreground text-center [&_a]:underline"
      {...props}
    />
  ),
};

const WritingArticle = () => {
  const { slug } = useParams();
  const post = slug ? getPostBySlug(slug) : undefined;

  const origin = typeof window !== "undefined" ? window.location.origin : "https://cambrena.net";
  const image = post?.coverImage ? `${origin}${resolveAsset(post.coverImage)}` : undefined;

  if (!post) {
    return (
      <WritingLayout>
        <Seo title="Musings | Cambrena Capital" />
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold mb-4">Post not found</h1>
          <Link to="/musings" className="text-sm underline hover:opacity-60 transition-opacity">
            ← Musings
          </Link>
        </div>
      </WritingLayout>
    );
  }

  return (
    <WritingLayout>
      <Seo title={`${post.title} | Cambrena Capital`} description={post.excerpt} image={image} />
      <article className="max-w-2xl mx-auto">
        <Link
          to="/musings"
          className="inline-block text-xs font-bold tracking-wider hover:opacity-60 transition-opacity mb-6"
        >
          ← Musings
        </Link>
        <p className="text-xs text-muted-foreground tracking-wider mb-3">
          {formatDate(post.date)}
          {post.author ? ` · ${post.author}` : ""}
        </p>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeFigureCaptions]}
          components={components}
        >
          {post.body}
        </ReactMarkdown>
      </article>
    </WritingLayout>
  );
};

export default WritingArticle;

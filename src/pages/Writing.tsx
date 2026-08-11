import { Link } from "react-router-dom";
import WritingLayout from "@/components/WritingLayout";
import { posts, formatDate } from "@/lib/posts";
import Seo from "@/components/Seo";

const Writing = () => {
  return (
    <WritingLayout>
      <Seo
        title="Musings | Cambrena Capital"
        description="Essays and research from Cambrena Capital."
      />
      <h1 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">Musings</h1>

      <div className="space-y-6 sm:space-y-8">
        {posts.map((post) => (
          <Link
            key={post.slug}
            to={`/musings/${post.slug}`}
            className="block border border-border/30 bg-secondary/40 p-5 sm:p-6 transition-all duration-200 hover:border-foreground/30 hover:shadow-md hover:-translate-y-0.5"
          >
            <p className="text-xs text-muted-foreground tracking-wider mb-2">
              {formatDate(post.date)}
            </p>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight mb-2">{post.title}</h2>
            <p className="text-sm text-foreground/80 leading-relaxed">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </WritingLayout>
  );
};

export default Writing;

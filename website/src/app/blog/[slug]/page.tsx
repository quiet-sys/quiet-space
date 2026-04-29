import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getPost, getAllPosts } from "@/lib/mdx";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return (
      <div className="min-h-screen pt-24 px-4 flex flex-col items-center justify-center">
        <p className="text-muted font-mono">post not found</p>
        <Link href="/blog" className="text-accent font-mono text-sm mt-4 hover:underline">
          ← back to blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <article className="max-w-3xl mx-auto">
        <Link
          href="/blog"
          className="inline-block text-muted font-mono text-sm hover:text-accent transition-colors mb-8"
        >
          ← back
        </Link>

        <header className="mb-12">
          <div className="flex items-center gap-3 text-xs font-mono text-muted mb-4">
            <time>{post.date}</time>
            {post.tags.map((tag) => (
              <span key={tag} className="text-accent/70 bg-accent/5 px-2 py-0.5 rounded">
                #{tag}
              </span>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">{post.title}</h1>
        </header>

        <div className="prose-custom">
          <MDXRemote
            source={post.content}
            options={{
              mdxOptions: {
                rehypePlugins: [rehypeHighlight, rehypeSlug],
              },
            }}
          />
        </div>
      </article>
    </div>
  );
}

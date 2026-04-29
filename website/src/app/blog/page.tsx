import Link from "next/link";
import { getAllPosts } from "@/lib/mdx";
import FallingParticles from "@/components/FallingParticles";

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 relative bg-grid">
      <div className="scanline" />
      <FallingParticles
        count={35}
        color="#ffb7c5"
        type="petal"
        sizeRange={[3, 7]}
        speedRange={[0.4, 1]}
        opacityRange={[0.15, 0.4]}
      />
      <div className="max-w-3xl mx-auto">
        {/* Terminal header */}
        <div className="mb-12 p-4 rounded-lg border border-white/5 bg-surface/30 backdrop-blur-sm">
          <div className="font-mono text-xs text-muted space-y-0.5">
            <p>
              <span className="text-accent">quiet-sys</span>
              <span className="text-muted">@home</span>
              <span className="text-foreground">:</span>
              <span className="text-neon-blue">~</span>
              <span className="text-foreground">$</span> find
              <span className="text-accent ml-2">.</span> -name
              <span className="text-neon-green"> &quot;*.mdx&quot;</span> | wc -l
            </p>
            <p className="text-foreground">
              ➜ <span className="text-neon-green">{posts.length}</span> posts
            </p>
          </div>
        </div>

        {posts.length === 0 ? (
          <p className="text-muted font-mono text-sm">no posts yet.</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block"
              >
                <article className="relative border border-white/5 rounded-lg p-5 transition-all duration-300 hover:border-accent/30 hover:bg-surface/30 hover:shadow-[0_0_15px_rgba(0,240,255,0.05)]">
                  {/* Terminal prompt line */}
                  <div className="font-mono text-xs text-muted mb-3 flex items-center gap-2">
                    <span className="text-accent">$</span>
                    <span>cat</span>
                    <span className="text-muted/60">{post.slug}.md</span>
                  </div>

                  {/* Meta: date + tags */}
                  <div className="flex items-center gap-3 text-xs font-mono text-muted mb-2 ml-4">
                    <span className="text-foreground/50">{post.date}</span>
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-accent/60 bg-accent/5 px-1.5 py-0.5 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Title + excerpt */}
                  <div className="ml-4">
                    <h2 className="text-lg font-semibold mb-1.5 group-hover:text-accent transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-muted text-sm leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>
                  </div>

                  {/* Read more */}
                  <div className="ml-4 mt-3 font-mono text-xs text-accent/40 group-hover:text-accent transition-colors flex items-center gap-1">
                    <span>──</span>
                    <span>more</span>
                    <span>→</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

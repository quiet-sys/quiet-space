import Link from "next/link";
import Scene3D from "@/components/Scene3D";
import TypingEffect from "@/components/TypingEffect";
import { getAllPosts } from "@/lib/mdx";

export default async function Home() {
  const allPosts = await getAllPosts();
  const posts = allPosts.slice(0, 3);

  return (
    <div className="relative">
      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <Scene3D />
        <div className="relative z-10 text-center px-4">
          <p className="text-accent font-mono text-sm mb-4 animate-glow inline-block px-3 py-1 border border-accent/30 rounded">
            $ system online
          </p>
          <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
            <span className="text-foreground">hey, i&apos;m </span>
            <span className="text-accent">quiet-sys</span>
          </h1>
          <div className="h-12 md:h-14">
            <TypingEffect
              strings={[
                "I build things with code",
                "exploring AI & agents",
                "full-stack developer",
                "terminal enthusiast",
              ]}
            />
          </div>
          <div className="mt-12 flex gap-4 justify-center flex-wrap">
            <Link
              href="/projects"
              className="px-6 py-3 border border-accent text-accent rounded hover:bg-accent hover:text-background transition-all duration-300 font-mono text-sm"
            >
              view projects
            </Link>
            <Link
              href="/agent"
              className="px-6 py-3 border border-neon-green text-neon-green rounded hover:bg-neon-green hover:text-background transition-all duration-300 font-mono text-sm"
            >
              talk to agent →
            </Link>
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section className="px-4 py-24 max-w-3xl mx-auto">
        <div className="border border-white/5 rounded-lg p-6 md:p-8 bg-surface/30 backdrop-blur-sm">
          <div className="font-mono text-xs text-muted mb-4 space-y-0.5">
            <p><span className="text-accent">quiet-sys</span><span className="text-muted">@home</span><span className="text-foreground">:</span><span className="text-neon-blue">~</span><span className="text-foreground">$</span> whoami</p>
          </div>
          <div className="font-mono text-sm text-foreground/80 space-y-3">
            <p>
              a developer exploring code, AI, and building cool things.
            </p>
            <p>
              passionate about full-stack development, AI agents, and creating
              experiences that feel both technical and delightful.
            </p>
          </div>
          <div className="mt-6 pt-6 border-t border-white/5">
            <div className="flex flex-wrap gap-2">
              {["Python", "TypeScript", "React", "Next.js", "FastAPI", "AI/ML"].map(
                (skill) => (
                  <span
                    key={skill}
                    className="text-xs font-mono px-2 py-1 border border-accent/20 text-accent/80 rounded"
                  >
                    {skill}
                  </span>
                )
              )}
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-white/5 flex gap-6 font-mono text-xs">
            <a
              href="https://github.com/quiet-sys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-accent transition-colors"
            >
              github
            </a>
            <a
              href="mailto:contact@example.com"
              className="text-muted hover:text-accent transition-colors"
            >
              email
            </a>
          </div>
        </div>
      </section>

      {/* ── Latest Posts ── */}
      <section className="px-4 pb-24 max-w-3xl mx-auto">
        <div className="font-mono text-xs text-muted mb-6">
          <span className="text-accent">quiet-sys</span>
          <span className="text-muted">@home</span>
          <span className="text-foreground">:</span>
          <span className="text-neon-blue">~</span>
          <span className="text-foreground">$</span> ls -lt
          <span className="text-accent ml-2">posts/</span>
        </div>

        {posts.length === 0 ? (
          <p className="text-muted font-mono text-xs">no posts yet.</p>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex items-start gap-4 p-3 rounded border border-transparent hover:border-accent/20 hover:bg-surface/50 transition-all duration-300"
              >
                <span className="font-mono text-xs text-muted shrink-0 w-24">
                  {post.date}
                </span>
                <div>
                  <span className="font-mono text-sm text-foreground/80 group-hover:text-accent transition-colors">
                    {post.title}
                  </span>
                  <div className="flex gap-2 mt-1">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono text-accent/50"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <Link
          href="/blog"
          className="inline-block mt-6 font-mono text-xs text-muted hover:text-accent transition-colors"
        >
          view all posts →
        </Link>
      </section>
    </div>
  );
}

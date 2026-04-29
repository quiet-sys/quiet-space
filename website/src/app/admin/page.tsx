"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { listArticles, deleteArticle, Article } from "@/lib/api";

export default function AdminPage() {
  const pathname = usePathname();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = () => {
    setLoading(true);
    listArticles()
      .then((res) => setArticles(res.articles))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDelete = async (slug: string, title: string) => {
    if (!slug) return;
    if (!confirm(`delete "${title}"?`)) return;
    try {
      await deleteArticle(slug);
      fetchArticles();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              <span className="text-accent">$</span> admin
            </h1>
            <div className="flex gap-4 mt-2">
              <Link
                href="/admin"
                className={`font-mono text-xs transition-colors ${pathname === "/admin" ? "text-accent" : "text-muted hover:text-foreground"}`}
              >
                /articles
              </Link>
              <Link
                href="/admin/knowledge"
                className={`font-mono text-xs transition-colors ${pathname === "/admin/knowledge" ? "text-accent" : "text-muted hover:text-foreground"}`}
              >
                /knowledge
              </Link>
            </div>
          </div>
          <Link
            href="/admin/new"
            className="px-4 py-2 border border-accent text-accent rounded hover:bg-accent hover:text-background transition-all duration-300 font-mono text-xs"
          >
            + new post
          </Link>
        </div>

        {loading ? (
          <p className="text-muted font-mono text-sm">loading...</p>
        ) : articles.length === 0 ? (
          <p className="text-muted font-mono text-sm">no articles yet.</p>
        ) : (
          <div className="space-y-2">
            {articles.map((a) => (
              <div
                key={a.slug}
                className="flex items-center gap-4 p-3 rounded border border-white/5 hover:border-accent/20 transition-colors"
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    a.published ? "bg-neon-green" : "bg-muted"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/admin/${a.slug}/edit`}
                    className="font-mono text-sm hover:text-accent transition-colors truncate block"
                  >
                    {a.title}
                  </Link>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-muted mt-0.5">
                    <span>{a.slug}</span>
                    <span>•</span>
                    <span>{a.created_at?.slice(0, 10)}</span>
                    {a.tags?.map((t) => (
                      <span key={t} className="text-accent/60">#{t}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link
                    href={`/admin/${a.slug}/edit`}
                    className="px-3 py-1 text-xs font-mono text-muted border border-white/10 rounded hover:border-accent/30 hover:text-accent transition-colors"
                  >
                    edit
                  </Link>
                  <button
                    onClick={() => handleDelete(a.slug, a.title)}
                    className="px-3 py-1 text-xs font-mono text-muted border border-white/10 rounded hover:border-red-500/30 hover:text-red-400 transition-colors"
                  >
                    del
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

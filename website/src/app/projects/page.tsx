"use client";

import { useEffect, useState } from "react";
import { listProjects, Project } from "@/lib/api";

const tagColors: Record<string, string> = {
  "Next.js": "text-foreground",
  TypeScript: "text-neon-blue",
  Python: "text-yellow-400",
  FastAPI: "text-neon-green",
  DeepSeek: "text-accent",
  React: "text-cyan-400",
  Go: "text-cyan-300",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listProjects()
      .then((res) => setProjects(res.projects))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Terminal header */}
        <div className="mb-10 p-4 rounded-lg border border-white/5 bg-surface/30 backdrop-blur-sm">
          <div className="font-mono text-xs text-muted space-y-0.5">
            <p>
              <span className="text-accent">quiet-sys</span>
              <span className="text-muted">@home</span>
              <span className="text-foreground">:</span>
              <span className="text-neon-blue">~</span>
              <span className="text-foreground">$</span> ls
              <span className="text-accent ml-2">-la</span>
              <span className="text-accent ml-2">projects/</span>
            </p>
            <p className="text-foreground">
              ➜ <span className="text-neon-green">{loading ? "..." : projects.length}</span> projects
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-muted font-mono text-sm">loading...</p>
        ) : projects.length === 0 ? (
          <div className="text-muted font-mono text-sm text-center py-20">
            <p>no projects yet.</p>
            <p className="text-xs mt-2">check back later</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {projects.map((p) => (
              <div
                key={p.slug}
                className="group border border-white/5 rounded-lg p-5 transition-all duration-300 hover:border-accent/30 hover:bg-surface/30 hover:shadow-[0_0_20px_rgba(0,240,255,0.06)]"
              >
                <div className="w-10 h-10 rounded border border-white/10 flex items-center justify-center text-lg mb-4 text-muted group-hover:border-accent/20 group-hover:text-accent transition-colors">◆</div>
                <h2 className="text-lg font-semibold mb-1.5 group-hover:text-accent transition-colors">{p.title}</h2>
                <p className="text-sm text-muted leading-relaxed mb-4">{p.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {p.tags.map((tag) => (
                    <span key={tag} className={`text-[10px] font-mono px-2 py-0.5 rounded border border-white/5 ${tagColors[tag] || "text-muted"}`}>{tag}</span>
                  ))}
                </div>
                <div className="flex gap-4">
                  {p.github_url && (
                    <a href={p.github_url} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-muted hover:text-accent transition-colors flex items-center gap-1"><span>──</span> github →</a>
                  )}
                  {p.demo_url && (
                    <a href={p.demo_url} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-muted hover:text-neon-green transition-colors flex items-center gap-1"><span>──</span> demo →</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

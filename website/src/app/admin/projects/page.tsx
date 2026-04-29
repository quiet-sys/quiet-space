"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listProjects, deleteProject, Project } from "@/lib/api";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    listProjects()
      .then((res) => setProjects(res.projects))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleDelete = async (slug: string, title: string) => {
    if (!confirm(`delete "${title}"?`)) return;
    try { await deleteProject(slug); fetch(); }
    catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold"><span className="text-accent">$</span> projects</h1>
            <p className="text-muted font-mono text-xs mt-1">manage projects ({projects.length})</p>
          </div>
          <Link href="/admin/projects/new" className="px-4 py-2 border border-accent text-accent rounded hover:bg-accent hover:text-background transition-all duration-300 font-mono text-xs">+ new project</Link>
        </div>

        {loading ? (
          <p className="text-muted font-mono text-sm">loading...</p>
        ) : projects.length === 0 ? (
          <p className="text-muted font-mono text-sm">no projects yet.</p>
        ) : (
          <div className="space-y-2">
            {projects.map((p) => (
              <div key={p.slug} className="flex items-center gap-4 p-3 rounded border border-white/5 hover:border-accent/20 transition-colors">
                <div className="flex-1 min-w-0">
                  <Link href={`/admin/projects/${p.slug}/edit`} className="font-mono text-sm hover:text-accent transition-colors truncate block">{p.title}</Link>
                  <div className="flex gap-2 text-[10px] font-mono text-muted mt-0.5">
                    {p.tags?.map((t) => <span key={t} className="text-accent/60">#{t}</span>)}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link href={`/admin/projects/${p.slug}/edit`} className="px-3 py-1 text-xs font-mono text-muted border border-white/10 rounded hover:border-accent/30 hover:text-accent transition-colors">edit</Link>
                  <button onClick={() => handleDelete(p.slug, p.title)} className="px-3 py-1 text-xs font-mono text-muted border border-white/10 rounded hover:border-red-500/30 hover:text-red-400 transition-colors">del</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

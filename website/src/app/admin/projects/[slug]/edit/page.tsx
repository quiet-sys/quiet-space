"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getProject, updateProject } from "@/lib/api";
import TagInput from "@/components/TagInput";

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [github_url, setGithubUrl] = useState("");
  const [demo_url, setDemoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProject(slug).then((p) => { setTitle(p.title); setDescription(p.description); setTags(p.tags || []); setGithubUrl(p.github_url); setDemoUrl(p.demo_url); }).catch(console.error).finally(() => setLoading(false));
  }, [slug]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await updateProject(slug, { title, description, tags, github_url, demo_url });
      router.push("/admin/projects");
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="min-h-screen pt-24 px-4"><p className="text-muted font-mono text-sm max-w-3xl mx-auto">loading...</p></div>;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/admin/projects" className="text-muted font-mono text-xs hover:text-accent transition-colors">← back</Link>
          <h1 className="text-2xl font-bold"><span className="text-accent">$</span> edit <span className="text-muted font-mono text-sm">/{slug}</span></h1>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono text-muted block mb-1">tags</label>
            <TagInput tags={tags} onChange={setTags} />
          </div>
          <div>
            <label className="text-xs font-mono text-muted block mb-1">title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-transparent border border-white/10 rounded px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-accent/50" />
          </div>
          <div>
            <label className="text-xs font-mono text-muted block mb-1">description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full bg-transparent border border-white/10 rounded px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted/30 focus:outline-none focus:border-accent/50 resize-none" />
          </div>
          <div>
            <label className="text-xs font-mono text-muted block mb-1">github url</label>
            <input type="text" value={github_url} onChange={(e) => setGithubUrl(e.target.value)} className="w-full bg-transparent border border-white/10 rounded px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-accent/50" />
          </div>
          <div>
            <label className="text-xs font-mono text-muted block mb-1">demo url</label>
            <input type="text" value={demo_url} onChange={(e) => setDemoUrl(e.target.value)} className="w-full bg-transparent border border-white/10 rounded px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-accent/50" />
          </div>
          <div className="flex justify-end pt-4">
            <button onClick={handleSave} disabled={saving || !title.trim()} className="px-5 py-2 text-xs font-mono border border-accent text-accent rounded hover:bg-accent hover:text-background transition-colors disabled:opacity-30">{saving ? "saving..." : "update"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

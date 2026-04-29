"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createProject } from "@/lib/api";
import TagInput from "@/components/TagInput";

export default function NewProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [github_url, setGithubUrl] = useState("");
  const [demo_url, setDemoUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "project-" + Date.now();
      await createProject({ slug, title, description, tags, github_url, demo_url });
      router.push("/admin/projects");
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  const fields = [
    { key: "title" as const, label: "title", type: "input" },
    { key: "description" as const, label: "description", type: "textarea" },
    { key: "github_url" as const, label: "github url", type: "input", ph: "https://github.com/..." },
    { key: "demo_url" as const, label: "demo url", type: "input", ph: "https://..." },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/admin/projects" className="text-muted font-mono text-xs hover:text-accent transition-colors">← back</Link>
          <h1 className="text-2xl font-bold"><span className="text-accent">$</span> new project</h1>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono text-muted block mb-1">tags</label>
            <TagInput tags={tags} onChange={setTags} />
          </div>
          {fields.map((f) => (
            <div key={f.key}>
              <label className="text-xs font-mono text-muted block mb-1">{f.label}</label>
              {f.type === "textarea" ? (
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full bg-transparent border border-white/10 rounded px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted/30 focus:outline-none focus:border-accent/50 resize-none" />
              ) : (
                <input type="text" value={f.key === "title" ? title : f.key === "github_url" ? github_url : demo_url} onChange={(e) => { const v = e.target.value; if (f.key === "title") setTitle(v); else if (f.key === "github_url") setGithubUrl(v); else setDemoUrl(v); }} placeholder={("ph" in f ? (f as any).ph : "") || ""} className="w-full bg-transparent border border-white/10 rounded px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted/30 focus:outline-none focus:border-accent/50" />
              )}
            </div>
          ))}
          <div className="flex justify-end pt-4">
            <button onClick={handleSave} disabled={saving || !title.trim()} className="px-5 py-2 text-xs font-mono border border-accent text-accent rounded hover:bg-accent hover:text-background transition-colors disabled:opacity-30">{saving ? "saving..." : "save"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

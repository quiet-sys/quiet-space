"use client";

import { useRouter } from "next/navigation";
import MDEditor from "@/components/MDEditor";
import { createArticle } from "@/lib/api";
import { useState } from "react";
import Link from "next/link";

export default function NewArticlePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSave = async (data: {
    title: string;
    content: string;
    excerpt: string;
    tags: string[];
    published: boolean;
  }) => {
    setSaving(true);
    try {
      const slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
        .replace(/^-|-$/g, "")
        .replace(/-+/g, "-") || "post-" + Date.now();
      await createArticle({ ...data, slug, content: data.content });
      router.push("/admin");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/admin" className="text-muted font-mono text-xs hover:text-accent transition-colors">
            ← back
          </Link>
          <h1 className="text-2xl font-bold">
            <span className="text-accent">$</span> new post
          </h1>
        </div>
        <MDEditor onSave={handleSave} saving={saving} />
      </div>
    </div>
  );
}

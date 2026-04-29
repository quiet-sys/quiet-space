"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import MDEditor from "@/components/MDEditor";
import { getArticle, updateArticle } from "@/lib/api";

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [initial, setInitial] = useState<{
    title: string;
    content: string;
    tags: string[];
    published: boolean;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getArticle(slug)
      .then((a) =>
        setInitial({
          title: a.title,
          content: a.content,
          tags: a.tags,
          published: a.published,
        })
      )
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSave = async (data: {
    title: string;
    content: string;
    excerpt: string;
    tags: string[];
    published: boolean;
  }) => {
    setSaving(true);
    try {
      await updateArticle(slug, data);
      router.push("/admin");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4">
        <p className="text-muted font-mono text-sm max-w-4xl mx-auto">loading...</p>
      </div>
    );
  }

  if (!initial) {
    return (
      <div className="min-h-screen pt-24 px-4">
        <p className="text-muted font-mono text-sm max-w-4xl mx-auto">article not found</p>
        <Link href="/admin" className="text-accent font-mono text-xs mt-4 inline-block max-w-4xl mx-auto">
          ← back
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/admin" className="text-muted font-mono text-xs hover:text-accent transition-colors">
            ← back
          </Link>
          <h1 className="text-2xl font-bold">
            <span className="text-accent">$</span> edit
            <span className="text-muted font-mono text-sm ml-2">/{slug}</span>
          </h1>
        </div>
        <MDEditor
          key={slug}
          initialTitle={initial.title}
          initialContent={initial.content}
          initialTags={initial.tags}
          initialPublished={initial.published}
          onSave={handleSave}
          saving={saving}
        />
      </div>
    </div>
  );
}

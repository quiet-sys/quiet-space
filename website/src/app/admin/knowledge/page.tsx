"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { listKnowledgeFiles, uploadKnowledgeFile, deleteKnowledgeFile, KnowledgeFile } from "@/lib/api";

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + "B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + "KB";
  return (bytes / 1024 / 1024).toFixed(1) + "MB";
}

function formatTime(ts: number): string {
  return new Date(ts * 1000).toISOString().slice(0, 10);
}

export default function KnowledgePage() {
  const [files, setFiles] = useState<KnowledgeFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = () => {
    setLoading(true);
    listKnowledgeFiles()
      .then((res) => { setFiles(res.files); setBackendOnline(true); })
      .catch(() => setBackendOnline(false))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadKnowledgeFile(file);
      fetchFiles();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`delete "${name}"?`)) return;
    try {
      await deleteKnowledgeFile(name);
      fetchFiles();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Backend status */}
        {backendOnline === false && (
          <div className="mb-4 p-3 rounded border border-red-500/30 bg-red-500/5">
            <p className="text-xs font-mono text-red-400">
              ⚠ agent backend offline — check pm2 logs: <code className="ml-2 px-2 py-0.5 bg-black/30 rounded text-red-300">pm2 logs agent</code>
            </p>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">
                <span className="text-accent">$</span> knowledge
              </h1>
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${backendOnline === null ? "bg-muted animate-pulse" : backendOnline ? "bg-neon-green" : "bg-red-500"}`} />
            </div>
            <p className="text-muted font-mono text-xs mt-1">
              manage knowledge base files ({files.length} files)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="file"
              accept=".md,.txt"
              onChange={handleUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className={`px-4 py-2 border border-accent text-accent rounded hover:bg-accent hover:text-background transition-all duration-300 font-mono text-xs cursor-pointer ${uploading ? "opacity-50 pointer-events-none" : ""}`}
            >
              {uploading ? "uploading..." : "+ upload"}
            </label>
            <Link
              href="/admin"
              className="px-4 py-2 border border-white/10 text-muted rounded hover:border-accent/30 hover:text-accent transition-all duration-300 font-mono text-xs"
            >
              ← admin
            </Link>
          </div>
        </div>

        {loading ? (
          <p className="text-muted font-mono text-sm">loading...</p>
        ) : files.length === 0 ? (
          <p className="text-muted font-mono text-sm">no knowledge files.</p>
        ) : (
          <div className="space-y-1">
            {files.map((f) => (
              <div
                key={f.name}
                className="flex items-center gap-4 p-3 rounded border border-white/5 hover:border-accent/20 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm truncate">{f.name}</div>
                  <div className="text-[10px] font-mono text-muted mt-0.5">
                    {formatSize(f.size)} • {formatTime(f.modified)}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(f.name)}
                  className="px-3 py-1 text-xs font-mono text-muted border border-white/10 rounded hover:border-red-500/30 hover:text-red-400 transition-colors shrink-0"
                >
                  delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import TagInput from "./TagInput";

interface MDEditorProps {
  initialTitle?: string;
  initialContent?: string;
  initialTags?: string[];
  initialPublished?: boolean;
  onSave: (data: {
    title: string;
    content: string;
    excerpt: string;
    tags: string[];
    published: boolean;
  }) => Promise<void>;
  saving?: boolean;
}

export default function MDEditor({
  initialTitle = "",
  initialContent = "",
  initialTags = [],
  initialPublished = false,
  onSave,
  saving = false,
}: MDEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [published, setPublished] = useState(initialPublished);

  const excerpt = content
    .replace(/[#*`\[\]]/g, "")
    .split("\n")
    .filter(Boolean)
    .slice(0, 2)
    .join(" ")
    .slice(0, 200);

  const handleSave = async (publish: boolean) => {
    await onSave({
      title,
      content,
      excerpt,
      tags,
      published: publish,
    });
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="post title"
          className="w-full bg-transparent border border-white/10 rounded px-4 py-3 text-lg font-semibold text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent/50 transition-colors font-mono"
        />
      </div>

      {/* Tags */}
      <TagInput tags={tags} onChange={setTags} />

      {/* Editor + Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono text-muted mb-1">edit</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="write in markdown..."
            className="flex-1 min-h-[400px] bg-surface border border-white/10 rounded p-4 font-mono text-sm text-foreground placeholder:text-muted/30 focus:outline-none focus:border-accent/50 transition-colors resize-none"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-mono text-muted mb-1">preview</span>
          <div className="flex-1 min-h-[400px] border border-white/10 rounded p-4 overflow-y-auto prose-custom">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {content || "*start typing...*"}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <label className="flex items-center gap-2 text-xs font-mono text-muted cursor-pointer">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="accent-accent"
          />
          published
        </label>
        <div className="flex gap-3">
          <button
            onClick={() => handleSave(false)}
            disabled={saving || !title.trim()}
            className="px-5 py-2 text-xs font-mono border border-white/10 text-muted rounded hover:border-accent/30 hover:text-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {saving ? "saving..." : "save draft"}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving || !title.trim()}
            className="px-5 py-2 text-xs font-mono border border-accent text-accent rounded hover:bg-accent hover:text-background transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {saving ? "publishing..." : "publish"}
          </button>
        </div>
      </div>
    </div>
  );
}

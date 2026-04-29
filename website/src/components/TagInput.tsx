"use client";

import { useState } from "react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export default function TagInput({ tags, onChange }: TagInputProps) {
  const [input, setInput] = useState("");

  const add = () => {
    const t = input.trim();
    if (t && !tags.includes(t)) {
      onChange([...tags, t]);
    }
    setInput("");
  };

  const remove = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 text-xs font-mono px-2 py-1 border border-accent/20 text-accent/80 rounded"
        >
          #{tag}
          <button onClick={() => remove(tag)} className="hover:text-red-400 ml-0.5">×</button>
        </span>
      ))}
      <div className="flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder="add tag"
          className="bg-transparent border border-white/10 rounded px-2 py-1 text-xs font-mono text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent/50 w-24"
        />
      </div>
    </div>
  );
}

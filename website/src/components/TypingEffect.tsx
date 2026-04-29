"use client";

import { useState, useEffect } from "react";

interface TypingEffectProps {
  strings: string[];
}

export default function TypingEffect({ strings }: TypingEffectProps) {
  const [index, setIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = strings[index];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && charIndex < current.length) {
      timeout = setTimeout(() => setCharIndex((c) => c + 1), 60);
    } else if (!deleting && charIndex === current.length) {
      timeout = setTimeout(() => setDeleting(true), 2000);
    } else if (deleting && charIndex > 0) {
      timeout = setTimeout(() => setCharIndex((c) => c - 1), 30);
    } else if (deleting && charIndex === 0) {
      setDeleting(false);
      setIndex((i) => (i + 1) % strings.length);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, deleting, index, strings]);

  return (
    <span className="font-mono text-xl md:text-2xl text-foreground/80">
      $ {strings[index].substring(0, charIndex)}
      <span className="animate-pulse text-accent">▌</span>
    </span>
  );
}

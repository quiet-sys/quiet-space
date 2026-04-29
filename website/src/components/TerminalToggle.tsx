"use client";

import { useState, useEffect } from "react";
import Terminal from "./Terminal";

export default function TerminalToggle() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "`") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="terminal-overlay" onClick={() => setOpen(false)}>
      <div className="terminal-overlay-panel" onClick={(e) => e.stopPropagation()}>
        <div className="h-full flex flex-col font-mono text-sm">
          <Terminal />
        </div>
      </div>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-muted/40">
        Ctrl+` to close · Esc to close
      </div>
    </div>
  );
}

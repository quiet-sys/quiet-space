"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { chatStream } from "@/lib/agent-api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function parseMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const lines = text.split("\n");
  let inCode = false;
  let codeBuffer: string[] = [];
  let codeLang = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("```")) {
      if (inCode) {
        parts.push(<pre key={`code-${i}`} className="terminal-code"><code>{codeBuffer.join("\n")}</code></pre>);
        codeBuffer = []; codeLang = ""; inCode = false;
      } else { codeLang = line.slice(3).trim(); inCode = true; }
      continue;
    }
    if (inCode) { codeBuffer.push(line); continue; }
    const t = line.trim();
    if (!t) { parts.push(<br key={`br-${i}`} />); continue; }
    if (t.startsWith("## ")) parts.push(<div key={`h2-${i}`} className="terminal-h2">{t.slice(3)}</div>);
    else if (t.startsWith("**") && t.endsWith("**")) parts.push(<div key={`b-${i}`} className="terminal-bold">{t.slice(2, -2)}</div>);
    else if (t.startsWith("- ")) parts.push(<div key={`li-${i}`} className="terminal-li">{formatInline(t.slice(2))}</div>);
    else parts.push(<div key={`p-${i}`} className="terminal-p">{formatInline(t)}</div>);
  }
  if (inCode && codeBuffer.length) parts.push(<pre key="code-trailing" className="terminal-code"><code>{codeBuffer.join("\n")}</code></pre>);
  return parts;
}

function formatInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let r = text;
  while (r.length > 0) {
    const bs = r.indexOf("**"), cs = r.indexOf("`");
    if (bs === 0) { const be = r.indexOf("**", 2); if (be > 0) { parts.push(<strong key={`b-${parts.length}`}>{r.slice(2, be)}</strong>); r = r.slice(be + 2); continue; } }
    if (cs >= 0) { if (cs > 0) { parts.push(r.slice(0, cs)); r = r.slice(cs); } const ce = r.indexOf("`", 1); if (ce > 0) { parts.push(<code key={`c-${parts.length}`} className="terminal-inline-code">{r.slice(1, ce)}</code>); r = r.slice(ce + 1); continue; } }
    parts.push(r); break;
  }
  return <>{parts}</>;
}

const bootLines = [
  { text: "system initializing...", delay: 300 },
  { text: "[OK] agent engine loaded", delay: 200 },
  { text: "[OK] RAG knowledge base connected", delay: 250 },
  { text: "[OK] session established", delay: 150 },
  { text: "", delay: 100 },
  { text: "ready. type a message or /help", delay: 200 },
];

export default function Terminal({ fullPage = false }: { fullPage?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "connecting" | "streaming">("idle");
  const [bootDone, setBootDone] = useState(false);
  const [bootVisible, setBootVisible] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("agent_session_id");
    if (saved) setSessionId(saved);
  }, []);

  useEffect(() => {
    if (bootDone) setTimeout(() => inputRef.current?.focus(), 50);
  }, [bootDone]);

  useEffect(() => {
    if (bootVisible < bootLines.length) {
      const t = setTimeout(() => setBootVisible((v) => v + 1), bootLines[bootVisible].delay);
      return () => clearTimeout(t);
    } else {
      setBootDone(true);
    }
  }, [bootVisible]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, bootVisible]);

  const appendMessage = useCallback((msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const updateLastMessage = useCallback((chunk: string) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === "assistant") {
        return [...prev.slice(0, -1), { ...last, content: last.content + chunk }];
      }
      return prev;
    });
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || streaming) return;

      if (trimmed === "/clear") { setMessages([]); setInput(""); return; }
      if (trimmed === "/help") {
        appendMessage({ role: "user", content: trimmed });
        appendMessage({ role: "assistant", content: "available commands:\n  /clear  - clear terminal\n  /help   - show this message\n\ntip: ask me anything!" });
        setInput(""); return;
      }

      appendMessage({ role: "user", content: trimmed });
      setInput(""); setStreaming(true); setStatus("streaming");
      appendMessage({ role: "assistant", content: "" });

      await chatStream(trimmed, sessionId,
        (chunk) => updateLastMessage(chunk),
        (sid) => { setSessionId(sid); localStorage.setItem("agent_session_id", sid); setStreaming(false); setStatus("idle"); },
        (err) => { updateLastMessage(`\n\n[error: ${err.message}]`); setStreaming(false); setStatus("idle"); }
      );
    },
    [sessionId, streaming, appendMessage, updateLastMessage]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") send(input);
  };

  const prompt = (
    <span className="terminal-prompt shrink-0">
      <span className="text-accent">quiet-sys</span>
      <span className="text-muted">@agent</span>
      <span className="text-foreground">:</span>
      <span className="text-neon-blue">~</span>
      <span className="text-foreground">$</span>
    </span>
  );

  return (
    <div className={`flex flex-col h-full ${fullPage ? "" : ""}`}>
      {/* Header */}
      {fullPage && (
        <div className="shrink-0 border-b border-white/5 px-4 py-3 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className={`w-2 h-2 rounded-full ${bootDone ? "bg-neon-green" : "bg-muted animate-pulse"}`} />
            <span className="text-foreground/60">agent</span>
            <span className="text-muted">•</span>
            <span className={status === "streaming" ? "text-neon-green" : "text-muted"}>{bootDone ? status : "booting"}</span>
          </div>
          <div className="font-mono text-[10px] text-muted">
            {sessionId ? sessionId.slice(0, 8) + "..." : "new session"}
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-sm">
        {/* Boot sequence */}
        {!bootDone && bootLines.slice(0, bootVisible).map((line, i) => (
          <div key={i} className={`text-xs ${line.text.startsWith("[OK]") ? "text-neon-green/70" : line.text ? "text-muted" : ""}`}>
            {line.text && <span>{line.text}</span>}
          </div>
        ))}

        {/* Chat messages */}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-lg px-3 py-2 ${
              msg.role === "user"
                ? "bg-accent/15 text-foreground"
                : "bg-white/5 text-foreground/90"
            }`}>
              <div className="terminal-output">{parseMarkdown(msg.content)}</div>
            </div>
          </div>
        ))}

        {streaming && (
          <div className="flex justify-start">
            <div className="bg-white/5 rounded-lg px-3 py-2">
              <span className="inline-block w-2 h-4 bg-accent/70 animate-pulse" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-white/5">
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent animate-pulse" />
          <div className="p-4">
            <div className="flex items-center gap-2 font-mono text-base">
              {bootDone && prompt}
              <input
                ref={inputRef}
                type="text"
                value={bootDone ? input : ""}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={streaming || !bootDone}
                placeholder={!bootDone ? "booting..." : streaming ? "waiting..." : "type a message..."}
                className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted/30 font-mono text-base py-1"
                autoFocus
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



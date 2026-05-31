"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import DigitalRain from "@/components/DigitalRain";
import FallingParticles from "@/components/FallingParticles";
import {
  AgentStatus,
  QualityReport,
  ResourceGenerateRequest,
  ResourceStreamEvent,
  generateResourceStream,
} from "@/lib/resource-api";

const agentLabels: Record<string, string> = {
  InputAgent: "接收",
  ProfileAgent: "画像",
  RetrievalAgent: "检索",
  PlannerAgent: "规划",
  WriterAgent: "生成",
  ReviewAgent: "检验",
};

const stages = ["接收信息", "并行分析", "生成内容", "检验优化", "完成"];

const defaults: ResourceGenerateRequest = {
  topic: "JavaScript 闭包",
  learning_goal: "理解闭包的概念、用途和常见陷阱",
  learner_level: "高中生 / 编程入门",
  preferred_style: "循序渐进、例子驱动、语言清晰",
  duration: "45 分钟",
  structure: "学习目标、概念导入、核心讲解、代码示例、练习任务、复盘总结",
};

export default function ResourcesPage() {
  const [form, setForm] = useState<ResourceGenerateRequest>(defaults);
  const [running, setRunning] = useState(false);
  const [taskId, setTaskId] = useState("");
  const [stage, setStage] = useState("待启动");
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState("0.0s");
  const [statusMessage, setStatusMessage] = useState("填写学习画像后启动多智能体资源生成。");
  const [markdown, setMarkdown] = useState("");
  const [qualityReport, setQualityReport] = useState<QualityReport | null>(null);
  const [agents, setAgents] = useState<Record<string, { status: AgentStatus; message: string }>>(
    Object.fromEntries(
      Object.keys(agentLabels).map((agent) => [agent, { status: "idle", message: "standby" }])
    )
  );
  const [events, setEvents] = useState<string[]>([]);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      if (!startedAtRef.current) return;
      setElapsed(`${((Date.now() - startedAtRef.current) / 1000).toFixed(1)}s`);
    }, 250);
    return () => window.clearInterval(timer);
  }, [running]);

  const addEvent = (text: string) => {
    const stamp = new Date().toLocaleTimeString("zh-CN", { hour12: false });
    setEvents((prev) => [`${stamp} ${text}`, ...prev].slice(0, 10));
  };

  const handleEvent = (event: ResourceStreamEvent) => {
    if (event.type === "task_started") {
      setTaskId(event.taskId);
      startedAtRef.current = Date.now();
      setElapsed("0.0s");
      addEvent(`task_started ${event.taskId.slice(0, 8)}`);
      return;
    }

    if (event.type === "agent_status") {
      setAgents((prev) => ({
        ...prev,
        [event.agent]: { status: event.status, message: event.message },
      }));
      addEvent(`${event.agent} -> ${event.status}`);
      return;
    }

    if (event.type === "stage_progress") {
      setStage(event.stage);
      setProgress(event.progress);
      setStatusMessage(event.message);
      addEvent(`${event.stage} ${event.progress}%`);
      return;
    }

    if (event.type === "content_chunk") {
      setMarkdown((prev) => prev + event.text);
      return;
    }

    if (event.type === "quality_report") {
      setQualityReport({
        score: event.score,
        summary: event.summary,
        suggestions: event.suggestions,
      });
      addEvent(`quality_report ${event.score}`);
      return;
    }

    if (event.type === "task_done") {
      setRunning(false);
      setProgress(100);
      setStage("完成");
      setStatusMessage(`生成完成，用时 ${event.elapsedSeconds}s`);
      setElapsed(`${event.elapsedSeconds.toFixed(1)}s`);
      setQualityReport(event.qualityReport);
      addEvent("task_done");
      return;
    }

    if (event.type === "task_error") {
      setRunning(false);
      setStatusMessage(event.message);
      addEvent(`task_error ${event.message}`);
    }
  };

  const submit = async () => {
    if (running || !form.topic.trim()) return;
    setRunning(true);
    setTaskId("");
    startedAtRef.current = null;
    setElapsed("0.0s");
    setStage("接收信息");
    setProgress(0);
    startedAtRef.current = null;
    setElapsed("0.0s");
    setMarkdown("");
    setQualityReport(null);
    setEvents([]);
    setStatusMessage("正在连接资源生成流水线...");
    setAgents(
      Object.fromEntries(
        Object.keys(agentLabels).map((agent) => [agent, { status: "idle", message: "standby" }])
      )
    );

    await generateResourceStream(
      form,
      handleEvent,
      (err) => {
        setRunning(false);
        setStatusMessage(err.message);
        addEvent(`client_error ${err.message}`);
      }
    );
  };

  const reset = () => {
    if (running) return;
    setMarkdown("");
    setQualityReport(null);
    setProgress(0);
    setStage("待启动");
    setStatusMessage("填写学习画像后启动多智能体资源生成。");
    setEvents([]);
  };

  return (
    <div className="min-h-screen pt-14 relative overflow-hidden bg-background">
      <DigitalRain />
      <FallingParticles
        count={36}
        color="#39ff14"
        type="snow"
        sizeRange={[1, 2]}
        speedRange={[0.15, 0.55]}
        opacityRange={[0.12, 0.35]}
      />

      <div className="relative z-10 min-h-[calc(100vh-3.5rem)] px-4 py-5">
        <div className="mx-auto max-w-7xl space-y-4">
          <header className="border border-accent/15 bg-black/55 backdrop-blur-md px-4 py-3 shadow-[0_0_32px_rgba(0,240,255,0.08)]">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon-green">
                  multi-agent resource forge
                </p>
                <h1 className="mt-1 text-2xl font-semibold text-foreground">
                  个性化学习资源生成工作台
                </h1>
              </div>
              <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                <Metric label="stage" value={stage} />
                <Metric label="progress" value={`${progress}%`} />
                <Metric label="elapsed" value={elapsed} />
              </div>
            </div>
            <div className="mt-3 h-2 overflow-hidden border border-accent/20 bg-white/5">
              <div
                className="h-full bg-gradient-to-r from-neon-green via-accent to-neon-purple transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 font-mono text-[11px] text-muted">
              <span>{statusMessage}</span>
              <span>{taskId ? `task:${taskId.slice(0, 8)}` : "task:pending"}</span>
            </div>
          </header>

          <div className="grid gap-4 xl:grid-cols-[320px_1fr_420px]">
            <section className="border border-white/10 bg-black/50 p-4 backdrop-blur-md">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-mono text-sm text-accent">learning profile</h2>
                <span className={`h-2 w-2 ${running ? "bg-neon-green animate-pulse" : "bg-muted"}`} />
              </div>
              <div className="space-y-3">
                <Field
                  label="主题"
                  value={form.topic}
                  onChange={(topic) => setForm((prev) => ({ ...prev, topic }))}
                />
                <Field
                  label="学习目标"
                  value={form.learning_goal}
                  onChange={(learning_goal) => setForm((prev) => ({ ...prev, learning_goal }))}
                />
                <Field
                  label="学习者水平"
                  value={form.learner_level}
                  onChange={(learner_level) => setForm((prev) => ({ ...prev, learner_level }))}
                />
                <Field
                  label="偏好风格"
                  value={form.preferred_style}
                  onChange={(preferred_style) => setForm((prev) => ({ ...prev, preferred_style }))}
                />
                <Field
                  label="预计时长"
                  value={form.duration}
                  onChange={(duration) => setForm((prev) => ({ ...prev, duration }))}
                />
                <label className="block">
                  <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                    输出结构
                  </span>
                  <textarea
                    value={form.structure}
                    onChange={(e) => setForm((prev) => ({ ...prev, structure: e.target.value }))}
                    rows={4}
                    className="w-full resize-none border border-white/10 bg-surface/70 px-3 py-2 font-mono text-xs text-foreground outline-none transition-colors focus:border-accent/60"
                  />
                </label>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={submit}
                  disabled={running || !form.topic.trim()}
                  className="border border-accent bg-accent px-3 py-2 font-mono text-xs font-semibold text-background transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {running ? "generating" : "start"}
                </button>
                <button
                  onClick={reset}
                  disabled={running}
                  className="border border-white/10 px-3 py-2 font-mono text-xs text-muted transition-colors hover:border-accent/40 hover:text-accent disabled:opacity-40"
                >
                  reset
                </button>
              </div>
            </section>

            <section className="space-y-4">
              <div className="border border-accent/15 bg-black/45 p-4 backdrop-blur-md">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-mono text-sm text-accent">agent swarm</h2>
                  <span className="font-mono text-[10px] text-muted">hybrid parallel pipeline</span>
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {Object.entries(agentLabels).map(([agent, label]) => (
                    <AgentNode
                      key={agent}
                      name={agent}
                      label={label}
                      status={agents[agent]?.status || "idle"}
                      message={agents[agent]?.message || "standby"}
                    />
                  ))}
                </div>
              </div>

              <div className="border border-white/10 bg-black/45 p-4 backdrop-blur-md">
                <h2 className="mb-4 font-mono text-sm text-accent">stage timeline</h2>
                <div className="grid gap-2 md:grid-cols-5">
                  {stages.map((item, index) => {
                    const active = item === stage;
                    const done = stages.indexOf(stage) > index || progress === 100;
                    return (
                      <div
                        key={item}
                        className={`border px-3 py-3 font-mono text-xs ${
                          active
                            ? "border-accent bg-accent/10 text-accent"
                            : done
                              ? "border-neon-green/40 bg-neon-green/5 text-neon-green"
                              : "border-white/10 bg-white/[0.03] text-muted"
                        }`}
                      >
                        <div className="text-[10px] opacity-70">0{index + 1}</div>
                        <div className="mt-1">{item}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border border-white/10 bg-black/45 p-4 backdrop-blur-md">
                <h2 className="mb-3 font-mono text-sm text-accent">event stream</h2>
                <div className="h-40 overflow-y-auto border border-white/5 bg-background/60 p-3 font-mono text-[11px] text-muted">
                  {events.length === 0 ? (
                    <div>waiting for stream...</div>
                  ) : (
                    events.map((event, index) => (
                      <div key={`${event}-${index}`} className="mb-1">
                        <span className="text-neon-green">&gt;</span> {event}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            <section className="border border-white/10 bg-black/55 backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <h2 className="font-mono text-sm text-accent">markdown preview</h2>
                <span className="font-mono text-[10px] text-muted">{markdown.length} chars</span>
              </div>
              <div className="h-[520px] overflow-y-auto p-4 prose-custom">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                  {markdown || "生成开始后，Markdown 内容会在这里逐段流式呈现。"}
                </ReactMarkdown>
              </div>
              <div className="border-t border-white/10 p-4">
                <h3 className="mb-2 font-mono text-xs text-neon-green">quality report</h3>
                {qualityReport ? (
                  <div className="space-y-2 text-sm text-foreground/80">
                    <div className="font-mono text-xs text-accent">score: {qualityReport.score}</div>
                    <p>{qualityReport.summary}</p>
                    <ul className="space-y-1 text-xs text-muted">
                      {qualityReport.suggestions.map((item, index) => (
                        <li key={`${item}-${index}`}>- {item}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="font-mono text-xs text-muted">等待 ReviewAgent 完成检验。</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-24 border border-white/10 bg-white/[0.03] px-3 py-2">
      <div className="text-[9px] uppercase tracking-[0.14em] text-muted">{label}</div>
      <div className="mt-1 truncate text-accent">{value}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-white/10 bg-surface/70 px-3 py-2 font-mono text-xs text-foreground outline-none transition-colors focus:border-accent/60"
      />
    </label>
  );
}

function AgentNode({
  name,
  label,
  status,
  message,
}: {
  name: string;
  label: string;
  status: AgentStatus;
  message: string;
}) {
  const tone =
    status === "running"
      ? "border-accent text-accent shadow-[0_0_24px_rgba(0,240,255,0.16)]"
      : status === "done"
        ? "border-neon-green/50 text-neon-green"
        : status === "error"
          ? "border-red-400/60 text-red-300"
          : "border-white/10 text-muted";

  return (
    <div className={`relative min-h-32 border bg-white/[0.03] p-4 ${tone}`}>
      <div
        className={`absolute right-3 top-3 h-2 w-2 ${
          status === "running" ? "animate-ping bg-accent" : status === "done" ? "bg-neon-green" : "bg-muted"
        }`}
      />
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] opacity-70">{name}</div>
      <div className="mt-4 text-2xl font-semibold">{label}</div>
      <div className="mt-3 font-mono text-[11px] text-foreground/55">{message}</div>
    </div>
  );
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type AgentStatus = "idle" | "running" | "done" | "error";

export interface ResourceGenerateRequest {
  topic: string;
  learning_goal: string;
  learner_level: string;
  preferred_style: string;
  duration: string;
  structure: string;
}

export interface QualityReport {
  score: number;
  summary: string;
  suggestions: string[];
}

export type ResourceStreamEvent =
  | { type: "task_started"; taskId: string; agents: string[]; startedAt: number }
  | { type: "agent_status"; agent: string; status: AgentStatus; message: string }
  | { type: "stage_progress"; stage: string; progress: number; message: string }
  | { type: "content_chunk"; text: string }
  | { type: "quality_report"; score: number; summary: string; suggestions: string[] }
  | {
      type: "task_done";
      taskId: string;
      markdown: string;
      qualityReport: QualityReport | null;
      elapsedSeconds: number;
    }
  | { type: "task_error"; taskId: string; message: string; elapsedSeconds: number };

type ResourceEventType = ResourceStreamEvent["type"];

export async function generateResourceStream(
  payload: ResourceGenerateRequest,
  onEvent: (event: ResourceStreamEvent) => void,
  onError: (err: Error) => void
): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/resources/generate/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`[${res.status}] ${text || res.statusText}`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error("no response body");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split(/\r?\n\r?\n/);
      buffer = parts.pop() || "";

      for (const part of parts) {
        const lines = part.split(/\r?\n/);
        let eventType = "";
        const dataLines: string[] = [];

        for (const line of lines) {
          if (line.startsWith("event: ")) eventType = line.slice(7);
          else if (line.startsWith("data: ")) dataLines.push(line.slice(6));
        }

        if (!eventType || dataLines.length === 0) continue;
        const parsed = JSON.parse(dataLines.join("\n")) as Record<string, unknown>;
        onEvent({ type: eventType as ResourceEventType, ...parsed } as ResourceStreamEvent);
      }
    }
  } catch (err) {
    onError(err instanceof Error ? err : new Error(String(err)));
  }
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function chatStream(
  message: string,
  sessionId: string | null,
  onChunk: (text: string) => void,
  onDone: (sid: string) => void,
  onError: (err: Error) => void
): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, session_id: sessionId }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`[${res.status}] ${text || res.statusText}`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error("no response body");

    const decoder = new TextDecoder();
    let buffer = "";
    let currentSid = sessionId || "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\r\n\r\n");
      buffer = parts.pop() || "";

      for (const part of parts) {
        const lines = part.split("\r\n");
        let eventType = "";
        const dataLines: string[] = [];

        for (const line of lines) {
          if (line.startsWith("event: ")) eventType = line.slice(7);
          else if (line.startsWith("data: ")) dataLines.push(line.slice(6));
        }

        const data = dataLines.join("\n");
        if (eventType === "done") currentSid = data || currentSid;
        if (eventType === "chunk" && data) onChunk(data);
      }
    }

    onDone(currentSid);
  } catch (err) {
    onError(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function healthCheck(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

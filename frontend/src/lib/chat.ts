import { API_BASE } from "./api";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  reply: string;
  extracted_fields: Record<string, string>;
}

export async function sendChatMessage(
  templateId: string,
  messages: ChatMessage[]
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ template_id: templateId, messages }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail ?? `Request failed with status ${res.status}`);
  }
  return res.json();
}

const MASTRA_URL = process.env.MASTRA_BACKEND_URL || "http://localhost:4111";

export async function callAgent(agentId: string, message: string) {
  const res = await fetch(`${MASTRA_URL}/api/agents/${agentId}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: message }],
    }),
  });
  if (!res.ok) {
    throw new Error(`Agent ${agentId} call failed: ${res.status}`);
  }
  const data = await res.json();
  console.log(`Raw response from ${agentId}:`, JSON.stringify(data, null, 2));
  return data.text ?? data.result?.text ?? data.response ?? data.message ?? "";
}

export function stripMarkdownFences(raw: string): string {
  return raw.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
}
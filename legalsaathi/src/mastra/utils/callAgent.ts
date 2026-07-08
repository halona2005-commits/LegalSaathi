const MASTRA_URL = process.env.MASTRA_BACKEND_URL || "http://localhost:4111";

export async function callAgent(
  agentId: string,
  message: string,
  retries = 3
): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${MASTRA_URL}/api/agents/${agentId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: message }],
        }),
      });

      // Handle 503 — retry after delay
      if (res.status === 503) {
        console.warn(`[callAgent] ${agentId} returned 503 — attempt ${attempt}/${retries}. Waiting 5s...`);
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 5000 * attempt));
          continue;
        }
        throw new Error(`Agent ${agentId} unavailable after ${retries} attempts`);
      }

      // Handle rate limit
      if (res.status === 429) {
        console.warn(`[callAgent] ${agentId} rate limited — attempt ${attempt}/${retries}. Waiting 10s...`);
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 10000 * attempt));
          continue;
        }
        throw new Error(`Agent ${agentId} rate limited after ${retries} attempts`);
      }

      if (!res.ok) {
        throw new Error(`Agent ${agentId} call failed: ${res.status}`);
      }

      const data = await res.json();
      console.log(`[callAgent] ${agentId} responded successfully`);
      return data.text ?? data.result?.text ?? data.response ?? data.message ?? "";

    } catch (error: any) {
      // If it's a network error and we have retries left
      if (attempt < retries && error.message?.includes('unavailable')) {
        console.warn(`[callAgent] Retrying ${agentId} in 5s...`);
        await new Promise(r => setTimeout(r, 5000));
        continue;
      }
      throw error;
    }
  }
  return "";
}

export function stripMarkdownFences(raw: string): string {
  return raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

const MASTRA_URL = process.env.MASTRA_BACKEND_URL || "http://localhost:4111";

async function callAgent(agentId: string, message: string) {
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

function stripMarkdownFences(raw: string): string {
  return raw.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return Response.json({ error: "Missing message" }, { status: 400 });
    }

    const intentRaw = await callAgent("IntentRouterAgent", message);
    const cleaned = stripMarkdownFences(intentRaw);

    let intentResult;
    try {
      intentResult = JSON.parse(cleaned);
    } catch {
      intentResult = { intent: "GENERAL_QUERY", confidence: 0, reasoning: "parse failed" };
    }

    let agentId: string;
    let reply: string;

    switch (intentResult.intent) {
      case "SCHEME_QUERY":
        agentId = "SchemeAgent";
        reply = await callAgent(agentId, message);
        break;
      case "LEGAL_QUERY":
        agentId = "LegalAgent";
        reply = await callAgent(agentId, message);
        break;
      case "DOCUMENT_QUERY":
        reply = "Document drafting (RTI, complaints) is coming soon — check back shortly!";
        agentId = "none";
        break;
      case "OUT_OF_SCOPE":
        reply = "I can only help with government schemes, legal rights, or document drafting. Please ask about one of those.";
        agentId = "none";
        break;
      default:
        reply = "Could you rephrase your question? I want to make sure I help with the right topic — schemes, legal rights, or documents.";
        agentId = "none";
    }

    return Response.json({
      reply,
      intent: intentResult.intent,
      confidence: intentResult.confidence,
      agentUsed: agentId,
    });
  } catch (err: any) {
    console.error("Chat API error:", err);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
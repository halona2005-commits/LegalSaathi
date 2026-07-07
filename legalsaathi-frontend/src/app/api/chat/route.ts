const MASTRA_URL = process.env.MASTRA_BACKEND_URL || "http://localhost:4111";
import { orchestrate } from "@/mastra/services/supervisor.service";
export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return Response.json({ error: "Missing message" }, { status: 400 });
    }

    const intentResult = await orchestrate(message);

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
        agentId = "DocumentAgent";
        reply = await callAgent(agentId, message);
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
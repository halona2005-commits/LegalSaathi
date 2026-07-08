import { callAgent, stripMarkdownFences } from "../utils/callAgent";

export async function orchestrate(message: string) {
  // Step 1: Ask the Intent Router
  const intentRaw = await callAgent("IntentRouterAgent", message);

  const cleaned = stripMarkdownFences(intentRaw);

  let intentResult;

  try {
    intentResult = JSON.parse(cleaned);
  } catch {
    intentResult = {
      intent: "GENERAL_QUERY",
      confidence: 0,
      reasoning: "parse failed",
    };
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
      agentId = "DocumentAgent";
      reply = await callAgent(agentId, message);
      break;

    case "OUT_OF_SCOPE":
      agentId = "none";
      reply =
        "I can only help with government schemes, legal rights, or document drafting. Please ask about one of those.";
      break;

    default:
      agentId = "none";
      reply =
        "Could you rephrase your question? I want to make sure I help with the right topic — schemes, legal rights, or documents.";
  }

  return {
    reply,
    agentId,
    intent: intentResult.intent,
    confidence: intentResult.confidence,
  };
}
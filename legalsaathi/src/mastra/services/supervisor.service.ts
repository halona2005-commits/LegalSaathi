import { callAgent, stripMarkdownFences } from "../utils/callAgent";
import { checkSafety, DLSA_MESSAGE } from "../safety/safety-guard";

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
      reply = "I can only help with government schemes, legal rights, or document drafting. Please ask about one of those.";
      break;
    default:
      agentId = "none";
      reply = "Could you rephrase your question? I want to make sure I help with the right topic — schemes, legal rights, or documents.";
  }

  // Step 2: Safety check — only for agent responses, not fallback messages
  let safetyResult = {
    passed: true,
    confidence: 1.0,
    blocked: false,
    isHallucination: false,
    dlsaRedirect: false,
    reason: "No safety check needed",
  };

  if (agentId !== "none") {
    safetyResult = await checkSafety(
      message,
      reply,
      "", // context — empty for now, will improve later
      intentResult.intent
    );

    // Step 3: If blocked, replace reply with DLSA message
    if (safetyResult.blocked) {
      console.log(`[SAFETY BLOCKED] intent=${intentResult.intent} reason=${safetyResult.reason}`);
      reply = DLSA_MESSAGE;
    }
  }

  // Step 4: Log everything
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    intent: intentResult.intent,
    agentId,
    intentConfidence: intentResult.confidence,
    safetyPassed: safetyResult.passed,
    safetyConfidence: safetyResult.confidence,
    safetyBlocked: safetyResult.blocked,
    isHallucination: safetyResult.isHallucination,
    safetyReason: safetyResult.reason,
  }));

  return {
    reply,
    agentId,
    intent: intentResult.intent,
    confidence: intentResult.confidence,
    safety: {
      passed: safetyResult.passed,
      confidence: safetyResult.confidence,
      blocked: safetyResult.blocked,
      reason: safetyResult.reason,
    },
  };
}

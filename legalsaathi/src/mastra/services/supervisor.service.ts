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

  return intentResult;
}
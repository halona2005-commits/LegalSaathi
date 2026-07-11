import { intentRouterAgent, IntentSchema, type IntentResult } from "./intent-router.agent";

function stripMarkdownFences(raw: string): string {
  return raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

export async function classifyIntent(userQuery: string): Promise<IntentResult> {
  const response = await intentRouterAgent.generate([
    { role: "user", content: userQuery },
  ]);

  const cleaned = stripMarkdownFences(response.text ?? "");

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`IntentRouterAgent returned non-JSON output: ${cleaned}`);
  }

  const result = IntentSchema.safeParse(parsedJson);
  if (!result.success) {
    throw new Error(
      `IntentRouterAgent output failed schema validation: ${JSON.stringify(result.error.issues)}\nRaw output: ${cleaned}`
    );
  }

  return result.data;
}

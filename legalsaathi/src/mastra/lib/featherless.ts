import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export const featherless = createOpenAICompatible({
  name: "featherless",
  apiKey: process.env.FEATHERLESS_API_KEY!,
  baseURL: "https://api.featherless.ai/v1",
});
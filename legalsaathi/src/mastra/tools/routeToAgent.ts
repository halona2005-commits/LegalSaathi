import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { orchestrate } from "../services/supervisor.service";

export const routeToAgentTool = createTool({
  id: "route-to-agent",
  description: "Routes the user's request to the appropriate LegalSaathi agent (SchemeAgent, LegalAgent, or DocumentAgent) based on intent classification, and returns the agent's response.",
  inputSchema: z.object({
    message: z.string().describe("The user's full original message"),
  }),
  outputSchema: z.object({
    reply: z.string(),
    agentId: z.string(),
    intent: z.string(),
    confidence: z.number(),
  }),
  execute: async (input) => {
    const context = (input as any).context ?? input;
    const { message } = context as { message: string };

    const result = await orchestrate(message);

    return result;
  },
});
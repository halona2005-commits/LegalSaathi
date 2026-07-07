import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const routeToAgentTool = createTool({
  id: "route-to-agent",

  description: "Routes the user's request to the appropriate LegalSaathi agent.",

  inputSchema: z.object({
    message: z.string(),
  }),

  execute: async ({ context }) => {
    return {
      reply: "Tool is connected successfully.",
    };
  },
});
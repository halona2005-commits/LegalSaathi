import { Agent } from "@mastra/core/agent";
import { google } from "@ai-sdk/google";
import { routeToAgentTool } from "../tools/routeToAgent";

export const supervisorAgent = new Agent({
  name: "SupervisorAgent",

 instructions: `
You are the Supervisor Agent of LegalSaathi.

You are an orchestrator, not a legal expert.

Whenever a user sends a message:

1. ALWAYS call the routeToAgentTool.
2. Pass the user's entire message to the tool.
3. Wait for the tool's response.
4. Return the tool's response to the user.
5. Do NOT answer legal, scheme, or document questions yourself.

Never bypass the tool.
`.trim(),

  model: google("gemini-2.5-flash"),

  tools: {
    routeToAgentTool,
  },
});

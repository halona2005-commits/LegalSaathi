import "dotenv/config";
import { classifyIntent } from "./mastra/agents/intent-router.tool-wrapper";

async function main() {
  const testQueries = [
    "Am I eligible for the PM Awas Yojana housing scheme?",
    "My neighbor took my land, what section of BNS applies?",
    "Draft an RTI application for my ration card status",
    "Namaste, kaise ho?",
    "What's the cricket score today?",
  ];

  for (const q of testQueries) {
    try {
      const result = await classifyIntent(q);
      console.log(`Query: ${q}`);
      console.log(result);
    } catch (err) {
      console.log(`Query: ${q}`);
      console.log("FAILED:", err);
    }
    console.log("---");
  }
}

main();

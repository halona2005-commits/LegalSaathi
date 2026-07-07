import "dotenv/config";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

async function main() {
  try {
    const result = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: "Say hello in one sentence.",
    });

    console.log("SUCCESS:");
    console.log(result.text);
  } catch (err) {
    console.error("ERROR:");
    console.error(err);
  }
}

main();
import "dotenv/config";
import { qdrant } from "./mastra/lib/qdrant-client";
import { embedText } from "./mastra/lib/embeddings";

async function main() {
  console.log("Embedding query...");
  const vector = await embedText("PM Awas Yojana eligibility");
  console.log("Vector length:", vector.length);

  console.log("Searching Qdrant...");
  try {
    const result = await qdrant.search("govt_schemes", {
      vector,
      limit: 3,
      with_payload: true,
    });
    console.log("SUCCESS. Results:");
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.log("SEARCH FAILED WITH ERROR:");
    console.error(err);
  }
}

main();
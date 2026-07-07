import "dotenv/config";
import { qdrant, COLLECTIONS } from "../mastra/lib/qdrant-client";

async function setupCollections() {
  for (const name of Object.values(COLLECTIONS)) {
    try {
      await qdrant.deleteCollection(name);
      console.log(`Deleted old collection "${name}"`);
    } catch {
      // didn't exist, fine
    }

    await qdrant.createCollection(name, {
      vectors: {
        size: 3072, // gemini-embedding-001 output dimension
        distance: "Cosine",
      },
    });
    console.log(`✓ Created collection "${name}" (3072-dim)`);
  }
}

setupCollections().then(() => console.log("Done."));
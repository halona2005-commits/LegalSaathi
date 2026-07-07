import "dotenv/config";
import { qdrant, COLLECTIONS } from "../mastra/lib/qdrant-client";
import { embedText } from "../mastra/lib/embeddings";
import legalSections from "./seed-data/legal-sections.json";
import govtSchemes from "./seed-data/govt-schemes.json";
import landLaws from "./seed-data/land-laws.json";
import rtiTemplates from "./seed-data/rti-templates.json";

async function ingestCollection(
  collectionName: string,
  items: Array<{ text: string; [key: string]: any }>
) {
  console.log(`Ingesting ${items.length} items into "${collectionName}"...`);

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const vector = await embedText(item.text);

    await qdrant.upsert(collectionName, {
      points: [
        {
          id: i + 1,
          vector,
          payload: item,
        },
      ],
    });

    console.log(`  [${i + 1}/${items.length}] ingested`);
  }

  console.log(`✓ Done with "${collectionName}"\n`);
}

async function main() {
  await ingestCollection(COLLECTIONS.IPC_CRPC_BNS, legalSections);
  await ingestCollection(COLLECTIONS.GOVT_SCHEMES, govtSchemes);
  await ingestCollection(COLLECTIONS.LAND_LAWS, landLaws);
  await ingestCollection(COLLECTIONS.RTI_TEMPLATES, rtiTemplates);

  console.log("All collections ingested successfully.");
}

main();
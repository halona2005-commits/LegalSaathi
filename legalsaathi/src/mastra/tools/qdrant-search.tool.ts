import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { qdrant } from "../lib/qdrant-client";
import { embedText } from "../lib/embeddings";

export const qdrantSearchTool = createTool({
  id: "qdrant-search",
  description:
    "Searches a Qdrant vector collection for relevant legal or scheme information based on semantic similarity to the query.",
  inputSchema: z.object({
    query: z.string().describe("The user's question or search text"),
    collection: z
      .enum(["ipc_crpc_bns", "govt_schemes", "land_laws", "rti_templates"])
      .describe("Which Qdrant collection to search"),
    topK: z.number().default(5).describe("Number of results to return"),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        text: z.string(),
        score: z.number(),
        metadata: z.record(z.any()).optional(),
      })
    ),
    resultCount: z.number(),
  }),
  execute: async (input) => {
    const context = (input as any).context ?? input;
    const { query, collection, topK } = context as {
      query: string;
      collection: string;
      topK: number;
    };

    if (!query || !collection) {
      return { results: [], resultCount: 0 };
    }

    const queryVector = await embedText(query);

    let searchResult;
    try {
      searchResult = await qdrant.search(collection, {
        vector: queryVector,
        limit: topK ?? 5,
        with_payload: true,
      });
    } catch (err: any) {
      if (err?.message?.includes("not found") || err?.status === 404) {
        return { results: [], resultCount: 0 };
      }
      throw err;
    }

    const results = searchResult.map((point) => ({
      text: (point.payload?.text as string) ?? "",
      score: point.score,
      metadata: point.payload ?? {},
    }));

    return { results, resultCount: results.length };
  },
});

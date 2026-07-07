import { QdrantClient } from "@qdrant/js-client-rest";

export const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL!,
  apiKey: process.env.QDRANT_API_KEY!,
});

export const COLLECTIONS = {
  IPC_CRPC_BNS: "ipc_crpc_bns",
  GOVT_SCHEMES: "govt_schemes",
  LAND_LAWS: "land_laws",
  RTI_TEMPLATES: "rti_templates",
} as const;
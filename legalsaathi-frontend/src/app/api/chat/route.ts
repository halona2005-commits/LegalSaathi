import { orchestrate } from "@/mastra/services/supervisor.service";

const MASTRA_URL =
  process.env.MASTRA_BACKEND_URL || "http://localhost:4111";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return Response.json(
        { error: "Missing message" },
        { status: 400 }
      );
    }

    const result = await orchestrate(message);

    return Response.json(result);
  } catch (err: any) {
    console.error("Chat API error:", err);

    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
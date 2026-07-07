import { NextResponse } from "next/server";

const MASTRA_URL =
  process.env.MASTRA_BACKEND_URL || "http://localhost:4111";

async function callAgent(
  agentId: string,
  message: string
): Promise<string> {
  const res = await fetch(
    `${MASTRA_URL}/api/agents/${agentId}/generate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      }),
    }
  );

  if (!res.ok) {
    const errorBody = await res.text();

    console.error(`Mastra ${agentId} Error:`);
    console.error(errorBody);

    throw new Error(errorBody);
  }

  console.log(`Status from ${agentId}: ${res.status}`);

  const data = await res.json();

  console.log(`${agentId} Full Response:`);
  console.dir(data, { depth: null });

  const text =
    data?.text ??
    data?.result?.text ??
    data?.response ??
    data?.message ??
    data?.content ??
    data?.choices?.[0]?.message?.content ??
    "";

  if (!text) {
    console.warn(`${agentId} returned no text.`);
  }

  return text;
}

function stripMarkdownFences(raw: string): string {
  return raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        {
          error: "Missing message",
        },
        {
          status: 400,
        }
      );
    }

    // ------------------------
    // Intent Router
    // ------------------------

    const intentRaw = await callAgent(
      "IntentRouterAgent",
      message
    );

    console.log("Intent Raw:", intentRaw);

    const cleaned = stripMarkdownFences(intentRaw);

    let intentResult;

    try {
      intentResult = JSON.parse(cleaned);
    } catch (err) {
      console.error("Intent parse failed:", err);

      intentResult = {
        intent: "GENERAL_QUERY",
        confidence: 0,
        reasoning: "Failed to parse JSON",
      };
    }

    let reply = "";
    let agentUsed = "none";

    switch (intentResult.intent) {
      case "SCHEME_QUERY":
        agentUsed = "SchemeAgent";
        reply = await callAgent(agentUsed, message);
        break;

      case "LEGAL_QUERY":
        agentUsed = "LegalAgent";
        reply = await callAgent(agentUsed, message);
        break;

      case "DOCUMENT_QUERY":
        agentUsed = "DocumentAgent";
        reply =
          "Document drafting (RTI, Complaint Letter, Affidavit) is coming soon.";
        break;

      case "OUT_OF_SCOPE":
        reply =
          "I can only help with Indian legal rights, government schemes, and legal document drafting.";
        break;

      default:
        reply =
          "Please rephrase your question. I can help with legal rights, government schemes, and legal documents.";
    }

    return NextResponse.json({
      reply,
      intent: intentResult.intent,
      confidence: intentResult.confidence,
      agentUsed,
    });
  } catch (err: any) {
    console.error("Chat API Error:");
    console.error(err);

    const msg = err?.message || "";

    if (
      msg.includes("Quota exceeded") ||
      msg.includes("RESOURCE_EXHAUSTED") ||
      msg.includes("429")
    ) {
      return NextResponse.json(
        {
          error:
            "Gemini API quota exceeded. Please wait about one minute and try again.",
        },
        {
          status: 429,
        }
      );
    }

    return NextResponse.json(
      {
        error: msg || "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}
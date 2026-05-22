import Anthropic from "@anthropic-ai/sdk";
import { summaryForAI } from "@/lib/mockData";

const SYSTEM_PROMPT = `You are a SaaS analytics assistant answering questions about Acme Corp's business metrics. Be concise and specific — cite real numbers, account names, and trends. Recommend a next step when relevant. Use only the data provided; do not invent figures.

Data:
${JSON.stringify(summaryForAI, null, 2)}`;

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response("ANTHROPIC_API_KEY not configured", { status: 500 });
  }

  const { question } = await req.json();
  if (!question?.trim()) {
    return new Response("No question provided", { status: 400 });
  }

  const client = new Anthropic({ apiKey });
  const stream = client.messages.stream({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: question }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

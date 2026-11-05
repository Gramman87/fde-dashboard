import type Anthropic from "@anthropic-ai/sdk";
import { sharedBudget } from "@/lib/budget";
import { createClient, MODEL, NOTICES, type Engine } from "@/lib/claude";
import { demoAnswer } from "@/lib/fallback";
import { summaryForAI } from "@/lib/mockData";

export const MAX_QUESTION_CHARS = 1000;

const SYSTEM_PROMPT = `You are a SaaS analytics assistant answering questions about Nimbus Cloud's business metrics. Be concise and specific: cite real numbers, account names, and trends. Recommend a next step when relevant. Use only the data provided; do not invent figures. Write plain text without Markdown, because the answer is displayed as plain text.

Data:
${JSON.stringify(summaryForAI, null, 2)}`;

const CUT_OFF = "\n\n(The model stopped before finishing this answer.)";

export type QueryResult = { body: ReadableStream<Uint8Array>; engine: Engine; notice: string | null };

const encoder = new TextEncoder();

function demo(question: string, notice: string): QueryResult {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(demoAnswer(question)));
      controller.close();
    },
  });
  return { body, engine: "demo", notice };
}

type StreamEvent = Anthropic.MessageStreamEvent;

const textOf = (event: StreamEvent) =>
  event.type === "content_block_delta" && event.delta.type === "text_delta" ? event.delta.text : null;

const stoppedEarly = (event: StreamEvent) =>
  event.type === "message_delta" &&
  (event.delta.stop_reason === "refusal" || event.delta.stop_reason === "max_tokens");

export async function answerQuestion(question: string): Promise<QueryResult> {
  const client = createClient();
  if (!client) return demo(question, NOTICES.noKey);
  if (!sharedBudget().tryAcquire()) return demo(question, NOTICES.overBudget);

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: question }],
  });
  const events = stream[Symbol.asyncIterator]();

  // Wait for the first text before committing to an engine. Until then, a failure or a refusal can
  // still fall back cleanly, and the response headers can say truthfully who answered.
  let firstText: string | null = null;
  try {
    while (firstText === null) {
      const { done, value } = await events.next();
      if (done) break;
      firstText = textOf(value);
    }
  } catch (err) {
    console.error("Falling back from Claude query:", err);
    return demo(question, NOTICES.unavailable);
  }
  if (firstText === null) {
    stream.abort();
    return demo(question, NOTICES.unavailable);
  }

  const start = firstText;
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(start));
    },
    async pull(controller) {
      // Keep reading until there's something to send: a pull that enqueues nothing is never
      // called again, and most stream events carry no text.
      try {
        while (true) {
          const { done, value } = await events.next();
          if (done) {
            controller.close();
            return;
          }
          const text = textOf(value) ?? (stoppedEarly(value) ? CUT_OFF : null);
          if (text) {
            controller.enqueue(encoder.encode(text));
            return;
          }
        }
      } catch (err) {
        // Text has already reached the browser, so keep it and say it's incomplete.
        console.error("Claude query stopped mid-stream:", err);
        controller.enqueue(encoder.encode(CUT_OFF));
        controller.close();
      }
    },
    cancel() {
      // The visitor left, so stop paying for tokens nobody will read.
      stream.abort();
    },
  });
  return { body, engine: "claude", notice: null };
}

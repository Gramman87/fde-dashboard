import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";

/** A local stand-in for the Messages API, so tests run the real SDK with no key and no spend. */
export type Reply =
  | { status: number }
  | { json: unknown }
  | { events: unknown[]; breakAfter?: boolean };

export class FakeAnthropic {
  readonly requests: { model: string; stream?: boolean; messages: unknown[] }[] = [];
  replies: Reply[] = [];
  disconnected = false;
  private server!: Server;

  async start(): Promise<string> {
    this.server = createServer((req, res) => {
      let raw = "";
      req.on("data", (chunk) => (raw += chunk));
      req.on("end", () => {
        this.requests.push(JSON.parse(raw));
        const reply = this.replies.length > 1 ? this.replies.shift()! : this.replies[0];
        if ("status" in reply) {
          res.writeHead(reply.status, { "content-type": "application/json" });
          res.end(JSON.stringify({ type: "error", error: { type: "api_error", message: "boom" } }));
        } else if ("json" in reply) {
          res.writeHead(200, { "content-type": "application/json" });
          res.end(JSON.stringify(reply.json));
        } else {
          res.writeHead(200, { "content-type": "text/event-stream" });
          for (const event of reply.events) {
            res.write(`event: ${(event as { type: string }).type}\ndata: ${JSON.stringify(event)}\n\n`);
          }
          // Give the text time to arrive first, as a real mid-answer failure would.
          if (reply.breakAfter) setTimeout(() => res.destroy(), 50);
          else res.end();
        }
      });
    });
    await new Promise<void>((resolve) => this.server.listen(0, "127.0.0.1", resolve));
    return `http://127.0.0.1:${(this.server.address() as AddressInfo).port}`;
  }

  stop(): Promise<void> {
    this.server.closeAllConnections();
    return new Promise((resolve) => this.server.close(() => resolve()));
  }
}

const usage = { input_tokens: 1, output_tokens: 1 };

export function textMessage(text: string, stop_reason = "end_turn") {
  return {
    id: "msg_1", type: "message", role: "assistant", model: "test", stop_sequence: null, stop_reason, usage,
    content: [{ type: "text", text }],
  };
}

const opening = [
  { type: "message_start", message: { id: "msg_1", type: "message", role: "assistant", model: "test", content: [], stop_reason: null, stop_sequence: null, usage } },
];
const openBlock = { type: "content_block_start", index: 0, content_block: { type: "text", text: "" } };
const delta = (text: string) => ({ type: "content_block_delta", index: 0, delta: { type: "text_delta", text } });
const closing = (stop_reason: string) => [
  { type: "content_block_stop", index: 0 },
  { type: "message_delta", delta: { stop_reason, stop_sequence: null }, usage: { output_tokens: 2 } },
  { type: "message_stop" },
];

export function streamOf(chunks: string[], stop_reason = "end_turn"): Reply {
  return { events: [...opening, openBlock, ...chunks.map(delta), ...closing(stop_reason)] };
}

export function refusalStream(): Reply {
  return {
    events: [
      ...opening,
      { type: "message_delta", delta: { stop_reason: "refusal", stop_sequence: null }, usage: { output_tokens: 0 } },
      { type: "message_stop" },
    ],
  };
}

export function brokenStream(chunks: string[]): Reply {
  return { events: [...opening, openBlock, ...chunks.map(delta)], breakAfter: true };
}

export function errorEventStream(chunks: string[]): Reply {
  return {
    events: [...opening, openBlock, ...chunks.map(delta), { type: "error", error: { type: "overloaded_error", message: "Overloaded" } }],
  };
}

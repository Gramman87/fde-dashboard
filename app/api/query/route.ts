import { answerQuestion, MAX_QUESTION_CHARS } from "@/lib/query";

export async function POST(req: Request) {
  let question: unknown;
  try {
    ({ question } = await req.json());
  } catch {
    return new Response("Request body must be JSON", { status: 400 });
  }
  if (typeof question !== "string" || !question.trim()) {
    return new Response("No question provided", { status: 400 });
  }
  if (question.length > MAX_QUESTION_CHARS) {
    return new Response(`Questions are limited to ${MAX_QUESTION_CHARS} characters`, { status: 400 });
  }

  const { body, engine, notice } = await answerQuestion(question.trim());
  const headers: Record<string, string> = {
    "Content-Type": "text/plain; charset=utf-8",
    "X-Engine": engine,
  };
  if (notice) headers["X-Notice"] = notice;
  return new Response(body, { headers });
}

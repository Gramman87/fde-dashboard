"use client";

import { useState, useRef } from "react";
import { MessageSquare, Send, Loader2 } from "lucide-react";

const SUGGESTIONS = [
  "Why is churn spiking?",
  "Which segment drives the most MRR?",
  "What's the DAU/MAU trend telling us?",
  "Which accounts need attention?",
];

export default function NaturalLanguageQuery() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const ask = async (q: string) => {
    if (!q.trim()) return;
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setAnswer("");

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
        signal: abortRef.current.signal,
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setAnswer((prev) => prev + decoder.decode(value));
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setAnswer("Error fetching response.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    ask(question);
  };

  return (
    <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-5">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-4 h-4 text-violet-400" />
        <h3 className="text-sm font-semibold text-gray-300">Ask Your Data</h3>
        <span className="text-xs text-gray-600">· streamed from Claude</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => { setQuestion(s); ask(s); }}
            className="text-xs bg-white/[0.04] hover:bg-violet-500/15 text-gray-400 hover:text-violet-300 border border-white/[0.06] hover:border-violet-500/30 px-3 py-1.5 rounded-full transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask anything about your metrics..."
          className="flex-1 text-sm bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500/50"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="p-2 bg-violet-600 hover:bg-violet-500 disabled:bg-white/[0.04] disabled:text-gray-700 text-white rounded-lg transition-colors"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>

      {answer && (
        <div className="mt-3 p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg">
          <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{answer}</p>
        </div>
      )}
    </div>
  );
}

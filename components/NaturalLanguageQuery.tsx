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
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-4 h-4 text-indigo-600" />
        <h3 className="text-sm font-semibold text-gray-700">Ask Your Data</h3>
        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Mock</span>
        <span className="text-xs text-gray-400" title="Keyword-matched responses — would stream from Claude API in production">· simulated</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => { setQuestion(s); ask(s); }}
            className="text-xs bg-gray-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-700 border border-gray-200 hover:border-indigo-200 px-3 py-1.5 rounded-full transition-colors"
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
          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 text-white rounded-lg transition-colors"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>

      {answer && (
        <div className="mt-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
          <p className="text-sm text-gray-700 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

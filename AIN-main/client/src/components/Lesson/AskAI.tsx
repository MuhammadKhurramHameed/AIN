import { FormEvent, useState } from "react";
import { api } from "../../api/client";
import { Button } from "../ui/Button";

export function AskAI({ lessonId }: { lessonId: string }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [notConfigured, setNotConfigured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ask(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAnswer(null);
    setNotConfigured(false);
    try {
      const r = await api.post(`/lessons/${lessonId}/ask-ai`, { question });
      setAnswer(r.data.answer);
    } catch (err) {
      const message = (err as Error).message;
      if (message.toLowerCase().includes("not configured")) setNotConfigured(true);
      else setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border-t border-slate-100 pt-4 mt-4">
      <div className="text-xs uppercase tracking-wide text-slate-400 font-medium mb-2">Ask AI about this lesson</div>
      <form onSubmit={ask} className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. Can you explain this in simpler terms?"
          className="input flex-1"
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Thinking..." : "Ask"}
        </Button>
      </form>
      {notConfigured && (
        <p className="text-sm text-slate-400 mt-2">AI isn't configured for this yet — ask your Super Admin to set up a provider in the AI Control Center.</p>
      )}
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      {answer && <p className="text-sm text-slate-700 mt-3 whitespace-pre-wrap bg-slate-50 rounded-lg p-3">{answer}</p>}
    </div>
  );
}

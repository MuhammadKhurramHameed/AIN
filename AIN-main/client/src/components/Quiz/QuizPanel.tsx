import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/client";
import { Button } from "../ui/Button";

type QuestionType = "mcq" | "multi_select" | "true_false";

interface QuizQuestionDraft {
  text: string;
  options: string[];
  correctIndex: number;
}

interface FullQuiz {
  id?: string;
  _id?: string;
  lessonId: string;
  title: string;
  passScore: number;
  questions: { text: string; options: string[]; correctIndex?: number }[];
  questionBankIds: string[];
  questionCount?: number;
  timeLimitMinutes?: number;
  maxAttempts?: number;
  randomizeOptions: boolean;
}

interface TraineeQuizMeta {
  id: string;
  title: string;
  passScore: number;
  timeLimitMinutes?: number;
  maxAttempts?: number;
  attemptsUsed: number;
  questionCount: number;
  inProgressAttemptId?: string;
}

interface AttemptQuestion {
  text: string;
  type: QuestionType;
  options: { id: string; text: string }[];
}

interface BankQuestion {
  _id: string;
  text: string;
  type: QuestionType | "short_answer";
  difficulty: string;
  status: "draft" | "approved";
}

const blankQuestion = (): QuizQuestionDraft => ({ text: "", options: ["", ""], correctIndex: 0 });

export function QuizPanel({
  lessonId,
  courseId,
  canManage,
  isTrainee,
  onPassed,
}: {
  lessonId: string;
  courseId?: string;
  canManage: boolean;
  isTrainee: boolean;
  onPassed: () => void;
}) {
  const [loading, setLoading] = useState(true);

  // authoring state
  const [existingQuiz, setExistingQuiz] = useState<FullQuiz | null>(null);
  const [title, setTitle] = useState("Lesson quiz");
  const [passScore, setPassScore] = useState(60);
  const [questions, setQuestions] = useState<QuizQuestionDraft[]>([blankQuestion()]);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<string>("");
  const [maxAttempts, setMaxAttempts] = useState<string>("");
  const [randomizeOptions, setRandomizeOptions] = useState(true);
  const [questionCount, setQuestionCount] = useState<string>("");
  const [bankQuestions, setBankQuestions] = useState<BankQuestion[]>([]);
  const [selectedBankIds, setSelectedBankIds] = useState<string[]>([]);

  // trainee state
  const [meta, setMeta] = useState<TraineeQuizMeta | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [attemptQuestions, setAttemptQuestions] = useState<AttemptQuestion[]>([]);
  const [attemptAnswers, setAttemptAnswers] = useState<string[][]>([]);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load(preserveResult = false) {
    setLoading(true);
    setError(null);
    const r = await api.get(`/quizzes?lessonId=${lessonId}`);
    if (canManage) {
      const q: FullQuiz | null = r.data.quiz;
      setExistingQuiz(q);
      if (q) {
        setTitle(q.title);
        setPassScore(q.passScore);
        setQuestions(
          q.questions.length > 0
            ? q.questions.map((qq) => ({ text: qq.text, options: qq.options, correctIndex: qq.correctIndex ?? 0 }))
            : [blankQuestion()]
        );
        setTimeLimitMinutes(q.timeLimitMinutes ? String(q.timeLimitMinutes) : "");
        setMaxAttempts(q.maxAttempts ? String(q.maxAttempts) : "");
        setRandomizeOptions(q.randomizeOptions ?? true);
        setQuestionCount(q.questionCount ? String(q.questionCount) : "");
        setSelectedBankIds((q.questionBankIds ?? []).map(String));
      }
      if (courseId) {
        const bq = await api.get(`/questions?courseId=${courseId}&limit=200`);
        setBankQuestions(bq.data.questions);
      }
    } else {
      setMeta(r.data.quiz);
      if (!preserveResult) setResult(null);
      setAttemptId(null);
      setAttemptQuestions([]);
      if (r.data.quiz?.inProgressAttemptId) {
        await resumeOrStart(r.data.quiz.id);
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      submitAttempt();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => (s === null ? null : s - 1)), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  function updateQuestion(idx: number, patch: Partial<QuizQuestionDraft>) {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  }

  function updateOption(qIdx: number, oIdx: number, value: string) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIdx ? { ...q, options: q.options.map((o, j) => (j === oIdx ? value : o)) } : q))
    );
  }

  function toggleBankQuestion(id: string) {
    setSelectedBankIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function saveQuiz() {
    await api.post("/quizzes", {
      lessonId,
      title,
      passScore,
      questions: selectedBankIds.length > 0 ? [] : questions,
      questionBankIds: selectedBankIds,
      questionCount: questionCount ? Number(questionCount) : undefined,
      timeLimitMinutes: timeLimitMinutes ? Number(timeLimitMinutes) : undefined,
      maxAttempts: maxAttempts ? Number(maxAttempts) : undefined,
      randomizeOptions,
    });
    await load();
  }

  async function resumeOrStart(quizId: string) {
    setError(null);
    setResult(null);
    try {
      const r = await api.post(`/quizzes/${quizId}/start`, {});
      setAttemptId(r.data.attemptId);
      setStartedAt(r.data.startedAt);
      setAttemptQuestions(r.data.questions);
      setAttemptAnswers(r.data.questions.map(() => []));
      if (r.data.timeLimitMinutes) {
        const elapsedSec = Math.floor((Date.now() - new Date(r.data.startedAt).getTime()) / 1000);
        setSecondsLeft(Math.max(0, r.data.timeLimitMinutes * 60 - elapsedSec));
      } else {
        setSecondsLeft(null);
      }
    } catch (e: any) {
      setError(e.message);
    }
  }

  function toggleAnswer(qIdx: number, optionId: string, type: QuestionType) {
    setAttemptAnswers((prev) =>
      prev.map((sel, i) => {
        if (i !== qIdx) return sel;
        if (type === "multi_select") {
          return sel.includes(optionId) ? sel.filter((x) => x !== optionId) : [...sel, optionId];
        }
        return [optionId];
      })
    );
  }

  async function submitAttempt() {
    if (!attemptId) return;
    setSecondsLeft(null);
    setError(null);
    try {
      const r = await api.post(`/quizzes/attempts/${attemptId}/submit`, {
        answers: attemptAnswers.map((selectedOptionIds, questionIndex) => ({ questionIndex, selectedOptionIds })),
      });
      setResult(r.data.attempt);
      setAttemptId(null);
      setAttemptQuestions([]);
      if (r.data.attempt.passed) onPassed();
      await load(true);
    } catch (e: any) {
      setError(e.message);
    }
  }

  const timeLabel = useMemo(() => {
    if (secondsLeft === null) return null;
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }, [secondsLeft]);

  if (loading) return <div className="text-sm text-slate-400">Loading quiz...</div>;

  if (canManage) {
    return (
      <div className="space-y-4 border-t border-slate-100 pt-4">
        <div className="flex gap-3 flex-wrap">
          <label className="flex-1 min-w-[160px]">
            <span className="block text-xs font-medium text-slate-500 mb-1">Quiz title</span>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="w-28">
            <span className="block text-xs font-medium text-slate-500 mb-1">Pass score %</span>
            <input type="number" className="input" value={passScore} onChange={(e) => setPassScore(Number(e.target.value))} />
          </label>
          <label className="w-32">
            <span className="block text-xs font-medium text-slate-500 mb-1">Time limit (min)</span>
            <input
              type="number"
              className="input"
              placeholder="Untimed"
              value={timeLimitMinutes}
              onChange={(e) => setTimeLimitMinutes(e.target.value)}
            />
          </label>
          <label className="w-32">
            <span className="block text-xs font-medium text-slate-500 mb-1">Max attempts</span>
            <input
              type="number"
              className="input"
              placeholder="Unlimited"
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(e.target.value)}
            />
          </label>
          <label className="flex items-center gap-2 mt-5">
            <input type="checkbox" checked={randomizeOptions} onChange={(e) => setRandomizeOptions(e.target.checked)} />
            <span className="text-xs font-medium text-slate-500">Randomize options</span>
          </label>
        </div>

        {courseId && (
          <div className="border border-slate-200 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-800">Question bank pool (optional)</span>
              <label className="w-32">
                <input
                  type="number"
                  className="input"
                  placeholder="# to draw"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(e.target.value)}
                />
              </label>
            </div>
            {bankQuestions.length === 0 ? (
              <div className="text-xs text-slate-400">
                No approved bank questions for this course yet. Add some from Question Bank, or use inline questions below.
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto space-y-1">
                {bankQuestions.map((q) => (
                  <label key={q._id} className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={selectedBankIds.includes(q._id)} onChange={() => toggleBankQuestion(q._id)} />
                    <span className="flex-1">{q.text}</span>
                    <span className="text-xs text-slate-400">
                      {q.type} · {q.difficulty} · {q.status}
                    </span>
                  </label>
                ))}
              </div>
            )}
            {selectedBankIds.length > 0 && (
              <div className="text-xs text-emerald-600">
                Using {selectedBankIds.length} bank question(s) — inline questions below will be ignored.
              </div>
            )}
          </div>
        )}

        {selectedBankIds.length === 0 &&
          questions.map((q, qIdx) => (
            <div key={qIdx} className="border border-slate-200 rounded-lg p-3 space-y-2">
              <input
                className="input"
                placeholder={`Question ${qIdx + 1}`}
                value={q.text}
                onChange={(e) => updateQuestion(qIdx, { text: e.target.value })}
              />
              {q.options.map((opt, oIdx) => (
                <div key={oIdx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${qIdx}`}
                    checked={q.correctIndex === oIdx}
                    onChange={() => updateQuestion(qIdx, { correctIndex: oIdx })}
                  />
                  <input
                    className="input flex-1"
                    placeholder={`Option ${oIdx + 1}`}
                    value={opt}
                    onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                  />
                </div>
              ))}
              <button
                type="button"
                className="text-xs text-brand-600 hover:underline"
                onClick={() => updateQuestion(qIdx, { options: [...q.options, ""] })}
              >
                + Add option
              </button>
            </div>
          ))}

        <div className="flex gap-3">
          {selectedBankIds.length === 0 && (
            <Button variant="secondary" type="button" onClick={() => setQuestions((prev) => [...prev, blankQuestion()])}>
              + Add question
            </Button>
          )}
          <Button type="button" onClick={saveQuiz}>
            Save quiz
          </Button>
        </div>
      </div>
    );
  }

  if (!meta) return <div className="text-sm text-slate-400 border-t border-slate-100 pt-4">No quiz on this lesson.</div>;

  if (attemptId) {
    return (
      <div className="space-y-4 border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-slate-900">{meta.title}</h3>
          {timeLabel && <span className="text-sm font-semibold text-amber-600">Time left: {timeLabel}</span>}
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
        {attemptQuestions.map((q, qIdx) => (
          <div key={qIdx} className="space-y-1.5">
            <div className="text-sm font-medium text-slate-800">
              {qIdx + 1}. {q.text}
            </div>
            {q.options.map((opt) => (
              <label key={opt.id} className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type={q.type === "multi_select" ? "checkbox" : "radio"}
                  name={`take-${qIdx}`}
                  checked={attemptAnswers[qIdx]?.includes(opt.id) ?? false}
                  onChange={() => toggleAnswer(qIdx, opt.id, q.type)}
                />
                {opt.text}
              </label>
            ))}
          </div>
        ))}
        <Button type="button" onClick={submitAttempt}>
          Submit answers
        </Button>
      </div>
    );
  }

  const attemptsExhausted = !!meta.maxAttempts && meta.attemptsUsed >= meta.maxAttempts;

  return (
    <div className="space-y-3 border-t border-slate-100 pt-4">
      <h3 className="font-medium text-slate-900">{meta.title}</h3>
      <div className="text-sm text-slate-600">
        {meta.questionCount} question(s) · pass score {meta.passScore}%
        {meta.timeLimitMinutes ? ` · ${meta.timeLimitMinutes} min limit` : ""}
        {meta.maxAttempts ? ` · attempt ${meta.attemptsUsed}/${meta.maxAttempts}` : ""}
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      {result && (
        <div className={`text-sm font-medium ${result.passed ? "text-emerald-600" : "text-red-600"}`}>
          Last score: {result.score}% — {result.passed ? "Passed" : "Not passed"}
        </div>
      )}
      {isTrainee &&
        (attemptsExhausted ? (
          <div className="text-sm text-red-600">You've used all your attempts for this quiz.</div>
        ) : (
          <Button type="button" onClick={() => resumeOrStart(meta.id)}>
            {result ? "Retake quiz" : "Start quiz"}
          </Button>
        ))}
    </div>
  );
}

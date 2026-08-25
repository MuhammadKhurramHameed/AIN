import { FormEvent, useEffect, useRef, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Card, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Pagination, PaginationMeta } from "../../components/ui/Pagination";
import { BulkImportModal, BulkImportSummary } from "../../components/ui/BulkImportModal";
import { ExportLink } from "../../components/ui/ExportLink";
import { Course } from "../../types";

const QUESTION_IMPORT_TEMPLATE = `course,text,type,options,correctAnswers,difficulty,bloomLevel,tags,status
Applied Python for AI,What does AI stand for?,mcq,Artificial Intelligence|Automated Input|Analog Interface,Artificial Intelligence,easy,remember,basics,approved
Applied Python for AI,Which are programming languages?,multi_select,Python|HTML|JavaScript,Python|JavaScript,medium,understand,programming,approved
Applied Python for AI,The sky is blue.,true_false,,True,easy,remember,,approved`;

type QuestionType = "mcq" | "multi_select" | "true_false" | "short_answer";

interface Question {
  _id: string;
  courseId: string;
  text: string;
  type: QuestionType;
  options: { id: string; text: string }[];
  correctOptionIds: string[];
  sampleAnswer?: string;
  difficulty: "easy" | "medium" | "hard";
  bloomLevel: string;
  tags: string[];
  status: "draft" | "approved";
}

const MANAGE_ROLES = ["super_admin", "moitt_staff", "content_admin"];

const blankForm = () => ({
  courseId: "",
  text: "",
  type: "mcq" as QuestionType,
  options: ["", ""],
  correctIndexes: [] as number[],
  sampleAnswer: "",
  difficulty: "medium" as "easy" | "medium" | "hard",
  bloomLevel: "understand",
  tags: "",
  status: "approved" as "draft" | "approved",
});

export default function QuestionBank() {
  const { user } = useAuth();
  const canManage = !!user && MANAGE_ROLES.includes(user.role);

  const PAGE_SIZE = 25;

  const [courses, setCourses] = useState<Course[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, pageSize: PAGE_SIZE, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [filterCourse, setFilterCourse] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(blankForm());
  const [error, setError] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);

  async function loadCourses() {
    const r = await api.get("/courses");
    setCourses(r.data.courses);
  }

  function buildListParams(includePagination: boolean) {
    const params = new URLSearchParams();
    if (includePagination) {
      params.set("page", String(page));
      params.set("limit", String(PAGE_SIZE));
    }
    if (filterCourse) params.set("courseId", filterCourse);
    if (filterDifficulty) params.set("difficulty", filterDifficulty);
    if (search.trim()) params.set("q", search.trim());
    return params;
  }

  async function loadQuestions() {
    const r = await api.get(`/questions?${buildListParams(true).toString()}`);
    setQuestions(r.data.questions);
    setMeta({ total: r.data.total, page: r.data.page, pageSize: r.data.pageSize, totalPages: r.data.totalPages });
  }

  async function importQuestions(rows: Record<string, string>[]): Promise<BulkImportSummary> {
    const r = await api.post("/questions/bulk", { questions: rows });
    return r.data;
  }

  useEffect(() => {
    loadCourses();
  }, []);

  const filterKey = `${filterCourse}|${filterDifficulty}|${search}`;
  const prevFilterKey = useRef(filterKey);

  useEffect(() => {
    const filtersChanged = prevFilterKey.current !== filterKey;
    prevFilterKey.current = filterKey;
    if (filtersChanged && page !== 1) {
      setPage(1); // triggers this same effect again with page=1, which then actually fetches
      return;
    }
    const t = setTimeout(loadQuestions, filtersChanged ? 300 : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterKey]);

  function updateOption(idx: number, value: string) {
    setForm((f) => ({ ...f, options: f.options.map((o, i) => (i === idx ? value : o)) }));
  }

  function toggleCorrect(idx: number) {
    setForm((f) => {
      if (f.type === "mcq" || f.type === "true_false") return { ...f, correctIndexes: [idx] };
      const has = f.correctIndexes.includes(idx);
      return { ...f, correctIndexes: has ? f.correctIndexes.filter((i) => i !== idx) : [...f.correctIndexes, idx] };
    });
  }

  async function createQuestion(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const options =
        form.type === "true_false"
          ? [
              { text: "True" },
              { text: "False" },
            ]
          : form.type === "short_answer"
          ? []
          : form.options.filter((o) => o.trim().length > 0).map((text) => ({ text }));

      await api.post("/questions", {
        courseId: form.courseId,
        text: form.text,
        type: form.type,
        options,
        correctOptionIds: form.type === "short_answer" ? [] : form.correctIndexes.map(String),
        sampleAnswer: form.sampleAnswer || undefined,
        difficulty: form.difficulty,
        bloomLevel: form.bloomLevel,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        status: form.status,
      });
      setForm(blankForm());
      await loadQuestions();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function toggleStatus(q: Question) {
    await api.patch(`/questions/${q._id}`, { status: q.status === "approved" ? "draft" : "approved" });
    await loadQuestions();
  }

  async function remove(q: Question) {
    await api.delete(`/questions/${q._id}`);
    await loadQuestions();
  }

  const courseName = (id: string) => courses.find((c) => c._id === id)?.title ?? id;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Question Bank</h1>
        <p className="text-slate-500 text-sm mt-1">
          Author reusable, approvable exam questions per course. Quizzes can draw a randomized pool from here instead of
          (or alongside) inline questions, enabling real exam security — server-side timing, attempt limits, and
          tamper-resistant grading.
        </p>
      </div>

      {canManage && (
        <Card>
          <CardHeader title="Add a question" />
          <form onSubmit={createQuestion} className="p-5 space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <label className="block">
                <span className="block text-sm font-medium text-slate-700 mb-1">Course</span>
                <select required className="input" value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}>
                  <option value="">Select course...</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="block text-sm font-medium text-slate-700 mb-1">Type</span>
                <select
                  className="input"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as QuestionType, correctIndexes: [] })}
                >
                  <option value="mcq">Multiple choice (single answer)</option>
                  <option value="multi_select">Multiple choice (multi-select)</option>
                  <option value="true_false">True / False</option>
                  <option value="short_answer">Short answer (manually reviewed)</option>
                </select>
              </label>
              <label className="block">
                <span className="block text-sm font-medium text-slate-700 mb-1">Difficulty</span>
                <select className="input" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value as any })}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1">Question text</span>
              <textarea
                required
                className="input"
                rows={2}
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
              />
            </label>

            {form.type === "short_answer" ? (
              <label className="block">
                <span className="block text-sm font-medium text-slate-700 mb-1">Sample answer (for reviewer reference)</span>
                <input className="input" value={form.sampleAnswer} onChange={(e) => setForm({ ...form, sampleAnswer: e.target.value })} />
              </label>
            ) : form.type === "true_false" ? (
              <div className="flex gap-4">
                {["True", "False"].map((opt, idx) => (
                  <label key={opt} className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="radio" name="tf-correct" checked={form.correctIndexes.includes(idx)} onChange={() => toggleCorrect(idx)} />
                    {opt}
                  </label>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <span className="block text-sm font-medium text-slate-700">Options (check correct answer{form.type === "multi_select" ? "s" : ""})</span>
                {form.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type={form.type === "multi_select" ? "checkbox" : "radio"}
                      name="mcq-correct"
                      checked={form.correctIndexes.includes(idx)}
                      onChange={() => toggleCorrect(idx)}
                    />
                    <input className="input flex-1" placeholder={`Option ${idx + 1}`} value={opt} onChange={(e) => updateOption(idx, e.target.value)} />
                  </div>
                ))}
                <button
                  type="button"
                  className="text-xs text-brand-600 hover:underline"
                  onClick={() => setForm((f) => ({ ...f, options: [...f.options, ""] }))}
                >
                  + Add option
                </button>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-4">
              <label className="block">
                <span className="block text-sm font-medium text-slate-700 mb-1">Bloom level</span>
                <select className="input" value={form.bloomLevel} onChange={(e) => setForm({ ...form, bloomLevel: e.target.value })}>
                  {["remember", "understand", "apply", "analyze", "evaluate", "create"].map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block md:col-span-2">
                <span className="block text-sm font-medium text-slate-700 mb-1">Tags (comma separated)</span>
                <input className="input" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
              </label>
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit">Add question</Button>
              {error && <span className="text-sm text-red-600">{error}</span>}
            </div>
          </form>
        </Card>
      )}

      <Card>
        <CardHeader
          title="Bank"
          subtitle={`${meta.total.toLocaleString()} question${meta.total === 1 ? "" : "s"}`}
          action={
            canManage && (
              <div className="flex gap-2 shrink-0">
                <Button variant="secondary" onClick={() => setShowImport(true)}>
                  Import CSV
                </Button>
                <ExportLink href={`/api/questions/export?${buildListParams(false).toString()}`} />
              </div>
            )
          }
        />
        <div className="p-5 flex gap-3 flex-wrap border-b border-slate-100">
          <input
            className="input max-w-xs"
            placeholder="Search question text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="input" value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)}>
            <option value="">All courses</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </select>
          <select className="input" value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)}>
            <option value="">All difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div className="divide-y divide-slate-100">
          {questions.map((q) => (
            <div key={q._id} className="p-4 flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-slate-800">{q.text}</div>
                <div className="text-xs text-slate-400 mt-1">
                  {courseName(q.courseId)} · {q.type} · {q.difficulty} · {q.bloomLevel}
                  {q.tags.length > 0 && ` · ${q.tags.join(", ")}`}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge text={q.status} />
                {canManage && (
                  <>
                    <Button variant="secondary" onClick={() => toggleStatus(q)}>
                      {q.status === "approved" ? "Unapprove" : "Approve"}
                    </Button>
                    <Button variant="secondary" onClick={() => remove(q)}>
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
          {questions.length === 0 && <p className="p-5 text-sm text-slate-400">No questions match these filters.</p>}
        </div>
        <Pagination meta={meta} onPageChange={setPage} />
      </Card>

      {showImport && (
        <BulkImportModal
          title="Bulk import questions"
          description={`Upload a CSV to add many questions at once. "course" accepts either a course title or id. For mcq/multi_select, pipe-separate "options" and "correctAnswers" (answers must match option text exactly). For true_false, leave "options" blank and set "correctAnswers" to True or False.`}
          templateFilename="questions-import-template.csv"
          templateCsv={QUESTION_IMPORT_TEMPLATE}
          onImport={importQuestions}
          onClose={() => setShowImport(false)}
          onImported={loadQuestions}
        />
      )}
    </div>
  );
}

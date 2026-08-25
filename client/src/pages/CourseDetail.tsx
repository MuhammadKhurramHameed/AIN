import { FormEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Card, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { QuizPanel } from "../components/Quiz/QuizPanel";
import { AskAI } from "../components/Lesson/AskAI";
import { Course, Enrollment, Lesson } from "../types";

const CAN_MANAGE: Record<string, boolean> = { super_admin: true, moitt_staff: true, content_admin: true };

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const canManage = !!user && CAN_MANAGE[user.role];
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<"video" | "document" | "quiz">("document");

  async function load() {
    if (!id) return;
    const [c, l] = await Promise.all([api.get(`/courses/${id}`), api.get(`/lessons?courseId=${id}`)]);
    setCourse(c.data.course);
    setLessons(l.data.lessons);
    if (user?.role === "trainee") {
      const enr = await api.get(`/enrollments?userId=${user.id}`);
      const mine = enr.data.enrollments.find((e: Enrollment) => {
        const cid = typeof e.courseId === "string" ? e.courseId : e.courseId._id;
        return cid === id;
      });
      setEnrollment(mine ?? null);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function addLesson(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    await api.post("/lessons", { courseId: id, title: newTitle, type: newType, order: lessons.length });
    setNewTitle("");
    await load();
  }

  async function markLessonComplete(lesson: Lesson) {
    if (!enrollment || lessons.length === 0) return;
    const progressPerLesson = 100 / lessons.length;
    const idx = lessons.findIndex((l) => l._id === lesson._id);
    const newProgress = Math.min(100, Math.round(progressPerLesson * (idx + 1)));
    const res = await api.patch(`/enrollments/${enrollment._id}/progress`, { progress: newProgress });
    setEnrollment(res.data.enrollment);
  }

  if (!course) return <div className="text-slate-400">Loading...</div>;
  const track = typeof course.trackId === "string" ? null : course.trackId;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs text-slate-400">{track?.name}</div>
        <h1 className="text-2xl font-semibold text-slate-900">{course.title}</h1>
        <p className="text-slate-500 text-sm mt-1">{course.description}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader title="Lessons" />
          <div className="divide-y divide-slate-50">
            {lessons.map((l) => (
              <button
                key={l._id}
                onClick={() => setActiveLesson(l)}
                className={`w-full text-left px-5 py-3 text-sm hover:bg-slate-50 ${activeLesson?._id === l._id ? "bg-brand-50" : ""}`}
              >
                <div className="font-medium">{l.title}</div>
                <div className="text-xs text-slate-400 capitalize">{l.type}</div>
              </button>
            ))}
            {lessons.length === 0 && <div className="px-5 py-6 text-center text-slate-400 text-sm">No lessons yet.</div>}
          </div>
          {canManage && (
            <form onSubmit={addLesson} className="p-4 border-t border-slate-100 space-y-2">
              <input
                required
                placeholder="Lesson title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="input"
              />
              <select value={newType} onChange={(e) => setNewType(e.target.value as typeof newType)} className="input">
                <option value="document">Document</option>
                <option value="video">Video</option>
                <option value="quiz">Quiz</option>
              </select>
              <Button type="submit" className="w-full">
                Add lesson
              </Button>
            </form>
          )}
        </Card>

        <Card className="md:col-span-2 p-6">
          {activeLesson ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">{activeLesson.title}</h2>
              {activeLesson.type === "video" && activeLesson.url && (
                <div className="text-sm text-slate-500">Video link: {activeLesson.url}</div>
              )}
              {activeLesson.content && <p className="text-slate-700 text-sm whitespace-pre-wrap">{activeLesson.content}</p>}
              {activeLesson.type === "quiz" ? (
                <QuizPanel
                  lessonId={activeLesson._id}
                  courseId={id}
                  canManage={canManage}
                  isTrainee={user?.role === "trainee"}
                  onPassed={() => markLessonComplete(activeLesson)}
                />
              ) : (
                enrollment && (
                  <Button variant="secondary" onClick={() => markLessonComplete(activeLesson)}>
                    Mark as complete
                  </Button>
                )
              )}
              {user?.role === "trainee" && <AskAI lessonId={activeLesson._id} />}
            </div>
          ) : (
            <div className="text-slate-400 text-sm">Select a lesson to view its content.</div>
          )}
        </Card>
      </div>
    </div>
  );
}

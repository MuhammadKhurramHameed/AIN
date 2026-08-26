import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Card, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Course, Track } from "../types";

const CAN_MANAGE: Record<string, boolean> = {
  super_admin: true,
  moitt_staff: true,
  content_admin: true,
};

export default function Courses() {
  const { user } = useAuth();
  const canManage = !!user && CAN_MANAGE[user.role];
  const [tracks, setTracks] = useState<Track[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
  const [title, setTitle] = useState("");
  const [trackId, setTrackId] = useState("");
  const [level, setLevel] = useState<"level_1" | "level_2" | "level_3">("level_1");
  const [error, setError] = useState<string | null>(null);

  async function loadCourses() {
    const r = await api.get("/courses");
    setCourses(r.data.courses);
  }

  useEffect(() => {
    api.get("/tracks").then((r) => setTracks(r.data.tracks));
    loadCourses();
    if (user?.role === "trainee") {
      api.get("/enrollments").then((r) => setEnrolledIds(new Set(r.data.enrollments.map((e: any) => (typeof e.courseId === "string" ? e.courseId : e.courseId._id)))));
    }
  }, [user?.role]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/courses", { title, trackId, level });
      setTitle("");
      setTrackId("");
      await loadCourses();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function togglePublish(course: Course) {
    const status = course.status === "published" ? "draft" : "published";
    await api.patch(`/courses/${course._id}`, { status });
    await loadCourses();
  }

  async function enroll(courseId: string) {
    await api.post("/enrollments", { courseId });
    setEnrolledIds(new Set([...enrolledIds, courseId]));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Tracks & Courses</h1>
        <p className="text-slate-500 text-sm mt-1">
          {tracks.length} tracks covering the programme's participant categories.
        </p>
      </div>

      {canManage && (
        <Card>
          <CardHeader title="Add a course" />
          <form onSubmit={onCreate} className="p-5 grid md:grid-cols-4 gap-4 items-end">
            <label className="block md:col-span-2">
              <span className="block text-sm font-medium text-slate-700 mb-1">Course title</span>
              <input required value={title} onChange={(e) => setTitle(e.target.value)} className="input" />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1">Track</span>
              <select required value={trackId} onChange={(e) => setTrackId(e.target.value)} className="input">
                <option value="">Select track</option>
                {tracks.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1">Level</span>
              <select value={level} onChange={(e) => setLevel(e.target.value as typeof level)} className="input">
                <option value="level_1">Level 1 — AI Literacy</option>
                <option value="level_2">Level 2 — Applied AI</option>
                <option value="level_3">Level 3 — Advanced/Professional</option>
              </select>
            </label>
            <div className="md:col-span-4">
              <Button type="submit">Create course</Button>
              {error && <span className="ml-3 text-sm text-red-600">{error}</span>}
            </div>
          </form>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {courses.map((c) => {
          const track = typeof c.trackId === "string" ? null : c.trackId;
          return (
            <Card key={c._id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <Link to={`/courses/${c._id}`} className="font-semibold text-slate-900 hover:text-brand-600">
                    {c.title}
                  </Link>
                  <div className="text-xs text-slate-400 mt-0.5">{track?.name ?? "Track"}</div>
                </div>
                <Badge text={c.status} />
              </div>
              <div className="mt-3 flex items-center gap-2">
                {user?.role === "trainee" &&
                  (enrolledIds.has(c._id) ? (
                    <span className="text-xs text-emerald-600 font-medium">Enrolled</span>
                  ) : (
                    <Button variant="secondary" onClick={() => enroll(c._id)}>
                      Enroll
                    </Button>
                  ))}
                {canManage && (
                  <Button variant="secondary" onClick={() => togglePublish(c)}>
                    {c.status === "published" ? "Unpublish" : "Publish"}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
        {courses.length === 0 && <p className="text-slate-400 text-sm">No courses yet.</p>}
      </div>
    </div>
  );
}

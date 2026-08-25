import { FormEvent, useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Card, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Cohort, AttendanceSession, Course, Enrollment } from "../types";

const CAN_MANAGE = new Set(["super_admin", "moitt_staff", "content_admin"]);

interface RosterRow {
  userId: string;
  name?: string;
  email?: string;
  status: "present" | "absent" | "late" | "excused" | null;
}

export default function Cohorts() {
  const { user } = useAuth();
  const canManage = !!user && CAN_MANAGE.has(user.role);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [tutors, setTutors] = useState<{ _id: string; name: string }[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({ courseId: "", name: "", startDate: "", endDate: "", trainerIds: [] as string[], maxSize: "" });

  const [expanded, setExpanded] = useState<string | null>(null);
  const [roster, setRoster] = useState<{ userId: string; name?: string; email?: string }[]>([]);
  const [availableTrainees, setAvailableTrainees] = useState<{ userId: string; name?: string; email?: string }[]>([]);
  const [availableTraineesTotal, setAvailableTraineesTotal] = useState(0);
  const [traineeSearch, setTraineeSearch] = useState("");
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [newSessionDate, setNewSessionDate] = useState("");
  const [newSessionTopic, setNewSessionTopic] = useState("");
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  const [sessionRoster, setSessionRoster] = useState<RosterRow[]>([]);
  const [summary, setSummary] = useState<{ name: string; present: number; total: number; attendancePct: number }[]>([]);

  async function loadCohorts() {
    const r = await api.get("/cohorts");
    setCohorts(r.data.cohorts);
  }

  useEffect(() => {
    loadCohorts();
    if (canManage) {
      api.get("/courses").then((r) => setCourses(r.data.courses));
      api.get("/users?role=tutor&limit=500").then((r) => setTutors(r.data.users));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createCohort(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setWarnings([]);
    try {
      const r = await api.post("/cohorts", {
        courseId: form.courseId,
        name: form.name,
        startDate: form.startDate,
        endDate: form.endDate,
        trainerIds: form.trainerIds,
        maxSize: form.maxSize ? Number(form.maxSize) : undefined,
      });
      setWarnings(r.data.warnings ?? []);
      setForm({ courseId: "", name: "", startDate: "", endDate: "", trainerIds: [], maxSize: "" });
      await loadCohorts();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function refreshAvailableTrainees(cohort: Cohort, inCohortIds: Set<string>, q = "") {
    const courseId = typeof cohort.courseId === "string" ? cohort.courseId : cohort.courseId._id;
    const params = new URLSearchParams({ courseId, limit: "50" });
    if (q.trim()) params.set("q", q.trim());
    const enrRes = await api.get(`/enrollments?${params.toString()}`);
    setAvailableTraineesTotal(enrRes.data.total);
    setAvailableTrainees(
      enrRes.data.enrollments
        .filter((e: Enrollment & { userId: { _id: string; name: string; email: string } }) => !inCohortIds.has(e.userId._id))
        .map((e: Enrollment & { userId: { _id: string; name: string; email: string } }) => ({ userId: e.userId._id, name: e.userId.name, email: e.userId.email }))
    );
  }

  async function expand(cohort: Cohort) {
    if (expanded === cohort._id) {
      setExpanded(null);
      setActiveSession(null);
      return;
    }
    setExpanded(cohort._id);
    setActiveSession(null);
    setTraineeSearch("");
    const [rosterRes, sessionsRes, summaryRes] = await Promise.all([
      api.get(`/cohorts/${cohort._id}/trainees`),
      api.get(`/attendance/sessions?cohortId=${cohort._id}`),
      api.get(`/attendance/cohorts/${cohort._id}/summary`),
    ]);
    setRoster(
      rosterRes.data.enrollments.map((e: Enrollment & { userId: { _id: string; name: string; email: string } }) => ({
        userId: e.userId._id,
        name: e.userId.name,
        email: e.userId.email,
      }))
    );
    setSessions(sessionsRes.data.sessions);
    setSummary(summaryRes.data.data);

    if (canManage) {
      const inCohort = new Set<string>(rosterRes.data.enrollments.map((e: Enrollment & { userId: { _id: string } }) => e.userId._id));
      await refreshAvailableTrainees(cohort, inCohort);
    }
  }

  async function addTrainee(cohort: Cohort, userId: string) {
    await api.post(`/cohorts/${cohort._id}/trainees`, { userIds: [userId] });
    const rosterRes = await api.get(`/cohorts/${cohort._id}/trainees`);
    setRoster(rosterRes.data.enrollments.map((e: Enrollment & { userId: { _id: string; name: string; email: string } }) => ({ userId: e.userId._id, name: e.userId.name, email: e.userId.email })));
    const inCohort = new Set<string>(rosterRes.data.enrollments.map((e: Enrollment & { userId: { _id: string } }) => e.userId._id));
    await refreshAvailableTrainees(cohort, inCohort, traineeSearch);
  }

  useEffect(() => {
    if (!expanded) return;
    const cohort = cohorts.find((c) => c._id === expanded);
    if (!cohort || !canManage) return;
    const inCohort = new Set(roster.map((r) => r.userId));
    const t = setTimeout(() => refreshAvailableTrainees(cohort, inCohort, traineeSearch), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [traineeSearch]);

  async function addSession(cohort: Cohort, e: FormEvent) {
    e.preventDefault();
    await api.post("/attendance/sessions", { cohortId: cohort._id, date: newSessionDate, topic: newSessionTopic || undefined });
    setNewSessionDate("");
    setNewSessionTopic("");
    const r = await api.get(`/attendance/sessions?cohortId=${cohort._id}`);
    setSessions(r.data.sessions);
  }

  async function openSession(session: AttendanceSession) {
    setActiveSession(session);
    const r = await api.get(`/attendance/sessions/${session._id}/records`);
    setSessionRoster(r.data.roster);
  }

  function setRowStatus(userId: string, status: RosterRow["status"]) {
    setSessionRoster((prev) => prev.map((r) => (r.userId === userId ? { ...r, status } : r)));
  }

  async function saveAttendance() {
    if (!activeSession) return;
    const records = sessionRoster.filter((r) => r.status).map((r) => ({ userId: r.userId, status: r.status as string }));
    await api.post(`/attendance/sessions/${activeSession._id}/mark`, { records });
    if (expanded) {
      const cohort = cohorts.find((c) => c._id === expanded);
      if (cohort) {
        const r = await api.get(`/attendance/cohorts/${cohort._id}/summary`);
        setSummary(r.data.data);
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Cohorts & Attendance</h1>
        <p className="text-slate-500 text-sm mt-1">
          {canManage ? "Batches of trainees on a schedule, with assigned trainers and attendance tracking." : "Your assigned cohorts and attendance."}
        </p>
      </div>

      {canManage && (
        <Card>
          <CardHeader title="Create a cohort" />
          <form onSubmit={createCohort} className="p-5 grid md:grid-cols-3 gap-4">
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1">Course</span>
              <select required value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} className="input">
                <option value="">Select course</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1">Cohort name</span>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="e.g. Batch 1 — Lahore" />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1">Max size (optional)</span>
              <input type="number" value={form.maxSize} onChange={(e) => setForm({ ...form, maxSize: e.target.value })} className="input" />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1">Start date</span>
              <input required type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="input" />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1">End date</span>
              <input required type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="input" />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1">Trainers</span>
              <select
                multiple
                value={form.trainerIds}
                onChange={(e) => setForm({ ...form, trainerIds: Array.from(e.target.selectedOptions).map((o) => o.value) })}
                className="input h-24"
              >
                {tutors.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="md:col-span-3">
              <Button type="submit">Create cohort</Button>
              {error && <span className="ml-3 text-sm text-red-600">{error}</span>}
            </div>
            {warnings.length > 0 && (
              <div className="md:col-span-3 bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1">
                {warnings.map((w) => (
                  <p key={w} className="text-xs text-amber-700">
                    ⚠ {w}
                  </p>
                ))}
              </div>
            )}
          </form>
        </Card>
      )}

      <div className="space-y-3">
        {cohorts.map((c) => {
          const course = typeof c.courseId === "string" ? null : c.courseId;
          return (
            <Card key={c._id}>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">
                    {c.name} <span className="text-slate-400 font-normal">— {course?.title}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {new Date(c.startDate).toLocaleDateString()} – {new Date(c.endDate).toLocaleDateString()} · Trainers: {c.trainerIds.map((t) => t.name).join(", ") || "none assigned"}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge text={c.status} />
                  <Button variant="secondary" onClick={() => expand(c)}>
                    {expanded === c._id ? "Collapse" : "Open"}
                  </Button>
                </div>
              </div>

              {expanded === c._id && (
                <div className="border-t border-slate-100 p-4 space-y-5">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400 font-medium mb-1.5">Trainees ({roster.length})</div>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {roster.map((r) => (
                        <div key={r.userId} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                          {r.name}
                        </div>
                      ))}
                      {roster.length === 0 && <p className="text-sm text-slate-400 col-span-full">No trainees added yet.</p>}
                    </div>
                    {canManage && (
                      <div className="mt-2 space-y-1.5">
                        <input
                          className="input"
                          placeholder="Search enrolled trainees by name or email..."
                          value={traineeSearch}
                          onChange={(e) => setTraineeSearch(e.target.value)}
                        />
                        {availableTrainees.length > 0 ? (
                          <>
                            <select
                              className="input"
                              onChange={(e) => {
                                if (e.target.value) addTrainee(c, e.target.value);
                                e.target.value = "";
                              }}
                              defaultValue=""
                            >
                              <option value="">+ Add trainee already enrolled in this course</option>
                              {availableTrainees.map((t) => (
                                <option key={t.userId} value={t.userId}>
                                  {t.name} ({t.email})
                                </option>
                              ))}
                            </select>
                            {availableTraineesTotal > availableTrainees.length && (
                              <p className="text-xs text-slate-400">
                                Showing {availableTrainees.length} of {availableTraineesTotal} — narrow with search to find more.
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-xs text-slate-400">
                            {traineeSearch ? "No matching enrolled trainees." : "No trainees enrolled in this course are available to add."}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400 font-medium mb-1.5">Attendance sessions</div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {sessions.map((s) => (
                        <button
                          key={s._id}
                          onClick={() => openSession(s)}
                          className={`text-xs rounded-full border px-3 py-1 ${activeSession?._id === s._id ? "bg-brand-500 text-white border-brand-500" : "border-slate-200 hover:bg-slate-50"}`}
                        >
                          {new Date(s.date).toLocaleDateString()} {s.topic ? `— ${s.topic}` : ""}
                        </button>
                      ))}
                      {sessions.length === 0 && <p className="text-sm text-slate-400">No sessions yet.</p>}
                    </div>
                    <form onSubmit={(e) => addSession(c, e)} className="flex gap-2">
                      <input required type="date" value={newSessionDate} onChange={(e) => setNewSessionDate(e.target.value)} className="input w-40" />
                      <input value={newSessionTopic} onChange={(e) => setNewSessionTopic(e.target.value)} placeholder="Topic (optional)" className="input flex-1" />
                      <Button type="submit">Add session</Button>
                    </form>
                  </div>

                  {activeSession && (
                    <div>
                      <div className="text-xs uppercase tracking-wide text-slate-400 font-medium mb-1.5">
                        Mark attendance — {new Date(activeSession.date).toLocaleDateString()}
                      </div>
                      <div className="space-y-1.5">
                        {sessionRoster.map((r) => (
                          <div key={r.userId} className="flex items-center justify-between border border-slate-100 rounded-lg px-3 py-1.5">
                            <span className="text-sm">{r.name}</span>
                            <select value={r.status ?? ""} onChange={(e) => setRowStatus(r.userId, (e.target.value || null) as RosterRow["status"])} className="input w-36">
                              <option value="">Not marked</option>
                              <option value="present">Present</option>
                              <option value="late">Late</option>
                              <option value="absent">Absent</option>
                              <option value="excused">Excused</option>
                            </select>
                          </div>
                        ))}
                      </div>
                      <Button className="mt-3" onClick={saveAttendance}>
                        Save attendance
                      </Button>
                    </div>
                  )}

                  {summary.length > 0 && (
                    <div>
                      <div className="text-xs uppercase tracking-wide text-slate-400 font-medium mb-1.5">Attendance summary</div>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                            <th className="py-1.5 font-medium">Trainee</th>
                            <th className="py-1.5 font-medium">Present/Late</th>
                            <th className="py-1.5 font-medium">Attendance %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {summary.map((s) => (
                            <tr key={s.name} className="border-b border-slate-50">
                              <td className="py-1.5">{s.name}</td>
                              <td className="py-1.5 tabular-nums">
                                {s.present}/{s.total}
                              </td>
                              <td className="py-1.5 tabular-nums">{s.attendancePct}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
        {cohorts.length === 0 && <p className="text-slate-400 text-sm">No cohorts yet.</p>}
      </div>
    </div>
  );
}

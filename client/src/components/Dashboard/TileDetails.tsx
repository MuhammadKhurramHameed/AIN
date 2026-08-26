import { useEffect, useState } from "react";
import { api } from "../../api/client";

function Loading() {
  return <div className="text-sm text-slate-400">Loading breakdown...</div>;
}

function Empty({ text = "No data yet." }: { text?: string }) {
  return <div className="text-sm text-slate-400">{text}</div>;
}

export function SimpleBreakdownTable({ rows, keyLabel, valueLabel }: { rows: { label: string; value: number }[]; keyLabel: string; valueLabel: string }) {
  if (rows.length === 0) return <Empty />;
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
          <th className="py-1.5 font-medium">{keyLabel}</th>
          <th className="py-1.5 font-medium">{valueLabel}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.label} className="border-b border-slate-50">
            <td className="py-1.5">{r.label}</td>
            <td className="py-1.5 tabular-nums">{r.value.toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function tileQuery(tile: string, programmeId?: string) {
  const params = new URLSearchParams({ tile });
  if (programmeId) params.set("programmeId", programmeId);
  return `/dashboard/tile-detail?${params.toString()}`;
}

export function TutorBreakdown({ programmeId }: { programmeId?: string }) {
  const [rows, setRows] = useState<{ track: string; tutors: number }[] | null>(null);
  useEffect(() => {
    setRows(null);
    api.get(tileQuery("tutors", programmeId)).then((r) => setRows(r.data.data));
  }, [programmeId]);
  if (!rows) return <Loading />;
  return <SimpleBreakdownTable rows={rows.map((r) => ({ label: r.track, value: r.tutors }))} keyLabel="Track" valueLabel="Tutors" />;
}

export function EngagementBreakdown({ metric, programmeId }: { metric: "activeToday" | "newEnrollments"; programmeId?: string }) {
  const [data, setData] = useState<{ activeTodayByTrack: { track: string; count: number }[]; newEnrollmentsByTrack: { track: string; count: number }[] } | null>(null);
  useEffect(() => {
    setData(null);
    api.get(tileQuery("engagement", programmeId)).then((r) => setData(r.data));
  }, [programmeId]);
  if (!data) return <Loading />;
  const rows = metric === "activeToday" ? data.activeTodayByTrack : data.newEnrollmentsByTrack;
  return <SimpleBreakdownTable rows={rows.map((r) => ({ label: r.track, value: r.count }))} keyLabel="Track" valueLabel={metric === "activeToday" ? "Updates today" : "New enrollments"} />;
}

export function QuizBreakdown({ programmeId }: { programmeId?: string }) {
  const [rows, setRows] = useState<{ quiz: string; course: string; attempts: number; passRate: number }[] | null>(null);
  useEffect(() => {
    setRows(null);
    api.get(tileQuery("quiz", programmeId)).then((r) => setRows(r.data.data));
  }, [programmeId]);
  if (!rows) return <Loading />;
  if (rows.length === 0) return <Empty text="No quiz attempts recorded yet." />;
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
          <th className="py-1.5 font-medium">Quiz</th>
          <th className="py-1.5 font-medium">Course</th>
          <th className="py-1.5 font-medium">Attempts</th>
          <th className="py-1.5 font-medium">Pass rate</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.quiz + r.course} className="border-b border-slate-50">
            <td className="py-1.5">{r.quiz}</td>
            <td className="py-1.5 text-slate-500">{r.course}</td>
            <td className="py-1.5 tabular-nums">{r.attempts}</td>
            <td className="py-1.5 tabular-nums">{r.passRate}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function KanbanBreakdown({ metric }: { metric: "open" | "done" }) {
  const [rows, setRows] = useState<{ assignee: string; open: number; done: number }[] | null>(null);
  useEffect(() => {
    api.get("/dashboard/tile-detail?tile=kanban").then((r) => setRows(r.data.data));
  }, []);
  if (!rows) return <Loading />;
  const filtered = rows.filter((r) => r[metric] > 0);
  return (
    <SimpleBreakdownTable
      rows={filtered.map((r) => ({ label: r.assignee, value: r[metric] }))}
      keyLabel="Assignee"
      valueLabel={metric === "open" ? "Open tasks" : "Tasks done"}
    />
  );
}

export function ReportsPendingList() {
  const [reports, setReports] = useState<{ _id: string; period: string; partnerId: { name: string } | string; narrative?: string }[] | null>(null);
  useEffect(() => {
    api.get("/reports").then((r) => setReports(r.data.reports.filter((rep: { status: string }) => rep.status === "submitted")));
  }, []);
  if (!reports) return <Loading />;
  if (reports.length === 0) return <Empty text="Nothing pending — all caught up." />;
  return (
    <div className="space-y-2">
      {reports.map((r) => {
        const partner = typeof r.partnerId === "string" ? null : r.partnerId;
        return (
          <div key={r._id} className="border border-slate-100 rounded-lg px-3 py-2">
            <div className="text-sm font-medium text-slate-800">
              {partner?.name ?? "Partner"} — {r.period}
            </div>
            {r.narrative && <div className="text-xs text-slate-500 mt-0.5">{r.narrative}</div>}
          </div>
        );
      })}
    </div>
  );
}

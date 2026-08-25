import { FormEvent, useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Card, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Report } from "../types";

const CAN_SUBMIT = ["consortium_partner_admin", "consortium_partner_staff"];
const CAN_REVIEW = ["super_admin", "moitt_staff"];

export default function Reports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [period, setPeriod] = useState("");
  const [enrolled, setEnrolled] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [femalePct, setFemalePct] = useState(0);
  const [dropouts, setDropouts] = useState(0);
  const [narrative, setNarrative] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const r = await api.get("/reports");
    setReports(r.data.reports);
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/reports", { period, metrics: { enrolled, completed, femalePct, dropouts }, narrative });
      setPeriod("");
      setNarrative("");
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function review(id: string) {
    await api.patch(`/reports/${id}/review`, {});
    await load();
  }

  const canSubmit = !!user && CAN_SUBMIT.includes(user.role);
  const canReview = !!user && CAN_REVIEW.includes(user.role);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Reporting</h1>
        <p className="text-slate-500 text-sm mt-1">
          {canSubmit ? "Submit periodic delivery metrics to MoITT." : "Consortium partner submissions, for MoITT review."}
        </p>
      </div>

      {canSubmit && (
        <Card>
          <CardHeader title="Submit a period report" />
          <form onSubmit={submit} className="p-5 grid md:grid-cols-3 gap-4">
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1">Period (e.g. 2026-08)</span>
              <input required value={period} onChange={(e) => setPeriod(e.target.value)} className="input" />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1">Enrolled</span>
              <input type="number" min={0} value={enrolled} onChange={(e) => setEnrolled(Number(e.target.value))} className="input" />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1">Completed</span>
              <input type="number" min={0} value={completed} onChange={(e) => setCompleted(Number(e.target.value))} className="input" />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1">% Female</span>
              <input
                type="number"
                min={0}
                max={100}
                value={femalePct}
                onChange={(e) => setFemalePct(Number(e.target.value))}
                className="input"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1">Dropouts</span>
              <input type="number" min={0} value={dropouts} onChange={(e) => setDropouts(Number(e.target.value))} className="input" />
            </label>
            <label className="block md:col-span-3">
              <span className="block text-sm font-medium text-slate-700 mb-1">Narrative</span>
              <textarea value={narrative} onChange={(e) => setNarrative(e.target.value)} className="input" rows={3} />
            </label>
            <div className="md:col-span-3">
              <Button type="submit">Submit report</Button>
              {error && <span className="ml-3 text-sm text-red-600">{error}</span>}
            </div>
          </form>
        </Card>
      )}

      <Card>
        <CardHeader title="Reports" subtitle={`${reports.length} submissions`} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-slate-400 border-b border-slate-100">
                <th className="px-5 py-2">Partner</th>
                <th className="px-5 py-2">Period</th>
                <th className="px-5 py-2">Enrolled</th>
                <th className="px-5 py-2">Completed</th>
                <th className="px-5 py-2">% Female</th>
                <th className="px-5 py-2">Status</th>
                <th className="px-5 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => {
                const partner = typeof r.partnerId === "string" ? null : r.partnerId;
                return (
                  <tr key={r._id} className="border-b border-slate-50">
                    <td className="px-5 py-2 font-medium">{partner?.name ?? "—"}</td>
                    <td className="px-5 py-2">{r.period}</td>
                    <td className="px-5 py-2">{r.metrics.enrolled}</td>
                    <td className="px-5 py-2">{r.metrics.completed}</td>
                    <td className="px-5 py-2">{r.metrics.femalePct}%</td>
                    <td className="px-5 py-2">
                      <Badge text={r.status} />
                    </td>
                    <td className="px-5 py-2 text-right">
                      {canReview && r.status !== "reviewed" && (
                        <button onClick={() => review(r._id)} className="text-xs text-brand-600 hover:underline">
                          Mark reviewed
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {reports.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-6 text-center text-slate-400">
                    No reports yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

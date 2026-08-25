import { FormEvent, useEffect, useState } from "react";
import { api } from "../../api/client";
import { Card, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

interface IntegrationRow {
  id: string;
  category: string;
  type: string;
  name: string;
  config: Record<string, unknown>;
  status: string;
  lastTestedAt?: string;
  lastError?: string;
}

const CATALOG = [
  { category: "ai", type: "ai_provider", label: "AI Providers", note: "Configured in AI Control Center", implemented: true },
  { category: "communication", type: "smtp", label: "SMTP Email", note: "Real connector — configurable below", implemented: true },
  { category: "communication", type: "sms", label: "SMS", note: "Not yet implemented", implemented: false },
  { category: "meetings", type: "zoom", label: "Zoom", note: "Not yet implemented", implemented: false },
  { category: "storage", type: "s3", label: "S3-compatible storage", note: "Not yet implemented", implemented: false },
  { category: "identity", type: "oidc", label: "SSO (OIDC/SAML)", note: "Not yet implemented", implemented: false },
  { category: "lms_interop", type: "scorm", label: "SCORM / xAPI / LTI", note: "Not yet implemented", implemented: false },
];

export default function Integrations() {
  const [integrations, setIntegrations] = useState<IntegrationRow[]>([]);
  const [form, setForm] = useState({ name: "", host: "", port: 587, secure: false, fromAddress: "", fromName: "", user: "", pass: "" });
  const [error, setError] = useState<string | null>(null);
  const [testing, setTesting] = useState<Record<string, { ok: boolean; message: string }>>({});

  async function load() {
    const r = await api.get("/integrations");
    setIntegrations(r.data.integrations);
  }

  useEffect(() => {
    load();
  }, []);

  async function createSmtp(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/integrations/smtp", {
        name: form.name,
        config: { host: form.host, port: Number(form.port), secure: form.secure, fromAddress: form.fromAddress, fromName: form.fromName || undefined },
        secrets: { user: form.user, pass: form.pass },
      });
      setForm({ name: "", host: "", port: 587, secure: false, fromAddress: "", fromName: "", user: "", pass: "" });
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function test(id: string) {
    const r = await api.post(`/integrations/${id}/test`);
    setTesting((prev) => ({ ...prev, [id]: r.data.ok ? { ok: true, message: "Connection verified" } : { ok: false, message: r.data.error } }));
    await load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Integrations</h1>
        <p className="text-slate-500 text-sm mt-1">
          Admin-controlled connectors — never exposed to learners, trainers, or ordinary staff.
        </p>
      </div>

      <Card>
        <CardHeader title="Integration catalog" subtitle="What's real today vs. what's a configurable slot for later" />
        <div className="divide-y divide-slate-50">
          {CATALOG.map((c) => (
            <div key={c.type} className="px-5 py-3 flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">{c.label}</div>
                <div className="text-xs text-slate-400">{c.note}</div>
              </div>
              <Badge text={c.implemented ? "active" : "inactive"} />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Configured SMTP integrations" />
        <form onSubmit={createSmtp} className="p-5 grid md:grid-cols-4 gap-4">
          <label className="block">
            <span className="block text-sm font-medium text-slate-700 mb-1">Name</span>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-slate-700 mb-1">SMTP host</span>
            <input required value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} className="input" placeholder="smtp.example.com" />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-slate-700 mb-1">Port</span>
            <input required type="number" value={form.port} onChange={(e) => setForm({ ...form, port: Number(e.target.value) })} className="input" />
          </label>
          <label className="flex items-center gap-2 mt-6">
            <input type="checkbox" checked={form.secure} onChange={(e) => setForm({ ...form, secure: e.target.checked })} />
            <span className="text-sm text-slate-700">Use TLS (port 465)</span>
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-slate-700 mb-1">From address</span>
            <input required type="email" value={form.fromAddress} onChange={(e) => setForm({ ...form, fromAddress: e.target.value })} className="input" />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-slate-700 mb-1">From name (optional)</span>
            <input value={form.fromName} onChange={(e) => setForm({ ...form, fromName: e.target.value })} className="input" />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-slate-700 mb-1">SMTP username</span>
            <input required value={form.user} onChange={(e) => setForm({ ...form, user: e.target.value })} className="input" />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-slate-700 mb-1">SMTP password</span>
            <input required type="password" value={form.pass} onChange={(e) => setForm({ ...form, pass: e.target.value })} className="input" />
          </label>
          <div className="md:col-span-4">
            <Button type="submit">Add SMTP integration</Button>
            {error && <span className="ml-3 text-sm text-red-600">{error}</span>}
          </div>
        </form>

        <div className="divide-y divide-slate-50">
          {integrations.map((i) => {
            const result = testing[i.id];
            return (
              <div key={i.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{i.name}</div>
                  <div className="text-xs text-slate-400">
                    {String(i.config.host)}:{String(i.config.port)}
                    {i.lastTestedAt && ` · last tested ${new Date(i.lastTestedAt).toLocaleString()}`}
                  </div>
                  {i.lastError && <div className="text-xs text-red-500 mt-0.5">{i.lastError}</div>}
                </div>
                <div className="flex items-center gap-3">
                  {result && <span className={`text-xs ${result.ok ? "text-emerald-600" : "text-red-600"}`}>{result.message}</span>}
                  <Badge text={i.status} />
                  <Button variant="secondary" onClick={() => test(i.id)}>
                    Test connection
                  </Button>
                </div>
              </div>
            );
          })}
          {integrations.length === 0 && <div className="px-5 py-6 text-center text-slate-400 text-sm">No SMTP integrations configured yet.</div>}
        </div>
      </Card>
    </div>
  );
}

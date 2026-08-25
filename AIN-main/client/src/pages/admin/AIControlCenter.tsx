import { FormEvent, useEffect, useState } from "react";
import { api } from "../../api/client";
import { Card, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

const PROVIDER_TYPES = ["openai", "azure_openai", "openai_compatible", "ollama", "anthropic"] as const;
const CAPABILITIES = ["chat", "lesson_assistant", "question_generation", "summarization", "translation"] as const;
const CAPABILITY_LABELS: Record<string, string> = {
  chat: "General chat",
  lesson_assistant: "Lesson assistant (learner-facing)",
  question_generation: "Question generation",
  summarization: "Summarization",
  translation: "Translation",
};

interface ProviderRow {
  id: string;
  name: string;
  type: string;
  baseUrl?: string;
  status: string;
  createdAt: string;
}

interface ModelRow {
  _id: string;
  providerId: { _id: string; name: string; type: string; status: string } | string;
  name: string;
  label: string;
  capabilities: string[];
  defaultForCapabilities: string[];
  status: string;
}

interface UsageSummary {
  totalRequests: number;
  requestsToday: number;
  failureRate: number;
  totalTokens: number;
  byFeature: { feature: string; requests: number; tokens: number }[];
  byProvider: { provider: string; requests: number; avgLatency: number }[];
}

export default function AIControlCenter() {
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [models, setModels] = useState<ModelRow[]>([]);
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { ok: boolean; message: string }>>({});

  const [providerForm, setProviderForm] = useState({ name: "", type: "openai" as (typeof PROVIDER_TYPES)[number], baseUrl: "", apiKey: "" });
  const [modelForm, setModelForm] = useState({
    providerId: "",
    name: "",
    label: "",
    capabilities: [] as string[],
    defaultForCapabilities: [] as string[],
  });
  const [error, setError] = useState<string | null>(null);

  async function loadAll() {
    const [p, m, u] = await Promise.all([api.get("/ai/providers"), api.get("/ai/models"), api.get("/ai/usage/summary")]);
    setProviders(p.data.providers);
    setModels(m.data.models);
    setUsage(u.data);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function createProvider(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/ai/providers", providerForm);
      setProviderForm({ name: "", type: "openai", baseUrl: "", apiKey: "" });
      await loadAll();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function createModel(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/ai/models", { ...modelForm, maxTokens: 800, temperature: 0.4 });
      setModelForm({ providerId: "", name: "", label: "", capabilities: [], defaultForCapabilities: [] });
      await loadAll();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function testModel(id: string) {
    const r = await api.post(`/ai/models/${id}/test`);
    setTestResults((prev) => ({ ...prev, [id]: r.data.ok ? { ok: true, message: `OK — ${r.data.latencyMs}ms` } : { ok: false, message: r.data.error } }));
  }

  function toggleCap(list: "capabilities" | "defaultForCapabilities", cap: string) {
    setModelForm((prev) => {
      const set = new Set(prev[list]);
      if (set.has(cap)) set.delete(cap);
      else set.add(cap);
      return { ...prev, [list]: Array.from(set) };
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">AI Control Center</h1>
        <p className="text-slate-500 text-sm mt-1">
          Provider → Model → Capability routing. No application code calls a vendor directly — every AI feature asks for a
          capability, and this configuration decides which provider/model actually serves it.
        </p>
      </div>

      {usage && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4">
            <div className="text-xs uppercase tracking-wide text-slate-400 font-medium">Total requests</div>
            <div className="text-2xl font-semibold mt-1 tabular-nums">{usage.totalRequests}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4">
            <div className="text-xs uppercase tracking-wide text-slate-400 font-medium">Today</div>
            <div className="text-2xl font-semibold mt-1 tabular-nums">{usage.requestsToday}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4">
            <div className="text-xs uppercase tracking-wide text-slate-400 font-medium">Failure rate</div>
            <div className="text-2xl font-semibold mt-1 tabular-nums">{usage.failureRate}%</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4">
            <div className="text-xs uppercase tracking-wide text-slate-400 font-medium">Total tokens</div>
            <div className="text-2xl font-semibold mt-1 tabular-nums">{usage.totalTokens.toLocaleString()}</div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader title="Providers" subtitle="OpenAI, Azure OpenAI, self-hosted/OpenAI-compatible, Ollama, or Anthropic" />
        <form onSubmit={createProvider} className="p-5 grid md:grid-cols-4 gap-4">
          <label className="block">
            <span className="block text-sm font-medium text-slate-700 mb-1">Name</span>
            <input required value={providerForm.name} onChange={(e) => setProviderForm({ ...providerForm, name: e.target.value })} className="input" />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-slate-700 mb-1">Type</span>
            <select value={providerForm.type} onChange={(e) => setProviderForm({ ...providerForm, type: e.target.value as typeof providerForm.type })} className="input">
              {PROVIDER_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-slate-700 mb-1">Base URL (optional override)</span>
            <input value={providerForm.baseUrl} onChange={(e) => setProviderForm({ ...providerForm, baseUrl: e.target.value })} className="input" placeholder="https://..." />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-slate-700 mb-1">API key</span>
            <input required type="password" value={providerForm.apiKey} onChange={(e) => setProviderForm({ ...providerForm, apiKey: e.target.value })} className="input" />
          </label>
          <div className="md:col-span-4">
            <Button type="submit">Add provider</Button>
            {error && <span className="ml-3 text-sm text-red-600">{error}</span>}
          </div>
        </form>
        <div className="divide-y divide-slate-50">
          {providers.map((p) => (
            <div key={p.id} className="px-5 py-3 flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">{p.name}</div>
                <div className="text-xs text-slate-400">
                  {p.type}
                  {p.baseUrl ? ` · ${p.baseUrl}` : ""}
                </div>
              </div>
              <Badge text={p.status} />
            </div>
          ))}
          {providers.length === 0 && <div className="px-5 py-6 text-center text-slate-400 text-sm">No providers configured yet.</div>}
        </div>
      </Card>

      <Card>
        <CardHeader title="Models & capability routing" subtitle="Each capability routes to exactly one default model" />
        <form onSubmit={createModel} className="p-5 space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1">Provider</span>
              <select required value={modelForm.providerId} onChange={(e) => setModelForm({ ...modelForm, providerId: e.target.value })} className="input">
                <option value="">Select provider</option>
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1">Model ID (sent to API)</span>
              <input required value={modelForm.name} onChange={(e) => setModelForm({ ...modelForm, name: e.target.value })} className="input" placeholder="e.g. gpt-4o-mini" />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1">Display label</span>
              <input required value={modelForm.label} onChange={(e) => setModelForm({ ...modelForm, label: e.target.value })} className="input" />
            </label>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <span className="block text-sm font-medium text-slate-700 mb-1.5">Capabilities this model supports</span>
              <div className="space-y-1">
                {CAPABILITIES.map((cap) => (
                  <label key={cap} className="flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" checked={modelForm.capabilities.includes(cap)} onChange={() => toggleCap("capabilities", cap)} />
                    {CAPABILITY_LABELS[cap]}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <span className="block text-sm font-medium text-slate-700 mb-1.5">Default route for</span>
              <div className="space-y-1">
                {CAPABILITIES.map((cap) => (
                  <label key={cap} className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      disabled={!modelForm.capabilities.includes(cap)}
                      checked={modelForm.defaultForCapabilities.includes(cap)}
                      onChange={() => toggleCap("defaultForCapabilities", cap)}
                    />
                    {CAPABILITY_LABELS[cap]}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <Button type="submit">Add model</Button>
        </form>

        <div className="divide-y divide-slate-50">
          {models.map((m) => {
            const provider = typeof m.providerId === "string" ? null : m.providerId;
            const result = testResults[m._id];
            return (
              <div key={m._id} className="px-5 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">
                      {m.label} <span className="text-slate-400 font-normal">({m.name})</span>
                    </div>
                    <div className="text-xs text-slate-400">{provider?.name}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {result && <span className={`text-xs ${result.ok ? "text-emerald-600" : "text-red-600"}`}>{result.message}</span>}
                    <Button variant="secondary" onClick={() => testModel(m._id)}>
                      Test
                    </Button>
                  </div>
                </div>
                {m.defaultForCapabilities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {m.defaultForCapabilities.map((cap) => (
                      <span key={cap} className="text-xs bg-brand-50 text-brand-700 border border-brand-100 rounded-full px-2 py-0.5">
                        default: {CAPABILITY_LABELS[cap]}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {models.length === 0 && <div className="px-5 py-6 text-center text-slate-400 text-sm">No models configured yet.</div>}
        </div>
      </Card>

      {usage && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader title="Usage by feature" />
            <div className="p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                    <th className="py-1.5 font-medium">Feature</th>
                    <th className="py-1.5 font-medium">Requests</th>
                    <th className="py-1.5 font-medium">Tokens</th>
                  </tr>
                </thead>
                <tbody>
                  {usage.byFeature.map((f) => (
                    <tr key={f.feature} className="border-b border-slate-50">
                      <td className="py-1.5">{f.feature}</td>
                      <td className="py-1.5 tabular-nums">{f.requests}</td>
                      <td className="py-1.5 tabular-nums">{f.tokens.toLocaleString()}</td>
                    </tr>
                  ))}
                  {usage.byFeature.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-slate-400">
                        No AI requests yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
          <Card>
            <CardHeader title="Usage by provider" />
            <div className="p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                    <th className="py-1.5 font-medium">Provider</th>
                    <th className="py-1.5 font-medium">Requests</th>
                    <th className="py-1.5 font-medium">Avg latency</th>
                  </tr>
                </thead>
                <tbody>
                  {usage.byProvider.map((p) => (
                    <tr key={p.provider} className="border-b border-slate-50">
                      <td className="py-1.5">{p.provider}</td>
                      <td className="py-1.5 tabular-nums">{p.requests}</td>
                      <td className="py-1.5 tabular-nums">{p.avgLatency}ms</td>
                    </tr>
                  ))}
                  {usage.byProvider.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-slate-400">
                        No AI requests yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

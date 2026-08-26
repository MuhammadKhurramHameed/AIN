import { FormEvent, useEffect, useState } from "react";
import { api } from "../api/client";
import { Card, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { ConsortiumPartner } from "../types";

export default function Partners() {
  const [partners, setPartners] = useState<ConsortiumPartner[]>([]);
  const [name, setName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const r = await api.get("/partners");
    setPartners(r.data.partners);
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/partners", { name, contactEmail: contactEmail || undefined });
      setName("");
      setContactEmail("");
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Consortium Partners</h1>
        <p className="text-slate-500 text-sm mt-1">Delivery partners contributing trainers and reach nationwide.</p>
      </div>

      <Card>
        <CardHeader title="Add a partner organization" />
        <form onSubmit={onCreate} className="p-5 grid md:grid-cols-3 gap-4 items-end">
          <label className="block">
            <span className="block text-sm font-medium text-slate-700 mb-1">Organization name</span>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="input" />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-slate-700 mb-1">Contact email</span>
            <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="input" />
          </label>
          <Button type="submit">Add partner</Button>
        </form>
        {error && <div className="px-5 pb-4 text-sm text-red-600">{error}</div>}
      </Card>

      <Card>
        <CardHeader title="Partners" subtitle={`${partners.length} organizations`} />
        <div className="divide-y divide-slate-50">
          {partners.map((p) => (
            <div key={p._id} className="px-5 py-3 flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">{p.name}</div>
                <div className="text-xs text-slate-400">{p.contactEmail ?? "No contact on file"}</div>
              </div>
              <Badge text={p.status} />
            </div>
          ))}
          {partners.length === 0 && <div className="px-5 py-6 text-center text-slate-400 text-sm">No partners yet.</div>}
        </div>
      </Card>
    </div>
  );
}

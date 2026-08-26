import { FormEvent, useEffect, useState } from "react";
import { api } from "../../api/client";
import { Card, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Programme, Track } from "../../types";

export default function Programmes() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [form, setForm] = useState({ name: "", description: "", targetParticipants: "", genderTargetPct: "30" });
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [newTrackName, setNewTrackName] = useState("");

  async function load() {
    const r = await api.get("/programmes");
    setProgrammes(r.data.programmes);
  }

  useEffect(() => {
    load();
  }, []);

  async function createProgramme(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/programmes", {
        name: form.name,
        description: form.description || undefined,
        targetParticipants: form.targetParticipants ? Number(form.targetParticipants) : undefined,
        genderTargetPct: Number(form.genderTargetPct),
      });
      setForm({ name: "", description: "", targetParticipants: "", genderTargetPct: "30" });
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function toggleExpand(programme: Programme) {
    if (expanded === programme.id) {
      setExpanded(null);
      return;
    }
    setExpanded(programme.id);
    const r = await api.get(`/tracks?programmeId=${programme.id}`);
    setTracks(r.data.tracks);
  }

  async function addTrack(programme: Programme, e: FormEvent) {
    e.preventDefault();
    await api.post("/tracks", { programmeId: programme.id, name: newTrackName, order: tracks.length });
    setNewTrackName("");
    const r = await api.get(`/tracks?programmeId=${programme.id}`);
    setTracks(r.data.tracks);
    await load();
  }

  async function toggleStatus(programme: Programme) {
    await api.patch(`/programmes/${programme.id}`, { status: programme.status === "active" ? "archived" : "active" });
    await load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Programmes</h1>
        <p className="text-slate-500 text-sm mt-1">
          The platform can host more than one national programme without duplicating the app — each gets its own tracks
          and curriculum, isolated from the others.
        </p>
      </div>

      <Card>
        <CardHeader title="Create a new programme" />
        <form onSubmit={createProgramme} className="p-5 grid md:grid-cols-4 gap-4">
          <label className="block md:col-span-2">
            <span className="block text-sm font-medium text-slate-700 mb-1">Programme name</span>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-slate-700 mb-1">Target participants</span>
            <input type="number" value={form.targetParticipants} onChange={(e) => setForm({ ...form, targetParticipants: e.target.value })} className="input" />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-slate-700 mb-1">Gender target %</span>
            <input type="number" min={0} max={100} value={form.genderTargetPct} onChange={(e) => setForm({ ...form, genderTargetPct: e.target.value })} className="input" />
          </label>
          <label className="block md:col-span-4">
            <span className="block text-sm font-medium text-slate-700 mb-1">Description</span>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" rows={2} />
          </label>
          <div className="md:col-span-4">
            <Button type="submit">Create programme</Button>
            {error && <span className="ml-3 text-sm text-red-600">{error}</span>}
          </div>
        </form>
      </Card>

      <div className="space-y-4">
        {programmes.map((p) => (
          <Card key={p.id}>
            <div className="p-5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-slate-900">{p.name}</h2>
                  <Badge text={p.status} />
                </div>
                {p.description && <p className="text-sm text-slate-500 mt-1 max-w-2xl">{p.description}</p>}
                <div className="flex gap-4 mt-2 text-xs text-slate-400">
                  {p.targetParticipants && <span>Target: {p.targetParticipants.toLocaleString()} participants</span>}
                  <span>Gender target: {p.genderTargetPct}%</span>
                  <span>{p.trackCount} tracks</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="secondary" onClick={() => toggleExpand(p)}>
                  {expanded === p.id ? "Hide tracks" : "Manage tracks"}
                </Button>
                <Button variant="secondary" onClick={() => toggleStatus(p)}>
                  {p.status === "active" ? "Archive" : "Reactivate"}
                </Button>
              </div>
            </div>

            {expanded === p.id && (
              <div className="border-t border-slate-100 p-5">
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                  {tracks.map((t) => (
                    <div key={t._id} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                      {t.name}
                    </div>
                  ))}
                  {tracks.length === 0 && <p className="text-sm text-slate-400 col-span-full">No tracks yet for this programme.</p>}
                </div>
                <form onSubmit={(e) => addTrack(p, e)} className="flex gap-2">
                  <input
                    required
                    value={newTrackName}
                    onChange={(e) => setNewTrackName(e.target.value)}
                    placeholder="New track name"
                    className="input flex-1"
                  />
                  <Button type="submit">Add track</Button>
                </form>
              </div>
            )}
          </Card>
        ))}
        {programmes.length === 0 && <p className="text-slate-400 text-sm">No programmes yet.</p>}
      </div>
    </div>
  );
}

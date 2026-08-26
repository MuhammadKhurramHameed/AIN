import { FormEvent, useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Card, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Pagination, PaginationMeta } from "../components/ui/Pagination";
import { BulkImportModal, BulkImportSummary } from "../components/ui/BulkImportModal";
import { ExportLink } from "../components/ui/ExportLink";
import { DELEGATION_RULES, ROLE_LABELS } from "../roleConfig";
import { ConsortiumPartner, Role, Track } from "../types";

const USER_IMPORT_TEMPLATE = `name,email,role,password,track,gender,phone,educationYears,experienceYears
Jane Trainee,jane.trainee@example.com,trainee,,Freelancers & Remote Workers,female,,16,2
John Tutor,john.tutor@example.com,tutor,,,,,,`;

interface StaffUser {
  _id: string;
  name: string;
  email: string;
  role: Role;
  status: string;
  organizationId?: string;
  trackId?: string;
}

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "" as Role | "",
  organizationId: "",
  trackId: "",
  gender: "" as string,
};

const PAGE_SIZE = 25;

export default function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, pageSize: PAGE_SIZE, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "">("");
  const [partners, setPartners] = useState<ConsortiumPartner[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [showImport, setShowImport] = useState(false);

  const allowedRoles = (user && DELEGATION_RULES[user.role]) ?? [];
  const canFilterByRole = user?.role === "super_admin" || user?.role === "moitt_staff";
  const canImportExport = allowedRoles.length > 0;

  function buildListParams(includePagination: boolean) {
    const params = new URLSearchParams();
    if (includePagination) {
      params.set("page", String(page));
      params.set("limit", String(PAGE_SIZE));
    }
    if (search.trim()) params.set("q", search.trim());
    if (roleFilter) params.set("role", roleFilter);
    return params;
  }

  async function loadUsers() {
    const r = await api.get(`/users?${buildListParams(true).toString()}`);
    setUsers(r.data.users);
    setMeta({ total: r.data.total, page: r.data.page, pageSize: r.data.pageSize, totalPages: r.data.totalPages });
  }

  async function importUsers(rows: Record<string, string>[]): Promise<BulkImportSummary> {
    const r = await api.post("/users/bulk", { users: rows });
    return r.data;
  }

  const filterKey = `${roleFilter}|${search}`;
  const prevFilterKey = useRef(filterKey);

  useEffect(() => {
    const filtersChanged = prevFilterKey.current !== filterKey;
    prevFilterKey.current = filterKey;
    if (filtersChanged && page !== 1) {
      setPage(1); // triggers this same effect again with page=1, which then actually fetches
      return;
    }
    const t = setTimeout(loadUsers, filtersChanged ? 300 : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterKey]);

  useEffect(() => {
    api.get("/partners").then((r) => setPartners(r.data.partners));
    api.get("/tracks").then((r) => setTracks(r.data.tracks));
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/users", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        organizationId: form.organizationId || undefined,
        trackId: form.trackId || undefined,
        gender: form.gender || undefined,
      });
      setForm(emptyForm);
      await loadUsers();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleStatus(u: StaffUser) {
    const next = u.status === "active" ? "disabled" : "active";
    await api.patch(`/users/${u._id}/status`, { status: next });
    await loadUsers();
  }

  const needsOrg = form.role === "consortium_partner_admin" || form.role === "consortium_partner_staff";
  const needsTrack = form.role === "trainee";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Staff & Users</h1>
        <p className="text-slate-500 text-sm mt-1">Delegate accounts to the roles you're authorized to create.</p>
      </div>

      <Card>
        <CardHeader title="Add a person" subtitle={`You may create: ${allowedRoles.map((r) => ROLE_LABELS[r]).join(", ") || "nothing"}`} />
        <form onSubmit={onCreate} className="p-5 grid md:grid-cols-2 gap-4">
          <Field label="Full name">
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
          </Field>
          <Field label="Email">
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Temporary password">
            <input
              required
              minLength={8}
              type="text"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Role">
            <select required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })} className="input">
              <option value="">Select role</option>
              {allowedRoles.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </Field>
          {needsOrg && user?.role === "super_admin" && (
            <Field label="Consortium partner">
              <select
                required
                value={form.organizationId}
                onChange={(e) => setForm({ ...form, organizationId: e.target.value })}
                className="input"
              >
                <option value="">Select partner org</option>
                {partners.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
          {needsTrack && (
            <Field label="Track">
              <select required value={form.trackId} onChange={(e) => setForm({ ...form, trackId: e.target.value })} className="input">
                <option value="">Select track</option>
                {tracks.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
          {needsTrack && (
            <Field label="Gender (for compliance reporting)">
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="input">
                <option value="">Prefer not to say</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </Field>
          )}
          <div className="md:col-span-2 flex items-center gap-3">
            <Button type="submit" disabled={submitting || allowedRoles.length === 0}>
              {submitting ? "Creating..." : "Create account"}
            </Button>
            {error && <span className="text-sm text-red-600">{error}</span>}
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader
          title="People"
          subtitle={`${meta.total.toLocaleString()} account${meta.total === 1 ? "" : "s"} visible to you`}
          action={
            canImportExport && (
              <div className="flex gap-2 shrink-0">
                <Button variant="secondary" onClick={() => setShowImport(true)}>
                  Import CSV
                </Button>
                <ExportLink href={`/api/users/export?${buildListParams(false).toString()}`} />
              </div>
            )
          }
        />
        <div className="px-5 py-3 border-b border-slate-100 flex gap-3 flex-wrap">
          <input
            className="input max-w-xs"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {canFilterByRole && (
            <select className="input max-w-xs" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as Role | "")}>
              <option value="">All roles</option>
              {Object.entries(ROLE_LABELS).map(([role, label]) => (
                <option key={role} value={role}>
                  {label}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-slate-400 border-b border-slate-100">
                <th className="px-5 py-2">Name</th>
                <th className="px-5 py-2">Email</th>
                <th className="px-5 py-2">Role</th>
                <th className="px-5 py-2">Status</th>
                <th className="px-5 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-slate-50">
                  <td className="px-5 py-2 font-medium">{u.name}</td>
                  <td className="px-5 py-2 text-slate-500">{u.email}</td>
                  <td className="px-5 py-2">{ROLE_LABELS[u.role]}</td>
                  <td className="px-5 py-2">
                    <Badge text={u.status} />
                  </td>
                  <td className="px-5 py-2 text-right">
                    <button onClick={() => toggleStatus(u)} className="text-xs text-brand-600 hover:underline">
                      {u.status === "active" ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-slate-400">
                    No accounts match this search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination meta={meta} onPageChange={setPage} />
      </Card>

      {showImport && (
        <BulkImportModal
          title="Bulk import accounts"
          description={`Upload a CSV to create many accounts at once. You may create: ${allowedRoles.map((r) => ROLE_LABELS[r]).join(", ") || "nothing"}. Leave "password" blank to auto-generate a temporary one per account. "track" accepts either a track name or id — only relevant for trainees.`}
          templateFilename="users-import-template.csv"
          templateCsv={USER_IMPORT_TEMPLATE}
          onImport={importUsers}
          onClose={() => setShowImport(false)}
          onImported={loadUsers}
        />
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700 mb-1">{label}</span>
      {children}
    </label>
  );
}

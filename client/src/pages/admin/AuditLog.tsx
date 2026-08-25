import { useEffect, useRef, useState } from "react";
import { api } from "../../api/client";
import { Card, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Pagination, PaginationMeta } from "../../components/ui/Pagination";
import { ExportLink } from "../../components/ui/ExportLink";

interface AuditLogEntry {
  _id: string;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  ip?: string;
  success: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

const ACTIONS = [
  "login",
  "login_password_ok_mfa_pending",
  "mfa_login",
  "mfa_setup_started",
  "mfa_enable",
  "mfa_disable",
  "user_created",
  "user_status_changed",
  "ai_provider_created",
  "ai_provider_updated",
];

const PAGE_SIZE = 25;

export default function AuditLog() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, pageSize: PAGE_SIZE, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const [success, setSuccess] = useState("");
  const [actorEmail, setActorEmail] = useState("");

  function buildListParams(includePagination: boolean) {
    const params = new URLSearchParams();
    if (includePagination) {
      params.set("page", String(page));
      params.set("limit", String(PAGE_SIZE));
    }
    if (action) params.set("action", action);
    if (success) params.set("success", success);
    if (actorEmail.trim()) params.set("actorEmail", actorEmail.trim());
    return params;
  }

  async function load() {
    const r = await api.get(`/audit-logs?${buildListParams(true).toString()}`);
    setLogs(r.data.logs);
    setMeta({ total: r.data.total, page: r.data.page, pageSize: r.data.pageSize, totalPages: r.data.totalPages });
  }

  const filterKey = `${action}|${success}|${actorEmail}`;
  const prevFilterKey = useRef(filterKey);

  useEffect(() => {
    const filtersChanged = prevFilterKey.current !== filterKey;
    prevFilterKey.current = filterKey;
    if (filtersChanged && page !== 1) {
      setPage(1); // triggers this same effect again with page=1, which then actually fetches
      return;
    }
    const t = setTimeout(load, filtersChanged ? 300 : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterKey]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Audit Log</h1>
        <p className="text-slate-500 text-sm mt-1">
          Security-relevant events — logins, MFA changes, privilege grants, and provider secret access — for compliance
          review and incident investigation.
        </p>
      </div>

      <Card>
        <CardHeader
          title="Events"
          subtitle={`${meta.total.toLocaleString()} matching event${meta.total === 1 ? "" : "s"}`}
          action={<ExportLink href={`/api/audit-logs/export?${buildListParams(false).toString()}`} />}
        />
        <div className="p-5 flex gap-3 flex-wrap border-b border-slate-100">
          <input
            className="input max-w-xs"
            placeholder="Filter by actor email..."
            value={actorEmail}
            onChange={(e) => setActorEmail(e.target.value)}
          />
          <select className="input" value={action} onChange={(e) => setAction(e.target.value)}>
            <option value="">All actions</option>
            {ACTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <select className="input" value={success} onChange={(e) => setSuccess(e.target.value)}>
            <option value="">Success + failure</option>
            <option value="true">Success only</option>
            <option value="false">Failure only</option>
          </select>
        </div>
        <div className="divide-y divide-slate-100">
          {logs.map((l) => (
            <div key={l._id} className="p-4 flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-slate-800">
                  {l.action} <span className="text-slate-400 font-normal">— {l.actorEmail ?? "unknown"}</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {new Date(l.createdAt).toLocaleString()}
                  {l.actorRole && ` · ${l.actorRole}`}
                  {l.ip && ` · ${l.ip}`}
                  {l.targetType && ` · ${l.targetType}:${l.targetId}`}
                </div>
                {l.metadata && Object.keys(l.metadata).length > 0 && (
                  <div className="text-xs text-slate-400 mt-1 font-mono">{JSON.stringify(l.metadata)}</div>
                )}
              </div>
              <Badge text={l.success ? "success" : "failed"} />
            </div>
          ))}
          {logs.length === 0 && <p className="p-5 text-sm text-slate-400">No matching events.</p>}
        </div>
        <Pagination meta={meta} onPageChange={setPage} />
      </Card>
    </div>
  );
}

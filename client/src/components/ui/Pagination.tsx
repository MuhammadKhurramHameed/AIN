import { Button } from "./Button";

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function Pagination({ meta, onPageChange }: { meta: PaginationMeta; onPageChange: (page: number) => void }) {
  if (meta.totalPages <= 1) return null;
  const from = meta.total === 0 ? 0 : (meta.page - 1) * meta.pageSize + 1;
  const to = Math.min(meta.page * meta.pageSize, meta.total);

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 text-sm">
      <span className="text-slate-400">
        {from}–{to} of {meta.total.toLocaleString()}
      </span>
      <div className="flex items-center gap-2">
        <Button variant="secondary" disabled={meta.page <= 1} onClick={() => onPageChange(meta.page - 1)}>
          Previous
        </Button>
        <span className="text-slate-500 px-1">
          Page {meta.page} of {meta.totalPages}
        </span>
        <Button variant="secondary" disabled={meta.page >= meta.totalPages} onClick={() => onPageChange(meta.page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}

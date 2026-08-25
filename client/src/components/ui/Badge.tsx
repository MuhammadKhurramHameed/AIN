const colors: Record<string, string> = {
  draft: "bg-amber-50 text-amber-700 border-amber-200",
  published: "bg-emerald-50 text-emerald-700 border-emerald-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  inactive: "bg-slate-100 text-slate-500 border-slate-200",
  disabled: "bg-slate-100 text-slate-500 border-slate-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  dropped: "bg-red-50 text-red-600 border-red-200",
  submitted: "bg-blue-50 text-blue-700 border-blue-200",
  reviewed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  low: "bg-slate-100 text-slate-600 border-slate-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  high: "bg-red-50 text-red-600 border-red-200",
};

export function Badge({ text }: { text: string }) {
  const cls = colors[text] ?? "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${cls}`}>
      {text.replace(/_/g, " ")}
    </span>
  );
}

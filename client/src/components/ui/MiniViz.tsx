const DEFAULT_SEGMENT_COLORS = ["#4a5fe0", "#0e7a63", "#a86a15", "#b23a24", "#7a8095"];

export type VizTone = "good" | "warn" | "bad" | "neutral";

const TONE_COLOR: Record<VizTone, string> = {
  good: "#0e7a63",
  warn: "#a86a15",
  bad: "#b23a24",
  neutral: "#4a5fe0",
};

/** Small circular progress ring — used where a tile's value is naturally a 0-100% share. */
export function MiniProgressRing({ value, tone = "neutral", size = 36 }: { value: number; tone?: VizTone; size?: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const r = (size - 4) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - clamped / 100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={3} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={TONE_COLOR[tone]}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

/** Small horizontal progress bar, optionally with a target tick mark (e.g. a compliance floor). */
export function MiniProgressBar({ value, target, tone = "neutral" }: { value: number; target?: number; tone?: VizTone }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="relative h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${clamped}%`, backgroundColor: TONE_COLOR[tone] }} />
      {typeof target === "number" && (
        <div className="absolute top-0 bottom-0 w-px bg-slate-400" style={{ left: `${Math.max(0, Math.min(100, target))}%` }} />
      )}
    </div>
  );
}

/** Small horizontal stacked bar — used for a compact gender/category split without a legend. */
export function MiniStackedBar({ segments }: { segments: { value: number; color?: string }[] }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) return <div className="h-1.5 w-full bg-slate-100 rounded-full" />;
  return (
    <div className="h-1.5 w-full rounded-full overflow-hidden flex bg-slate-100">
      {segments
        .filter((s) => s.value > 0)
        .map((s, i) => (
          <div key={i} style={{ width: `${(s.value / total) * 100}%`, backgroundColor: s.color ?? DEFAULT_SEGMENT_COLORS[i % DEFAULT_SEGMENT_COLORS.length] }} />
        ))}
    </div>
  );
}

const TONE_BADGE: Record<VizTone, string> = {
  good: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warn: "bg-amber-50 text-amber-700 border-amber-200",
  bad: "bg-red-50 text-red-600 border-red-200",
  neutral: "bg-slate-100 text-slate-600 border-slate-200",
};

/** A small pill badge for a free-form label (unlike the status-word Badge component) — used
 * for tile-face indicators like "52 tutors" or "0 pending" where the text isn't a fixed status. */
export function CountBadge({ text, tone = "neutral" }: { text: string; tone?: VizTone }) {
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${TONE_BADGE[tone]}`}>{text}</span>;
}

/** A small row of filled/unfilled dots — a lightweight "N of M" indicator for low counts. */
export function MiniDots({ filled, total, cap = 12, tone = "neutral" }: { filled: number; total: number; cap?: number; tone?: VizTone }) {
  const shown = Math.min(total, cap);
  const overflow = total - shown;
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {Array.from({ length: shown }).map((_, i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: i < filled ? TONE_COLOR[tone] : "#e5e7eb" }}
        />
      ))}
      {overflow > 0 && <span className="text-[10px] text-slate-400 ml-0.5">+{overflow}</span>}
    </div>
  );
}

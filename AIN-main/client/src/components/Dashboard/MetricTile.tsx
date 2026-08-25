import { ReactNode, useState } from "react";
import { Modal } from "../ui/Modal";

export function MetricTile({
  label,
  value,
  hint,
  title,
  subtitle,
  guidance,
  wide,
  icon,
  visual,
  children,
}: {
  label: string;
  value: string | number;
  hint?: string;
  title: string;
  subtitle?: string;
  guidance: string;
  wide?: boolean;
  /** Small (16px) icon shown next to the label, identifying the metric at a glance. */
  icon?: ReactNode;
  /** A small chart/progress indicator (MiniProgressRing, MiniProgressBar, MiniStackedBar, MiniDots, or a Badge)
   * shown on the tile face itself, below the value — not just inside the popup. */
  visual?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-left w-full bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4 hover:border-brand-300 hover:shadow transition"
      >
        <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-slate-400 font-medium">
          {icon && <span className="text-slate-400">{icon}</span>}
          {label}
        </div>
        <div className="text-2xl font-semibold text-slate-900 mt-1 tabular-nums">{value}</div>
        {visual && <div className="mt-2">{visual}</div>}
        {hint && <div className="text-xs text-slate-400 mt-1">{hint}</div>}
      </button>
      {open && (
        <Modal title={title} subtitle={subtitle} onClose={() => setOpen(false)} wide={wide}>
          <p className="text-sm text-slate-600 mb-4">{guidance}</p>
          {children}
        </Modal>
      )}
    </>
  );
}

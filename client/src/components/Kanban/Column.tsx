import { useDroppable } from "@dnd-kit/core";
import { ReactNode } from "react";

export function Column({ id, title, count, children }: { id: string; title: string; count: number; children: ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[240px] bg-slate-100 rounded-xl p-3 flex flex-col gap-2 transition ${
        isOver ? "ring-2 ring-brand-500 bg-brand-50" : ""
      }`}
    >
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        <span className="text-xs text-slate-400 bg-white rounded-full px-2 py-0.5">{count}</span>
      </div>
      <div className="flex flex-col gap-2 min-h-[60px]">{children}</div>
    </div>
  );
}

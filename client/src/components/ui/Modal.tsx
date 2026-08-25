import { ReactNode, useEffect } from "react";

export function Modal({
  title,
  subtitle,
  onClose,
  children,
  wide,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div
        className={`relative bg-white rounded-xl shadow-2xl w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-[85vh] overflow-y-auto`}
      >
        <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white">
          <div>
            <h2 className="font-semibold text-slate-900">{title}</h2>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-sm shrink-0 ml-4">
            Close
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

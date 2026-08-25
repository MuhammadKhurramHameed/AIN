import { useActivity } from "./ActivityContext";
import { activityDotColor } from "./activityIcon";

export function ToastStack() {
  const { toasts, dismissToast } = useActivity();

  return (
    <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 w-80 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.toastId}
          className="pointer-events-auto bg-white border border-slate-200 shadow-lg rounded-lg px-3.5 py-3 flex gap-2.5 items-start animate-[fadeIn_.15s_ease-out]"
        >
          <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${activityDotColor(t.type)}`} />
          <p className="text-sm text-slate-700 flex-1">{t.message}</p>
          <button onClick={() => dismissToast(t.toastId)} className="text-slate-300 hover:text-slate-500 text-xs leading-none">
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

import { useActivity } from "./ActivityContext";
import { activityDotColor } from "./activityIcon";
import { timeAgo } from "../../lib/time";

export function ActivityPanel() {
  const { items, panelOpen, togglePanel } = useActivity();

  return (
    <>
      {panelOpen && <div className="fixed inset-0 bg-slate-900/20 z-40" onClick={togglePanel} />}
      <aside
        className={`fixed top-0 right-0 h-full w-80 bg-white border-l border-slate-200 shadow-xl z-50 transform transition-transform duration-200 ${
          panelOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-semibold text-slate-900">Activity</h2>
            <p className="text-xs text-slate-400">Live actions across the programme</p>
          </div>
          <button onClick={togglePanel} className="text-slate-400 hover:text-slate-600 text-sm">
            Close
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-73px)] divide-y divide-slate-50">
          {items.map((item) => (
            <div key={item._id} className="px-4 py-3 flex gap-2.5">
              <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${activityDotColor(item.type)}`} />
              <div className="min-w-0">
                <p className="text-sm text-slate-700">{item.message}</p>
                <p className="text-xs text-slate-400 mt-0.5">{timeAgo(item.createdAt)}</p>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="px-4 py-8 text-center text-sm text-slate-400">No activity yet.</div>}
        </div>
      </aside>
    </>
  );
}

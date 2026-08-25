import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { NAV_BY_ROLE, ROLE_LABELS, PORTAL_BY_ROLE, PORTAL_LABELS } from "../../roleConfig";
import { ActivityProvider, useActivity } from "../Activity/ActivityContext";
import { ActivityPanel } from "../Activity/ActivityPanel";
import { ToastStack } from "../Activity/ToastStack";
import { AinLogo } from "../ui/AinLogo";

const HAS_ACTIVITY_FEED = new Set([
  "super_admin",
  "moitt_staff",
  "content_admin",
  "content_reviewer",
  "tutor",
  "consortium_partner_admin",
  "consortium_partner_staff",
]);

function ActivityBell() {
  const { unseenCount, togglePanel } = useActivity();
  return (
    <button
      onClick={togglePanel}
      className="relative w-9 h-9 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-slate-800 hover:border-slate-300"
      aria-label="Activity"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
      {unseenCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-semibold flex items-center justify-center">
          {unseenCount > 9 ? "9+" : unseenCount}
        </span>
      )}
    </button>
  );
}

function LayoutBody({ showActivity }: { showActivity: boolean }) {
  const { user, logout } = useAuth();
  if (!user) return null;

  const navItems = NAV_BY_ROLE[user.role] ?? [];

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 shrink-0 bg-slate-900 text-slate-100 flex flex-col">
        <div className="px-5 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <AinLogo size={24} />
            <div className="font-semibold text-lg tracking-tight">AIN</div>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">{PORTAL_LABELS[PORTAL_BY_ROLE[user.role]]}</div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? "bg-brand-500 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-slate-800">
          <div className="text-sm font-medium truncate">{user.name}</div>
          <div className="text-xs text-slate-400 truncate">{ROLE_LABELS[user.role]}</div>
          <button
            onClick={() => logout()}
            className="mt-3 w-full rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-slate-50 min-w-0">
        {showActivity && (
          <div className="flex justify-end px-6 md:px-8 pt-5">
            <ActivityBell />
          </div>
        )}
        <div className="max-w-6xl mx-auto p-6 md:p-8 pt-2">
          <Outlet />
        </div>
      </main>
      {showActivity && (
        <>
          <ActivityPanel />
          <ToastStack />
        </>
      )}
    </div>
  );
}

export function AppLayout() {
  const { user } = useAuth();
  const showActivity = !!user && HAS_ACTIVITY_FEED.has(user.role);

  if (!showActivity) return <LayoutBody showActivity={false} />;
  return (
    <ActivityProvider>
      <LayoutBody showActivity />
    </ActivityProvider>
  );
}

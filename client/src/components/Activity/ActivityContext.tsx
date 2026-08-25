import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { api } from "../../api/client";
import { getActivitySocket } from "../../api/activitySocket";
import { ActivityItem } from "../../types";

interface ToastItem extends ActivityItem {
  toastId: number;
}

interface ActivityContextValue {
  items: ActivityItem[];
  unseenCount: number;
  panelOpen: boolean;
  togglePanel: () => void;
  toasts: ToastItem[];
  dismissToast: (toastId: number) => void;
}

const ActivityContext = createContext<ActivityContextValue | undefined>(undefined);

const MAX_FEED_ITEMS = 30;

export function ActivityProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [unseenCount, setUnseenCount] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastSeq = useRef(0);

  useEffect(() => {
    api.get("/activity").then((r) => setItems(r.data.activity));

    const socket = getActivitySocket();
    function onActivity(entry: ActivityItem) {
      setItems((prev) => [entry, ...prev].slice(0, MAX_FEED_ITEMS));
      setUnseenCount((prev) => prev + 1);

      const toastId = ++toastSeq.current;
      setToasts((prev) => [...prev, { ...entry, toastId }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.toastId !== toastId));
      }, 6000);
    }
    socket.on("activity", onActivity);
    return () => {
      socket.off("activity", onActivity);
    };
  }, []);

  const togglePanel = useCallback(() => {
    setPanelOpen((prev) => {
      if (!prev) setUnseenCount(0);
      return !prev;
    });
  }, []);

  const dismissToast = useCallback((toastId: number) => {
    setToasts((prev) => prev.filter((t) => t.toastId !== toastId));
  }, []);

  return (
    <ActivityContext.Provider value={{ items, unseenCount, panelOpen, togglePanel, toasts, dismissToast }}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity(): ActivityContextValue {
  const ctx = useContext(ActivityContext);
  if (!ctx) throw new Error("useActivity must be used within ActivityProvider");
  return ctx;
}

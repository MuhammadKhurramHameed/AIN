import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "../api/client";
import { AuthUser } from "../types";

type LoginResult = { mfaRequired: false } | { mfaRequired: true; mfaToken: string };

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  completeMfaLogin: (mfaToken: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    const res = await api.post("/auth/login", { email, password });
    if (res.data.mfaRequired) return { mfaRequired: true, mfaToken: res.data.mfaToken };
    setUser(res.data.user);
    return { mfaRequired: false };
  }, []);

  const completeMfaLogin = useCallback(async (mfaToken: string, code: string) => {
    const res = await api.post("/auth/mfa/login", { mfaToken, code });
    setUser(res.data.user);
  }, []);

  const logout = useCallback(async () => {
    await api.post("/auth/logout");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, completeMfaLogin, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

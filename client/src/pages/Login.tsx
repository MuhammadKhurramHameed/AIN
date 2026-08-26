import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Button } from "../components/ui/Button";
import { AinLogo } from "../components/ui/AinLogo";

export default function Login() {
  const { user, login, completeMfaLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@synapse.local");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  async function onSubmitPassword(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await login(email, password);
      if (result.mfaRequired) {
        setMfaToken(result.mfaToken);
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function onSubmitMfa(e: FormEvent) {
    e.preventDefault();
    if (!mfaToken) return;
    setSubmitting(true);
    setError(null);
    try {
      await completeMfaLogin(mfaToken, code);
      navigate("/dashboard");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-2">
            <AinLogo size={30} />
            <div className="text-xl font-semibold text-slate-900">AIN</div>
          </div>
          <div className="text-xs text-slate-400 tracking-wide mt-0.5">Artificial Intelligence Network</div>
          <div className="text-sm text-slate-500 mt-2">MoITT AI Capacity Building Programme</div>
        </div>

        {mfaToken ? (
          <form onSubmit={onSubmitMfa} className="space-y-4">
            <p className="text-sm text-slate-600">Enter the 6-digit code from your authenticator app.</p>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Authentication code</label>
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Verifying..." : "Verify"}
            </Button>
            <button
              type="button"
              className="text-xs text-slate-400 hover:text-slate-600 w-full text-center"
              onClick={() => {
                setMfaToken(null);
                setCode("");
                setError(null);
              }}
            >
              Back to sign in
            </button>
          </form>
        ) : (
          <form onSubmit={onSubmitPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        )}

        <p className="text-xs text-slate-400 mt-5 text-center">
          Seeded super admin: admin@synapse.local — see server/.env.example
        </p>
      </div>
    </div>
  );
}

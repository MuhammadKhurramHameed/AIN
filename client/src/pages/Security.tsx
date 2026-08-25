import { FormEvent, useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Card, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

export default function Security() {
  const { user, refresh } = useAuth();
  const [setupData, setSetupData] = useState<{ secret: string; otpauthUrl: string; qrDataUrl: string } | null>(null);
  const [code, setCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setSetupData(null);
    setCode("");
    setDisableCode("");
    setError(null);
    setMessage(null);
  }, [user?.mfaEnabled]);

  async function startSetup() {
    setError(null);
    try {
      const r = await api.post("/auth/mfa/setup", {});
      setSetupData(r.data);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function verifySetup(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/auth/mfa/verify-setup", { code });
      setMessage("Two-factor authentication is now enabled on your account.");
      setSetupData(null);
      setCode("");
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function disable(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/auth/mfa/disable", { code: disableCode });
      setMessage("Two-factor authentication has been disabled.");
      setDisableCode("");
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Security</h1>
        <p className="text-slate-500 text-sm mt-1">
          Two-factor authentication adds a time-based one-time code (from an authenticator app like Google Authenticator
          or Authy) on top of your password, on every login.
        </p>
      </div>

      {message && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">{message}</div>}
      {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</div>}

      <Card>
        <CardHeader title="Two-factor authentication (TOTP)" />
        <div className="p-5 space-y-4">
          {user.mfaEnabled ? (
            <>
              <div className="text-sm text-emerald-700 font-medium">Enabled on your account.</div>
              <form onSubmit={disable} className="space-y-3">
                <label className="block max-w-xs">
                  <span className="block text-sm font-medium text-slate-700 mb-1">
                    Enter a current code from your authenticator app to disable
                  </span>
                  <input
                    className="input"
                    value={disableCode}
                    onChange={(e) => setDisableCode(e.target.value)}
                    placeholder="123456"
                    required
                  />
                </label>
                <Button type="submit" variant="secondary">
                  Disable two-factor authentication
                </Button>
              </form>
            </>
          ) : setupData ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Scan this QR code with your authenticator app, then enter the 6-digit code it shows to confirm setup.
              </p>
              <img src={setupData.qrDataUrl} alt="MFA QR code" className="border border-slate-200 rounded-lg w-48 h-48" />
              <div className="text-xs text-slate-500">
                Can't scan? Enter this key manually: <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{setupData.secret}</code>
              </div>
              <form onSubmit={verifySetup} className="flex items-end gap-3">
                <label className="block">
                  <span className="block text-sm font-medium text-slate-700 mb-1">6-digit code</span>
                  <input className="input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" required />
                </label>
                <Button type="submit">Confirm & enable</Button>
                <button type="button" className="text-sm text-slate-400 hover:text-slate-600" onClick={() => setSetupData(null)}>
                  Cancel
                </button>
              </form>
            </div>
          ) : (
            <>
              <div className="text-sm text-slate-500">Not enabled on your account yet.</div>
              <Button type="button" onClick={startSetup}>
                Set up two-factor authentication
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

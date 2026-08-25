import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const SignInView = () => {
  const { switchRole, navigateTo } = useApp();
  const [activeTab, setActiveTab] = useState('public');
  const [identity, setIdentity] = useState('35201-9988776-1');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('SUPER_ADMIN');

  const handleSignIn = (e) => {
    e.preventDefault();
    switchRole(selectedRole);
    navigateTo("2fa-verify");
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "75vh", padding: "20px" }}>
      <div className="stitch-signin-card">
        {/* Lock Circle */}
        <div className="stitch-icon-circle">
          <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>lock</span>
        </div>

        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "22px", fontWeight: 800, color: "#0f172a" }}>
            Synapse LMS Portal
          </h1>
          <p style={{ fontSize: "12.5px", color: "var(--text-subtle)", marginTop: "4px" }}>
            National AI Capacity Building Initiative Identity Gateway
          </p>
        </div>

        {/* Role Demo Persona Picker */}
        <div style={{ background: "var(--surface-dim)", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px", marginBottom: "20px" }}>
          <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "11px", uppercase: true, fontWeight: 600, color: "var(--text-subtle)", marginBottom: "6px" }}>
            Select Demo Persona Role:
          </label>
          <select
            className="form-control form-select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            style={{ fontSize: "12px", background: "#ffffff" }}
          >
            <option value="SUPER_ADMIN">Super Admin (Ministry Director)</option>
            <option value="MOITT_AUDITOR">MoITT Auditor (Compliance Officer)</option>
            <option value="CONSORTIUM_ADMIN">Consortium Admin (NUST Dean)</option>
            <option value="TRAINER">Trainer (Lead Instructor)</option>
            <option value="CONTENT_REVIEWER">Content Reviewer (Pedagogy Quality)</option>
            <option value="TRAINEE">Trainee Student (Registered Candidate)</option>
          </select>
        </div>

        {/* Tab Group */}
        <div className="stitch-tab-group">
          <button
            type="button"
            className={`stitch-tab-btn ${activeTab === 'public' ? 'active' : ''}`}
            onClick={() => setActiveTab('public')}
          >
            Public / Trainee Sign In
          </button>
          <button
            type="button"
            className={`stitch-tab-btn ${activeTab === 'enterprise' ? 'active' : ''}`}
            onClick={() => setActiveTab('enterprise')}
          >
            Enterprise / Govt SSO
          </button>
        </div>

        {activeTab === 'public' ? (
          <form onSubmit={handleSignIn} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="relative-input-wrapper">
              <input
                id="public-identifier"
                type="text"
                className="floating-input"
                placeholder=" "
                required
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
              />
              <label className="floating-label" htmlFor="public-identifier">CNIC (00000-0000000-0) or Email</label>
            </div>

            <div className="relative-input-wrapper" style={{ position: "relative" }}>
              <input
                id="public-password"
                type={showPassword ? "text" : "password"}
                className="floating-input"
                style={{ paddingRight: "40px" }}
                placeholder=" "
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label className="floating-label" htmlFor="public-password">Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-subtle)" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", cursor: "pointer" }}>
                <input type="checkbox" defaultChecked />
                Remember workstation
              </label>
              <a href="#" style={{ color: "#1d4ed8", textDecoration: "none" }}>Forgot Password?</a>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center", gap: "8px" }}>
              Authorize &amp; Enter Portal
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>login</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignIn} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="relative-input-wrapper">
              <input
                id="enterprise-email"
                type="email"
                className="floating-input"
                placeholder=" "
                required
                defaultValue="director@moitt.gov.pk"
              />
              <label className="floating-label" htmlFor="enterprise-email">Govt/Partner Email</label>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center", gap: "8px" }}>
              Continue to SSO Provider
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

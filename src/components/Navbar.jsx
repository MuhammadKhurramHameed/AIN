import React from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Verified, Building2, Users, BookOpen, GraduationCap, UserPlus, QrCode, Sliders, Globe, LogIn, LogOut, User } from 'lucide-react';

export const DemoRoleBar = () => {
  const { currentRole, switchRole, navigateTo } = useApp();

  const roleChips = [
    { code: "SUPER_ADMIN", label: "Super Admin", icon: Shield },
    { code: "MOITT_AUDITOR", label: "AIN Auditor", icon: Verified },
    { code: "CONSORTIUM_ADMIN", label: "Consortium Admin", icon: Building2 },
    { code: "TRAINER", label: "Trainer", icon: Users },
    { code: "CONTENT_REVIEWER", label: "Content Reviewer", icon: BookOpen },
    { code: "TRAINEE", label: "Trainee Student", icon: GraduationCap },
  ];

  return (
    <div className="demo-role-bar">
      <div className="brand-badge">
        <Sliders size={15} />
        <span>DEMO PERSONA SWITCHER</span>
      </div>

      <div className="role-selector-group">
        <button
          className="role-chip"
          style={{ borderColor: "#a7f3d0", color: "#6ee7b7" }}
          onClick={() => navigateTo("landing-page")}
        >
          <Globe size={13} />
          <span>Landing Page</span>
        </button>

        {roleChips.map(chip => {
          const Icon = chip.icon;
          return (
            <button
              key={chip.code}
              className={`role-chip ${currentRole === chip.code ? "active" : ""}`}
              onClick={() => switchRole(chip.code)}
            >
              <Icon size={13} />
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const Header = () => {
  const { roleConfig, currentUser, logout, toggleDemoBar, showDemoBar } = useApp();

  return (
    <header className="app-header">
      <div className="header-title-group">
        <h1>{roleConfig.title}</h1>
        <p>{roleConfig.subtitle}</p>
      </div>

      <div className="header-actions" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Logged In User Pill */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--surface-dim)", padding: "4px 12px", borderRadius: "9999px", border: "1px solid #e2e8f0" }}>
          <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#1d4ed8", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700 }}>
            <User size={13} />
          </div>
          <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#0f172a" }}>
            {currentUser?.name || "Authenticated User"}
          </span>
          <span className="badge badge-primary" style={{ fontSize: "10px", padding: "2px 8px" }}>
            {roleConfig.label}
          </span>
        </div>

        {/* Demo Mode Toggle Button */}
        <button
          className="btn btn-ghost btn-sm"
          style={{ color: showDemoBar ? "#1d4ed8" : "var(--text-subtle)", fontSize: "12px" }}
          onClick={toggleDemoBar}
          title="Toggle Demo Persona Bar"
        >
          <Sliders size={14} /> Demo Switcher
        </button>

        {/* Sign Out Button */}
        <button className="btn btn-secondary btn-sm" onClick={logout} style={{ color: "#dc2626", borderColor: "#fca5a5" }}>
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </header>
  );
};

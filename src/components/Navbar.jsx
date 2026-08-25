import React from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Verified, Building2, Users, BookOpen, GraduationCap, UserPlus, QrCode, Sliders } from 'lucide-react';

export const DemoRoleBar = () => {
  const { currentRole, switchRole, heartbeatPing, navigateTo } = useApp();

  const roleChips = [
    { code: "SUPER_ADMIN", label: "Super Admin", icon: Shield },
    { code: "MOITT_AUDITOR", label: "MoITT Auditor", icon: Verified },
    { code: "CONSORTIUM_ADMIN", label: "Consortium Admin", icon: Building2 },
    { code: "TRAINER", label: "Trainer", icon: Users },
    { code: "CONTENT_REVIEWER", label: "Content Reviewer", icon: BookOpen },
    { code: "TRAINEE", label: "Trainee Student", icon: GraduationCap },
  ];

  return (
    <div className="demo-role-bar">
      <div className="brand-badge">
        <Sliders size={15} />
        <span>SYNAPSE LMS CONTROL PLANE</span>
        <span style={{ opacity: 0.5, margin: "0 4px" }}>|</span>
        <span style={{ color: "#94a3b8", fontWeight: 500 }}>SaaS Gateway</span>
      </div>

      <div className="role-selector-group">
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
        
        <button
          className="role-chip"
          style={{ borderColor: "#60a5fa", color: "#60a5fa" }}
          onClick={() => navigateTo("public-intake")}
        >
          <UserPlus size={13} />
          <span>Public Intake</span>
        </button>
        
        <button
          className="role-chip"
          style={{ borderColor: "#34d399", color: "#34d399" }}
          onClick={() => navigateTo("authenticator")}
        >
          <QrCode size={13} />
          <span>Authenticator</span>
        </button>
    </div>
  );
};

export const Header = () => {
  const { roleConfig, navigateTo } = useApp();

  return (
    <header className="app-header">
      <div className="header-title-group">
        <h1>{roleConfig.title}</h1>
        <p>{roleConfig.subtitle}</p>
      </div>

      <div className="header-actions">
        <button className="btn btn-secondary btn-sm" onClick={() => navigateTo("authenticator")}>
          <QrCode size={14} /> Verify Certificate
        </button>
        <button className="btn btn-primary btn-sm" onClick={() => navigateTo("public-intake")}>
          <UserPlus size={14} /> Register Trainee
        </button>
      </div>
    </header>
  );
};

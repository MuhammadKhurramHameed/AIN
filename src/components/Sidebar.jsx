import React from 'react';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, Building2, ShieldCheck, Layers, UserPlus, QrCode, Users, CheckSquare, Video, FileText, Award, Network, Cpu, Kanban, BookOpen, Lock } from 'lucide-react';

const ICON_MAP = {
  LayoutDashboard,
  Building2,
  ShieldCheck,
  Layers,
  UserPlus,
  QrCode,
  Users,
  CheckSquare,
  Video,
  FileText,
  Award,
  Network,
  Cpu,
  Kanban,
  BookOpen,
  Lock
};

export const Sidebar = () => {
  const { roleConfig, currentView, navigateTo, currentUser } = useApp();

  return (
    <aside className="app-sidebar">
      <div className="sidebar-header">
        <a href="#" className="sidebar-brand" onClick={(e) => { e.preventDefault(); navigateTo(roleConfig.defaultView); }}>
          <div className="brand-icon-box">
            <Network size={22} />
          </div>
          <div className="brand-title-group">
            <h2>Synapse LMS</h2>
            <p>MoITT National AI</p>
          </div>
        </a>

        <div className="sidebar-role-badge">
          <span style={{ fontWeight: 600, color: "var(--primary)" }}>{roleConfig.label}</span>
          <span className="badge badge-primary">{roleConfig.code}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">Navigation Workspace</div>
        <ul className="nav-menu">
          {roleConfig.menu.map(item => {
            const IconComponent = ICON_MAP[item.icon] || LayoutDashboard;
            const isActive = currentView === item.id;
            return (
              <li key={item.id} className={`nav-item ${isActive ? "active" : ""}`}>
                <button onClick={() => navigateTo(item.id)}>
                  <IconComponent size={18} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile-card">
          <div className="user-avatar">{currentUser.avatar_initials}</div>
          <div className="user-info">
            <h4>{currentUser.name}</h4>
            <p>{currentUser.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

import React from 'react';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, Building2, ShieldCheck, Layers, UserPlus, QrCode, Users, CheckSquare, Video, FileText, Award, Network, Cpu, Kanban, BookOpen, Lock, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const { roleConfig, currentView, navigateTo, currentUser, isSidebarCollapsed, toggleSidebar } = useApp();

  return (
    <aside className={`app-sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header" style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="#" className="sidebar-brand" onClick={(e) => { e.preventDefault(); navigateTo(roleConfig.defaultView); }}>
            <div className="brand-icon-box">
              <Network size={22} />
            </div>
            {!isSidebarCollapsed && (
              <div className="brand-title-group">
                <h2>Synapse LMS</h2>
                <p>MoITT National AI</p>
              </div>
            )}
          </a>

          {/* Sidebar Collapse Toggle Button */}
          <button
            className="sidebar-collapse-btn"
            onClick={toggleSidebar}
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {!isSidebarCollapsed && (
          <div className="sidebar-role-badge">
            <span style={{ fontWeight: 600, color: "var(--primary)" }}>{roleConfig.label}</span>
            <span className="badge badge-primary">{roleConfig.code}</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {!isSidebarCollapsed && <div className="nav-section-title">Navigation Workspace</div>}
        <ul className="nav-menu">
          {roleConfig.menu.map(item => {
            const IconComponent = ICON_MAP[item.icon] || LayoutDashboard;
            const isActive = currentView === item.id;
            return (
              <li key={item.id} className={`nav-item ${isActive ? "active" : ""}`}>
                <button
                  onClick={() => navigateTo(item.id)}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <IconComponent size={18} />
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile-card">
          <div className="user-avatar">{currentUser.avatar_initials}</div>
          {!isSidebarCollapsed && (
            <div className="user-info">
              <h4>{currentUser.name}</h4>
              <p>{currentUser.email}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

import { Role } from "./types";

export const DELEGATION_RULES: Partial<Record<Role, Role[]>> = {
  super_admin: [
    "moitt_staff",
    "consortium_partner_admin",
    "consortium_partner_staff",
    "content_admin",
    "content_reviewer",
    "tutor",
    "trainee",
  ],
  moitt_staff: ["content_admin", "content_reviewer", "tutor", "trainee"],
  consortium_partner_admin: ["consortium_partner_staff"],
};

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  moitt_staff: "MoITT Staff",
  consortium_partner_admin: "Consortium Partner Admin",
  consortium_partner_staff: "Consortium Partner Staff",
  content_admin: "Content Administrator",
  content_reviewer: "Content Reviewer / Auditor",
  tutor: "Tutor",
  trainee: "Trainee",
};

// The platform is organized into four experiences. AI Control Center + Integrations +
// Workflow Engine live exclusively in the Super Admin portal — never surfaced to the
// other three, matching the "admin-controlled control plane, not an end-user feature"
// principle for AI/integration configuration.
export type Portal = "learner" | "trainer" | "staff" | "admin";

export const PORTAL_BY_ROLE: Record<Role, Portal> = {
  trainee: "learner",
  tutor: "trainer",
  moitt_staff: "staff",
  content_admin: "staff",
  content_reviewer: "staff",
  consortium_partner_admin: "staff",
  consortium_partner_staff: "staff",
  super_admin: "admin",
};

export const PORTAL_LABELS: Record<Portal, string> = {
  learner: "Learner Portal",
  trainer: "Trainer Portal",
  staff: "Programme & Staff Portal",
  admin: "Super Admin Control Plane",
};

export interface NavItem {
  to: string;
  label: string;
}

const ALL_NAV: Record<string, NavItem> = {
  dashboard: { to: "/dashboard", label: "Dashboard" },
  users: { to: "/users", label: "Staff & Users" },
  partners: { to: "/partners", label: "Consortium Partners" },
  courses: { to: "/courses", label: "Tracks & Courses" },
  cohorts: { to: "/cohorts", label: "Cohorts & Attendance" },
  questionBank: { to: "/question-bank", label: "Question Bank" },
  kanban: { to: "/kanban", label: "Kanban Board" },
  reports: { to: "/reports", label: "Reporting" },
  certificates: { to: "/certificates", label: "My Certificates" },
  aiControlCenter: { to: "/admin/ai", label: "AI Control Center" },
  integrations: { to: "/admin/integrations", label: "Integrations" },
  programmes: { to: "/admin/programmes", label: "Programmes" },
  security: { to: "/security", label: "Security" },
  auditLog: { to: "/admin/audit-log", label: "Audit Log" },
};

export const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  super_admin: [
    ALL_NAV.dashboard,
    ALL_NAV.programmes,
    ALL_NAV.users,
    ALL_NAV.partners,
    ALL_NAV.courses,
    ALL_NAV.cohorts,
    ALL_NAV.questionBank,
    ALL_NAV.kanban,
    ALL_NAV.reports,
    ALL_NAV.aiControlCenter,
    ALL_NAV.integrations,
    ALL_NAV.auditLog,
    ALL_NAV.security,
  ],
  moitt_staff: [
    ALL_NAV.dashboard,
    ALL_NAV.users,
    ALL_NAV.partners,
    ALL_NAV.courses,
    ALL_NAV.cohorts,
    ALL_NAV.questionBank,
    ALL_NAV.kanban,
    ALL_NAV.reports,
    ALL_NAV.security,
  ],
  consortium_partner_admin: [ALL_NAV.dashboard, ALL_NAV.users, ALL_NAV.reports, ALL_NAV.kanban],
  consortium_partner_staff: [ALL_NAV.dashboard, ALL_NAV.reports, ALL_NAV.kanban],
  content_admin: [ALL_NAV.dashboard, ALL_NAV.courses, ALL_NAV.cohorts, ALL_NAV.questionBank, ALL_NAV.kanban, ALL_NAV.security],
  content_reviewer: [ALL_NAV.dashboard, ALL_NAV.courses, ALL_NAV.questionBank, ALL_NAV.reports, ALL_NAV.kanban, ALL_NAV.security],
  tutor: [ALL_NAV.dashboard, ALL_NAV.courses, ALL_NAV.cohorts, ALL_NAV.kanban],
  trainee: [ALL_NAV.dashboard, ALL_NAV.courses, ALL_NAV.certificates],
};

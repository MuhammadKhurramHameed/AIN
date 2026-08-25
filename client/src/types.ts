export type Role =
  | "super_admin"
  | "moitt_staff"
  | "consortium_partner_admin"
  | "consortium_partner_staff"
  | "content_admin"
  | "content_reviewer"
  | "tutor"
  | "trainee";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  organizationId?: string;
  trackId?: string;
  region?: string;
  permissions?: string[];
  mfaEnabled?: boolean;
}

export interface Programme {
  id: string;
  name: string;
  slug: string;
  description?: string;
  targetParticipants?: number;
  genderTargetPct: number;
  status: "active" | "archived";
  trackCount: number;
  createdAt: string;
}

export interface Track {
  _id: string;
  programmeId: string;
  name: string;
  description?: string;
  order: number;
}

export interface ConsortiumPartner {
  _id: string;
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  status: "active" | "inactive";
}

export interface Course {
  _id: string;
  title: string;
  description?: string;
  trackId: Track | string;
  level: "level_1" | "level_2" | "level_3";
  status: "draft" | "published";
  tutors: { _id: string; name: string; email: string }[];
}

export interface Lesson {
  _id: string;
  courseId: string;
  title: string;
  type: "video" | "document" | "quiz";
  content?: string;
  url?: string;
  order: number;
}

export interface Enrollment {
  _id: string;
  userId: string;
  courseId: Course | string;
  progress: number;
  status: "active" | "completed" | "dropped";
}

export interface KanbanBoard {
  _id: string;
  name: string;
  scope: string;
  columns: { id: string; name: string; order: number }[];
}

export interface KanbanCard {
  _id: string;
  boardId: string;
  columnId: string;
  title: string;
  description?: string;
  assigneeId?: { _id: string; name: string; email: string } | string;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  order: number;
}

export interface ActivityItem {
  _id: string;
  type: string;
  message: string;
  actorName?: string;
  createdAt: string;
}

export interface Cohort {
  _id: string;
  courseId: { _id: string; title: string } | string;
  name: string;
  startDate: string;
  endDate: string;
  trainerIds: { _id: string; name: string; email: string }[];
  maxSize?: number;
  status: "planned" | "active" | "completed" | "cancelled";
}

export interface AttendanceSession {
  _id: string;
  cohortId: string;
  date: string;
  topic?: string;
}

export interface Report {
  _id: string;
  partnerId: { _id: string; name: string } | string;
  period: string;
  metrics: { enrolled: number; completed: number; femalePct: number; dropouts: number };
  narrative?: string;
  status: "draft" | "submitted" | "reviewed";
}

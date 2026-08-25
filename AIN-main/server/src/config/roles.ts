export const ROLES = [
  "super_admin",
  "moitt_staff",
  "consortium_partner_admin",
  "consortium_partner_staff",
  "content_admin",
  "content_reviewer",
  "tutor",
  "trainee",
] as const;

export type Role = (typeof ROLES)[number];

// Roles that may create staff accounts, and which roles they may create.
export const DELEGATION_RULES: Record<string, Role[]> = {
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

export const ADMIN_ROLES: Role[] = ["super_admin", "moitt_staff"];

export const STAKEHOLDER_ROLES: Role[] = [
  "super_admin",
  "moitt_staff",
  "consortium_partner_admin",
  "consortium_partner_staff",
  "content_admin",
  "content_reviewer",
  "tutor",
];

// Roles that see the programme-wide dashboard/activity feed rather than a scoped slice.
export const STAFF_ACTIVITY_ROLES: Role[] = [
  "super_admin",
  "moitt_staff",
  "content_admin",
  "content_reviewer",
  "tutor",
];

// The tender's 9 participant / track categories, seeded as Tracks.
export const DEFAULT_TRACKS = [
  "Students & Fresh Graduates",
  "Teaching Professionals",
  "Sectoral Professionals (Health, Agri, Fintech)",
  "Mid to C-Level Private Sector",
  "Government Officials & Public Servants",
  "Public Sector Secretarial Staff",
  "General Workforce",
  "Entrepreneurs & Startup Founders",
  "Freelancers & Remote Workers",
];

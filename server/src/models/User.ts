import { Schema, model, Types, Document } from "mongoose";
import { ROLES, Role } from "../config/roles";
import { PAKISTAN_REGIONS, PakistanRegion } from "../config/regions";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  organizationId?: Types.ObjectId;
  trackId?: Types.ObjectId;
  gender?: "female" | "male" | "other" | "prefer_not_to_say";
  category?: string;
  region?: PakistanRegion;
  phone?: string;
  // Trainer eligibility profile (tender requires 16yrs education, 3-5yrs relevant experience).
  educationYears?: number;
  experienceYears?: number;
  specialization?: string[];
  permissions: string[];
  status: "active" | "invited" | "disabled";
  mfaSecret?: string; // AES-256-GCM encrypted at rest, never sent to the client
  mfaEnabled: boolean;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ROLES, required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: "ConsortiumPartner" },
    trackId: { type: Schema.Types.ObjectId, ref: "Track" },
    gender: { type: String, enum: ["female", "male", "other", "prefer_not_to_say"] },
    category: { type: String },
    region: { type: String, enum: PAKISTAN_REGIONS, index: true },
    phone: { type: String },
    educationYears: { type: Number },
    experienceYears: { type: Number },
    specialization: { type: [String], default: [] },
    permissions: { type: [String], default: [] },
    status: { type: String, enum: ["active", "invited", "disabled"], default: "active" },
    mfaSecret: { type: String, select: false },
    mfaEnabled: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

userSchema.index({ role: 1, organizationId: 1 });

export const User = model<IUser>("User", userSchema);

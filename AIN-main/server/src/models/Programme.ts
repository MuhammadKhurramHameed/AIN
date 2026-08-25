import { Schema, model, Types, Document } from "mongoose";

export interface IProgramme extends Document {
  name: string;
  slug: string;
  description?: string;
  targetParticipants?: number;
  genderTargetPct: number;
  minTrainerEducationYears: number;
  minTrainerExperienceYears: number;
  status: "active" | "archived";
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IProgramme>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String },
    targetParticipants: { type: Number },
    genderTargetPct: { type: Number, default: 30 },
    minTrainerEducationYears: { type: Number, default: 16 },
    minTrainerExperienceYears: { type: Number, default: 3 },
    status: { type: String, enum: ["active", "archived"], default: "active" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Programme = model<IProgramme>("Programme", schema);

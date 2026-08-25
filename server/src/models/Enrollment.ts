import { Schema, model, Types, Document } from "mongoose";

export interface IEnrollment extends Document {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  cohortId?: Types.ObjectId;
  progress: number;
  status: "active" | "completed" | "dropped";
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IEnrollment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    cohortId: { type: Schema.Types.ObjectId, ref: "Cohort", index: true },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    status: { type: String, enum: ["active", "completed", "dropped"], default: "active" },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

schema.index({ userId: 1, courseId: 1 }, { unique: true });

export const Enrollment = model<IEnrollment>("Enrollment", schema);

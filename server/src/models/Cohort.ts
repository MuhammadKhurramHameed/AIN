import { Schema, model, Types, Document } from "mongoose";

export interface ICohort extends Document {
  courseId: Types.ObjectId;
  name: string;
  startDate: Date;
  endDate: Date;
  trainerIds: Types.ObjectId[];
  maxSize?: number;
  status: "planned" | "active" | "completed" | "cancelled";
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<ICohort>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    name: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    trainerIds: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
    maxSize: { type: Number },
    status: { type: String, enum: ["planned", "active", "completed", "cancelled"], default: "planned" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Cohort = model<ICohort>("Cohort", schema);

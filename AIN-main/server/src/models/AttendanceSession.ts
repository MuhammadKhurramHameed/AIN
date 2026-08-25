import { Schema, model, Types, Document } from "mongoose";

export interface IAttendanceSession extends Document {
  cohortId: Types.ObjectId;
  date: Date;
  topic?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IAttendanceSession>(
  {
    cohortId: { type: Schema.Types.ObjectId, ref: "Cohort", required: true, index: true },
    date: { type: Date, required: true },
    topic: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const AttendanceSession = model<IAttendanceSession>("AttendanceSession", schema);

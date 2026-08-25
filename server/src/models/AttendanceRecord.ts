import { Schema, model, Types, Document } from "mongoose";

export interface IAttendanceRecord extends Document {
  sessionId: Types.ObjectId;
  cohortId: Types.ObjectId;
  userId: Types.ObjectId;
  status: "present" | "absent" | "late" | "excused";
  markedBy: Types.ObjectId;
  markedAt: Date;
}

const schema = new Schema<IAttendanceRecord>({
  sessionId: { type: Schema.Types.ObjectId, ref: "AttendanceSession", required: true, index: true },
  cohortId: { type: Schema.Types.ObjectId, ref: "Cohort", required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  status: { type: String, enum: ["present", "absent", "late", "excused"], required: true },
  markedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  markedAt: { type: Date, default: Date.now },
});

schema.index({ sessionId: 1, userId: 1 }, { unique: true });

export const AttendanceRecord = model<IAttendanceRecord>("AttendanceRecord", schema);

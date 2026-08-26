import { Schema, model, Types, Document } from "mongoose";

export interface ICourse extends Document {
  title: string;
  description?: string;
  trackId: Types.ObjectId;
  level: "level_1" | "level_2" | "level_3";
  contentAdminId: Types.ObjectId;
  tutors: Types.ObjectId[];
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<ICourse>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    trackId: { type: Schema.Types.ObjectId, ref: "Track", required: true, index: true },
    level: { type: String, enum: ["level_1", "level_2", "level_3"], default: "level_1" },
    contentAdminId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tutors: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
  },
  { timestamps: true }
);

export const Course = model<ICourse>("Course", schema);

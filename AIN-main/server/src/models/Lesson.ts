import { Schema, model, Types, Document } from "mongoose";

export interface ILesson extends Document {
  courseId: Types.ObjectId;
  title: string;
  type: "video" | "document" | "quiz";
  content?: string;
  url?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<ILesson>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ["video", "document", "quiz"], default: "document" },
    content: { type: String },
    url: { type: String },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Lesson = model<ILesson>("Lesson", schema);

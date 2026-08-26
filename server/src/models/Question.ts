import { Schema, model, Types, Document } from "mongoose";
import crypto from "crypto";

export type QuestionType = "mcq" | "multi_select" | "true_false" | "short_answer";
export type Difficulty = "easy" | "medium" | "hard";
export type BloomLevel = "remember" | "understand" | "apply" | "analyze" | "evaluate" | "create";

export interface IQuestionOption {
  id: string;
  text: string;
}

export interface IQuestion extends Document {
  courseId: Types.ObjectId;
  text: string;
  type: QuestionType;
  options: IQuestionOption[]; // empty for short_answer
  correctOptionIds: string[]; // one id for mcq/true_false, 1+ for multi_select
  sampleAnswer?: string; // reference answer for short_answer (manually graded)
  difficulty: Difficulty;
  bloomLevel: BloomLevel;
  tags: string[];
  status: "draft" | "approved";
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const optionSchema = new Schema<IQuestionOption>(
  {
    id: { type: String, default: () => crypto.randomBytes(6).toString("hex") },
    text: { type: String, required: true },
  },
  { _id: false }
);

const schema = new Schema<IQuestion>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    text: { type: String, required: true },
    type: { type: String, enum: ["mcq", "multi_select", "true_false", "short_answer"], required: true },
    options: { type: [optionSchema], default: [] },
    correctOptionIds: { type: [String], default: [] },
    sampleAnswer: { type: String },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
    bloomLevel: {
      type: String,
      enum: ["remember", "understand", "apply", "analyze", "evaluate", "create"],
      default: "understand",
    },
    tags: { type: [String], default: [] },
    status: { type: String, enum: ["draft", "approved"], default: "approved" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Question = model<IQuestion>("Question", schema);

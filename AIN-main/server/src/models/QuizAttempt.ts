import { Schema, model, Types, Document } from "mongoose";

export interface ISnapshotQuestion {
  questionId?: Types.ObjectId; // absent for legacy inline questions
  text: string;
  type: "mcq" | "multi_select" | "true_false";
  options: { id: string; text: string }[];
  correctOptionIds: string[]; // server-only — never sent to the client while in_progress
}

export interface ISubmittedAnswer {
  questionIndex: number; // index into the attempt's own snapshot, not the bank
  selectedOptionIds: string[];
}

export interface IQuizAttempt extends Document {
  userId: Types.ObjectId;
  quizId: Types.ObjectId;
  status: "in_progress" | "submitted" | "expired";
  snapshot: ISnapshotQuestion[];
  answers: ISubmittedAnswer[];
  score?: number;
  passed?: boolean;
  startedAt: Date;
  submittedAt?: Date;
  createdAt: Date;
}

const optionSchema = new Schema({ id: String, text: String }, { _id: false });

const snapshotQuestionSchema = new Schema<ISnapshotQuestion>(
  {
    questionId: { type: Schema.Types.ObjectId, ref: "Question" },
    text: { type: String, required: true },
    type: { type: String, enum: ["mcq", "multi_select", "true_false"], default: "mcq" },
    options: { type: [optionSchema], default: [] },
    correctOptionIds: { type: [String], default: [] },
  },
  { _id: false }
);

const answerSchema = new Schema<ISubmittedAnswer>(
  { questionIndex: { type: Number, required: true }, selectedOptionIds: { type: [String], default: [] } },
  { _id: false }
);

const schema = new Schema<IQuizAttempt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true, index: true },
    status: { type: String, enum: ["in_progress", "submitted", "expired"], default: "in_progress" },
    snapshot: { type: [snapshotQuestionSchema], default: [] },
    answers: { type: [answerSchema], default: [] },
    score: { type: Number },
    passed: { type: Boolean },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const QuizAttempt = model<IQuizAttempt>("QuizAttempt", schema);

import { Schema, model, Types, Document } from "mongoose";

export interface IQuizQuestion {
  text: string;
  options: string[];
  correctIndex: number;
}

export interface IQuiz extends Document {
  lessonId: Types.ObjectId;
  title: string;
  passScore: number;
  questions: IQuizQuestion[]; // legacy inline authoring — still supported
  questionBankIds: Types.ObjectId[]; // pool mode: draw from the Question bank instead
  questionCount?: number; // how many to sample from questionBankIds per attempt
  timeLimitMinutes?: number; // server-enforced; omit for untimed
  maxAttempts?: number; // omit for unlimited
  randomizeOptions: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuizQuestion>(
  {
    text: { type: String, required: true },
    options: { type: [String], required: true },
    correctIndex: { type: Number, required: true },
  },
  { _id: false }
);

const schema = new Schema<IQuiz>(
  {
    lessonId: { type: Schema.Types.ObjectId, ref: "Lesson", required: true, index: true },
    title: { type: String, required: true },
    passScore: { type: Number, default: 60 },
    questions: { type: [questionSchema], default: [] },
    questionBankIds: { type: [Schema.Types.ObjectId], ref: "Question", default: [] },
    questionCount: { type: Number },
    timeLimitMinutes: { type: Number },
    maxAttempts: { type: Number },
    randomizeOptions: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Quiz = model<IQuiz>("Quiz", schema);

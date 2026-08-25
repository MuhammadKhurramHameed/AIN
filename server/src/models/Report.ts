import { Schema, model, Types, Document } from "mongoose";

export interface IReport extends Document {
  partnerId: Types.ObjectId;
  period: string; // e.g. "2026-08" or "2026-Q3"
  metrics: {
    enrolled: number;
    completed: number;
    femalePct: number;
    dropouts: number;
  };
  narrative?: string;
  status: "draft" | "submitted" | "reviewed";
  submittedBy: Types.ObjectId;
  reviewedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IReport>(
  {
    partnerId: { type: Schema.Types.ObjectId, ref: "ConsortiumPartner", required: true, index: true },
    period: { type: String, required: true },
    metrics: {
      enrolled: { type: Number, default: 0 },
      completed: { type: Number, default: 0 },
      femalePct: { type: Number, default: 0 },
      dropouts: { type: Number, default: 0 },
    },
    narrative: { type: String },
    status: { type: String, enum: ["draft", "submitted", "reviewed"], default: "draft" },
    submittedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

schema.index({ partnerId: 1, period: 1 }, { unique: true });

export const Report = model<IReport>("Report", schema);

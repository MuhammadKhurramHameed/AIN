import { Schema, model, Types, Document } from "mongoose";

export interface IAIUsageLog extends Document {
  providerId: Types.ObjectId;
  modelId: Types.ObjectId;
  capability: string;
  feature: string; // e.g. "lesson_assistant", "provider_test"
  actorId?: Types.ObjectId;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  latencyMs: number;
  success: boolean;
  errorMessage?: string;
  createdAt: Date;
}

const schema = new Schema<IAIUsageLog>({
  providerId: { type: Schema.Types.ObjectId, ref: "AIProvider", required: true, index: true },
  modelId: { type: Schema.Types.ObjectId, ref: "AIModel", required: true },
  capability: { type: String, required: true },
  feature: { type: String, required: true },
  actorId: { type: Schema.Types.ObjectId, ref: "User" },
  promptTokens: { type: Number },
  completionTokens: { type: Number },
  totalTokens: { type: Number },
  latencyMs: { type: Number, required: true },
  success: { type: Boolean, required: true },
  errorMessage: { type: String },
  createdAt: { type: Date, default: Date.now, index: true },
});

export const AIUsageLog = model<IAIUsageLog>("AIUsageLog", schema);

import { Schema, model, Types, Document } from "mongoose";
import { AI_CAPABILITIES, AICapability } from "../config/aiCapabilities";

export interface IAIModel extends Document {
  providerId: Types.ObjectId;
  name: string; // the actual model identifier sent to the provider API, e.g. "gpt-4o-mini"
  label: string; // human-friendly name shown in the UI
  capabilities: AICapability[];
  defaultForCapabilities: AICapability[]; // subset of `capabilities` this model is the default route for
  maxTokens: number;
  temperature: number;
  status: "active" | "disabled";
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IAIModel>(
  {
    providerId: { type: Schema.Types.ObjectId, ref: "AIProvider", required: true, index: true },
    name: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    capabilities: { type: [String], enum: AI_CAPABILITIES, default: [] },
    defaultForCapabilities: { type: [String], enum: AI_CAPABILITIES, default: [] },
    maxTokens: { type: Number, default: 800 },
    temperature: { type: Number, default: 0.4 },
    status: { type: String, enum: ["active", "disabled"], default: "active" },
  },
  { timestamps: true }
);

export const AIModel = model<IAIModel>("AIModel", schema);

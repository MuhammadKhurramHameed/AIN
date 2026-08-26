import { Schema, model, Types, Document } from "mongoose";

export type AIProviderType = "openai" | "azure_openai" | "openai_compatible" | "ollama" | "anthropic";

export interface IAIProvider extends Document {
  name: string;
  type: AIProviderType;
  baseUrl?: string; // required for azure_openai / openai_compatible / ollama; optional override for openai/anthropic
  apiKeyEncrypted: string;
  status: "active" | "disabled";
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IAIProvider>(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["openai", "azure_openai", "openai_compatible", "ollama", "anthropic"], required: true },
    baseUrl: { type: String },
    apiKeyEncrypted: { type: String, required: true },
    status: { type: String, enum: ["active", "disabled"], default: "active" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const AIProvider = model<IAIProvider>("AIProvider", schema);

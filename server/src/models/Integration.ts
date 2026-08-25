import { Schema, model, Types, Document } from "mongoose";

export type IntegrationCategory = "ai" | "communication" | "productivity" | "meetings" | "storage" | "analytics" | "identity" | "automation" | "lms_interop";

export interface IIntegration extends Document {
  category: IntegrationCategory;
  type: string; // e.g. "smtp", "zoom", "s3" — the connector this config is for
  name: string;
  config: Record<string, unknown>; // non-secret configuration (host, port, from-address, ...)
  secretsEncrypted?: string; // JSON-stringified secret fields, encrypted as one blob
  status: "active" | "disabled" | "error";
  lastTestedAt?: Date;
  lastError?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IIntegration>(
  {
    category: {
      type: String,
      enum: ["ai", "communication", "productivity", "meetings", "storage", "analytics", "identity", "automation", "lms_interop"],
      required: true,
    },
    type: { type: String, required: true },
    name: { type: String, required: true },
    config: { type: Schema.Types.Mixed, default: {} },
    secretsEncrypted: { type: String },
    status: { type: String, enum: ["active", "disabled", "error"], default: "active" },
    lastTestedAt: { type: Date },
    lastError: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Integration = model<IIntegration>("Integration", schema);

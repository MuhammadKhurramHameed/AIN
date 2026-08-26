import { Schema, model, Types, Document } from "mongoose";

export type ActivityScope = "global" | "partner" | "user";

export interface IActivityLog extends Document {
  type: string;
  message: string;
  actorId?: Types.ObjectId;
  actorName?: string;
  /** The actor's home region, when known (e.g. a trainee) — lets the regional map pulse live. */
  region?: string;
  scope: ActivityScope;
  scopeId?: string;
  createdAt: Date;
}

const schema = new Schema<IActivityLog>({
  type: { type: String, required: true },
  message: { type: String, required: true },
  actorId: { type: Schema.Types.ObjectId, ref: "User" },
  actorName: { type: String },
  region: { type: String },
  scope: { type: String, enum: ["global", "partner", "user"], required: true, index: true },
  scopeId: { type: String, index: true },
  createdAt: { type: Date, default: Date.now },
});

schema.index({ scope: 1, scopeId: 1, createdAt: -1 });

export const ActivityLog = model<IActivityLog>("ActivityLog", schema);

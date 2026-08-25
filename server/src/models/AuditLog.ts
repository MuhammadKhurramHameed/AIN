import { Schema, model, Types, Document } from "mongoose";

export interface IAuditLog extends Document {
  actorId?: Types.ObjectId;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  ip?: string;
  success: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const schema = new Schema<IAuditLog>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    actorEmail: { type: String },
    actorRole: { type: String },
    action: { type: String, required: true, index: true },
    targetType: { type: String },
    targetId: { type: String },
    ip: { type: String },
    success: { type: Boolean, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

schema.index({ createdAt: -1 });

export const AuditLog = model<IAuditLog>("AuditLog", schema);

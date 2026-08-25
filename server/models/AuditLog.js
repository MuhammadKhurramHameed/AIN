import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  timestamp: { type: String, required: true },
  actor: { type: String, required: true },
  action: { type: String, required: true },
  entity: { type: String, required: true },
  ip: { type: String, required: true },
  payload: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);

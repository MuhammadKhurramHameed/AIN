import mongoose from 'mongoose';

const programmeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  targetParticipants: { type: Number, default: 20000 },
  targetFemaleRatio: { type: Number, default: 0.30 },
  registeredCount: { type: Number, default: 14850 },
  femaleRegisteredCount: { type: Number, default: 5120 },
  verifiedHoursTotal: { type: Number, default: 284500 },
  certificatesIssued: { type: Number, default: 8420 },
  startDate: { type: String, default: '2026-01-15' },
  endDate: { type: String, default: '2026-12-31' },
  status: { type: String, default: 'ACTIVE' }
}, { timestamps: true });

export const Programme = mongoose.model('Programme', programmeSchema);

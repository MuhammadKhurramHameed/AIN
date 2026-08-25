import mongoose from 'mongoose';

const cohortSchema = new mongoose.Schema({
  name: { type: String, required: true },
  institution: { type: String, required: true }, // e.g. NUST, FAST, COMSATS
  trackTitle: { type: String, required: true },
  trainerName: { type: String, required: true },
  enrolled: { type: Number, default: 0 },
  capacity: { type: Number, default: 250 },
  startDate: { type: String },
  endDate: { type: String },
  status: { type: String, enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED'], default: 'IN_PROGRESS' }
}, { timestamps: true });

export const Cohort = mongoose.model('Cohort', cohortSchema);

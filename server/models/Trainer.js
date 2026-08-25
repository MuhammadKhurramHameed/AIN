import mongoose from 'mongoose';

const trainerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  cnic: { type: String, required: true, unique: true },
  consortiumPartner: { type: String, required: true },
  specialization: { type: String, required: true },
  assignedCohorts: [{ type: String }],
  status: { type: String, default: 'ACTIVE' }
}, { timestamps: true });

export const Trainer = mongoose.model('Trainer', trainerSchema);

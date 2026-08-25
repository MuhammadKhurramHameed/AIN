import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  certificateNumber: { type: String, required: true, unique: true },
  traineeName: { type: String, required: true },
  cnic: { type: String, required: true },
  trackTitle: { type: String, required: true },
  hoursCompleted: { type: Number, required: true },
  finalScore: { type: Number, required: true },
  issueDate: { type: String, required: true },
  consortiumPartner: { type: String, required: true },
  digitalSignature: { type: String, required: true },
  qrUrl: { type: String, required: true }
}, { timestamps: true });

export const Certificate = mongoose.model('Certificate', certificateSchema);

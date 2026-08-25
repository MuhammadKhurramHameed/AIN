import mongoose from 'mongoose';

const integrationSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. NADRA CNIC Verifier API, Zoom Live Stream SDK, Turnitin Plagiarism Engine
  serviceKey: { type: String, required: true, unique: true },
  category: { type: String, required: true }, // Identity, Video, Security, Database
  status: { type: String, enum: ['CONNECTED', 'DEGRADED', 'DISCONNECTED'], default: 'CONNECTED' },
  endpointUrl: { type: String },
  lastSyncedAt: { type: String }
}, { timestamps: true });

export const Integration = mongoose.model('Integration', integrationSchema);

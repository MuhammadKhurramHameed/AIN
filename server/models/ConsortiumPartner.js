import mongoose from 'mongoose';

const consortiumPartnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  mouRef: { type: String, required: true },
  allocatedCapacity: { type: Number, required: true },
  enrolled: { type: Number, default: 0 },
  activeCohorts: { type: Number, default: 0 },
  status: { type: String, default: 'ACTIVE' }
}, { timestamps: true });

export const ConsortiumPartner = mongoose.model('ConsortiumPartner', consortiumPartnerSchema);

import mongoose from 'mongoose';

const trackSchema = new mongoose.Schema({
  number: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  levelCode: { type: String, required: true },
  hours: { type: Number, required: true },
  modules: [{ type: String }],
  capstone: { type: String, required: true },
  enrolled: { type: Number, default: 0 },
  activeCohorts: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Track = mongoose.model('Track', trackSchema);

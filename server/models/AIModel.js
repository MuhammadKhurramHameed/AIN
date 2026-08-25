import mongoose from 'mongoose';

const aiModelSchema = new mongoose.Schema({
  modelId: { type: String, required: true, unique: true }, // e.g. gpt-4o, claude-3-5-sonnet, gemini-1.5-pro, llama-3-70b
  name: { type: String, required: true },
  provider: { type: String, required: true },
  contextWindow: { type: Number, default: 128000 },
  costPer1kTokens: { type: Number, default: 0.005 },
  purpose: { type: String, default: 'General AI Pedagogy & Code Evaluation' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const AIModel = mongoose.model('AIModel', aiModelSchema);

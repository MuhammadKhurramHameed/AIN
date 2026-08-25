import mongoose from 'mongoose';

const aiProviderSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. OpenAI, Anthropic, Google Gemini, Local Ollama
  providerId: { type: String, required: true, unique: true },
  apiKeyMasked: { type: String, default: 'sk-proj-••••••••••••' },
  baseUrl: { type: String, default: 'https://api.openai.com/v1' },
  status: { type: String, enum: ['ACTIVE', 'DEGRADED', 'OFFLINE'], default: 'ACTIVE' },
  monthlyQuotaTokens: { type: Number, default: 50000000 },
  usedTokens: { type: Number, default: 12450000 },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

export const AIProvider = mongoose.model('AIProvider', aiProviderSchema);

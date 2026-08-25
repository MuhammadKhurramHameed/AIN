import express from 'express';
import { AIProvider } from '../models/AIProvider.js';
import { AIModel } from '../models/AIModel.js';

const router = express.Router();

// GET all AI Providers & Models
router.get('/providers', async (req, res) => {
  try {
    const providers = await AIProvider.find();
    const models = await AIModel.find();
    res.json({ success: true, providers, models });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST add AI Provider
router.post('/providers', async (req, res) => {
  try {
    const { name, providerId, apiKeyMasked, baseUrl } = req.body;
    const provider = await AIProvider.create({
      name,
      providerId: providerId || name.toLowerCase().replace(/\s+/g, '-'),
      apiKeyMasked: apiKeyMasked || 'sk-key-••••••••',
      baseUrl: baseUrl || 'https://api.openai.com/v1'
    });
    res.status(201).json({ success: true, provider });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

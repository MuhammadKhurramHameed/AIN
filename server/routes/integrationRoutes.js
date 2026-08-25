import express from 'express';
import { Integration } from '../models/Integration.js';

const router = express.Router();

// GET all Integrations
router.get('/', async (req, res) => {
  try {
    const integrations = await Integration.find();
    res.json({ success: true, count: integrations.length, data: integrations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST toggle Integration status
router.put('/:id/toggle', async (req, res) => {
  try {
    const item = await Integration.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Integration not found' });
    item.status = item.status === 'CONNECTED' ? 'DISCONNECTED' : 'CONNECTED';
    item.lastSyncedAt = new Date().toISOString();
    await item.save();
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

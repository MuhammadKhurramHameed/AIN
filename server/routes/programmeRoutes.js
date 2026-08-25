import express from 'express';
import { Programme } from '../models/Programme.js';

const router = express.Router();

// GET Executive Summary & Quota Totals
router.get('/summary', async (req, res) => {
  try {
    const programme = await Programme.findOne();
    if (!programme) {
      return res.status(404).json({ success: false, message: 'Programme not found' });
    }

    const femalePct = ((programme.femaleRegisteredCount / programme.registeredCount) * 100).toFixed(1);

    res.json({
      success: true,
      data: {
        ...programme.toObject(),
        femalePct
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

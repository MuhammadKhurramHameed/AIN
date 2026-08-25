import express from 'express';
import { ConsortiumPartner } from '../models/ConsortiumPartner.js';

const router = express.Router();

// GET all consortium partners
router.get('/', async (req, res) => {
  try {
    const partners = await ConsortiumPartner.find().sort({ enrolled: -1 });
    res.json({ success: true, count: partners.length, data: partners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create consortium partner
router.post('/', async (req, res) => {
  try {
    const { name, email, mouRef, allocatedCapacity } = req.body;
    const partner = await ConsortiumPartner.create({
      name,
      email,
      mouRef: mouRef || `MOU-MoITT-2026-${Math.floor(100 + Math.random() * 900)}`,
      allocatedCapacity: parseInt(allocatedCapacity) || 2000,
      enrolled: 0,
      activeCohorts: 0
    });
    res.status(201).json({ success: true, message: 'Consortium partner created', data: partner });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

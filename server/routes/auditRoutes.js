import express from 'express';
import { AuditLog } from '../models/AuditLog.js';

const router = express.Router();

// GET all audit logs
router.get('/', async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

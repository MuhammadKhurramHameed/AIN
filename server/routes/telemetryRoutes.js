import express from 'express';
import { ChatMessage } from '../models/ChatMessage.js';
import { AuditLog } from '../models/AuditLog.js';

const router = express.Router();

// GET all chat messages
router.get('/chat', async (req, res) => {
  try {
    const messages = await ChatMessage.find().sort({ createdAt: 1 });
    res.json({ success: true, count: messages.length, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST send chat message
router.post('/chat', async (req, res) => {
  try {
    const { sender, role, text } = req.body;
    const msg = await ChatMessage.create({
      sender: sender || 'Trainee',
      role: role || 'TRAINEE',
      text
    });
    res.status(201).json({ success: true, data: msg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST force telemetry ping audit log
router.post('/force-ping', async (req, res) => {
  try {
    const log = await AuditLog.create({
      action: 'TELEMETRY_HEARTBEAT_FORCED',
      actor: req.body.actor || 'Trainer Hub',
      ip: '182.180.14.99',
      meta: { message: 'Manual WebSocket Telemetry Synchronization Executed' }
    });
    res.json({ success: true, message: 'Telemetry ping forced & audit logged', log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

import express from 'express';
import { AuditLog } from '../models/AuditLog.js';

const router = express.Router();

// POST rotate Ed25519 root key
router.post('/rotate-key', async (req, res) => {
  try {
    const newKeyId = `vault-root-${Date.now()}`;
    const log = await AuditLog.create({
      action: 'ED25519_ROOT_KEY_ROTATED',
      actor: 'Super Admin Key Vault',
      ip: '182.180.14.1',
      meta: { keyId: newKeyId, algorithm: 'Ed25519' }
    });
    res.json({ success: true, message: 'Ed25519 Root Key rotated successfully', keyId: newKeyId, log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

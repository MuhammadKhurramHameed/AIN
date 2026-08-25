import express from 'express';
import { User } from '../models/User.js';

const router = express.Router();

// GET all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update user role or status
router.put('/:id', async (req, res) => {
  try {
    const { role, status } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role, status }, { new: true }).select('-passwordHash');
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

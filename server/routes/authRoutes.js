import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const router = express.Router();

// Login API
router.post('/login', async (req, res) => {
  try {
    const { identity, password } = req.body;
    const user = await User.findOne({
      $or: [{ email: identity }, { cnic: identity }]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role, cnic: user.cnic },
      process.env.JWT_SECRET || 'naiai_lms_super_secret_jwt_key_2026_moitt_secure',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.fullName,
        email: user.email,
        cnic: user.cnic,
        role: user.role,
        avatarInitials: user.avatarInitials
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

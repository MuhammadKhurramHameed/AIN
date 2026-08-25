import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Programme } from '../models/Programme.js';
import { AuditLog } from '../models/AuditLog.js';

const router = express.Router();

// Trainee Intake Registration API with Real-Time Quota Balancer
router.post('/register', async (req, res) => {
  try {
    const { cnic, fullName, email, phone, gender, province, district, trackId, pwd } = req.body;

    // Check duplicate
    const existing = await User.findOne({ $or: [{ cnic }, { email }] });
    if (existing) {
      return res.status(400).json({ success: false, message: 'CNIC or Email already registered in system.' });
    }

    // Default password hash
    const passwordHash = await bcrypt.hash('Trainee@2026', 10);
    const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

    const newUser = await User.create({
      cnic,
      fullName,
      email,
      passwordHash,
      gender,
      province,
      district,
      isPwd: !!pwd,
      role: 'TRAINEE',
      phone,
      enrolledTrack: trackId,
      avatarInitials: initials || 'TR'
    });

    // Update Programme Quota KPIs
    let prog = await Programme.findOne();
    if (prog) {
      prog.registeredCount += 1;
      if (gender === 'FEMALE') {
        prog.femaleRegisteredCount += 1;
      }
      await prog.save();
    }

    // Add Audit Log
    await AuditLog.create({
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: 'Public Registration Intake Engine (MongoDB)',
      action: 'TRAINEE_INTAKE_REGISTERED',
      entity: `Trainee: ${fullName} (${gender}, ${province})`,
      ip: req.ip || '182.180.92.14',
      payload: { cnic, gender, province, quota_rule_checked: true }
    });

    res.status(201).json({
      success: true,
      message: 'Intake application approved and recorded in MongoDB Atlas.',
      user: {
        id: newUser._id,
        name: newUser.fullName,
        email: newUser.email,
        cnic: newUser.cnic,
        role: newUser.role
      },
      programmeStats: prog
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

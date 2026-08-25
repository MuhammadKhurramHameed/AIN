import express from 'express';
import bcrypt from 'bcryptjs';
import { Trainer } from '../models/Trainer.js';
import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';

const router = express.Router();

// GET all trainers
router.get('/', async (req, res) => {
  try {
    const trainers = await Trainer.find().sort({ createdAt: -1 });
    res.json({ success: true, count: trainers.length, data: trainers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST add new trainer (Admin or Consortium)
router.post('/', async (req, res) => {
  try {
    const { fullName, email, phone, cnic, consortiumPartner, specialization } = req.body;

    const existing = await Trainer.findOne({ $or: [{ email }, { cnic }] });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Trainer with this Email or CNIC already exists.' });
    }

    const trainer = await Trainer.create({
      fullName,
      email,
      phone,
      cnic,
      consortiumPartner: consortiumPartner || 'National University of Sciences & Technology (NUST)',
      specialization: specialization || 'Applied MLOps & Deep Learning',
      assignedCohorts: [`Cohort-${Math.floor(10 + Math.random() * 90)}`]
    });

    // Also register user account for Trainer
    const passwordHash = await bcrypt.hash('Trainer@2026', 10);
    const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

    await User.create({
      cnic,
      fullName,
      email,
      passwordHash,
      gender: 'MALE',
      province: 'Islamabad Capital Territory',
      district: 'Islamabad',
      role: 'TRAINER',
      phone,
      avatarInitials: initials
    });

    // Log Audit
    await AuditLog.create({
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: 'Trainer Management System',
      action: 'TRAINER_REGISTERED',
      entity: `Trainer: ${fullName} (${consortiumPartner})`,
      ip: req.ip || '127.0.0.1',
      payload: { email, cnic, consortiumPartner, specialization }
    });

    res.status(201).json({ success: true, message: 'Trainer registered successfully.', data: trainer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

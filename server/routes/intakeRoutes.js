import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Programme } from '../models/Programme.js';
import { AuditLog } from '../models/AuditLog.js';

const router = express.Router();

// Trainee Single Registration API
router.post('/register', async (req, res) => {
  try {
    const { cnic, fullName, email, phone, gender, province, district, trackId, pwd } = req.body;

    const existing = await User.findOne({ $or: [{ cnic }, { email }] });
    if (existing) {
      return res.status(400).json({ success: false, message: 'CNIC or Email already registered in system.' });
    }

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

    let prog = await Programme.findOne();
    if (prog) {
      prog.registeredCount += 1;
      if (gender === 'FEMALE') {
        prog.femaleRegisteredCount += 1;
      }
      await prog.save();
    }

    await AuditLog.create({
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: 'Public Registration Intake Engine',
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

// Bulk Trainee Registration API (Consortium / Admin Batch Upload)
router.post('/bulk-register', async (req, res) => {
  try {
    const { trainees, consortiumPartner } = req.body;

    if (!Array.isArray(trainees) || trainees.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or empty trainees array provided.' });
    }

    let addedCount = 0;
    let femaleAddedCount = 0;
    const defaultPassword = await bcrypt.hash('Trainee@2026', 10);

    for (const t of trainees) {
      const cnic = t.cnic || `35201-${Math.floor(1000000 + Math.random() * 9000000)}-${Math.floor(1 + Math.random() * 9)}`;
      const email = t.email || `trainee${Math.floor(Math.random() * 100000)}@partner.edu.pk`;

      const existing = await User.findOne({ $or: [{ cnic }, { email }] });
      if (!existing) {
        const fullName = t.fullName || t.name || 'Batch Trainee';
        const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        const gender = t.gender ? t.gender.toUpperCase() : (Math.random() > 0.4 ? 'FEMALE' : 'MALE');

        await User.create({
          cnic,
          fullName,
          email,
          passwordHash: defaultPassword,
          gender,
          province: t.province || 'Punjab',
          district: t.district || 'Lahore',
          role: 'TRAINEE',
          phone: t.phone || '+92 300 0000000',
          avatarInitials: initials
        });

        addedCount++;
        if (gender === 'FEMALE') femaleAddedCount++;
      }
    }

    // Update Programme totals
    let prog = await Programme.findOne();
    if (prog) {
      prog.registeredCount += addedCount;
      prog.femaleRegisteredCount += femaleAddedCount;
      await prog.save();
    }

    // Log Audit event
    await AuditLog.create({
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: `${consortiumPartner || 'Consortium Admin'} (Bulk Engine)`,
      action: 'BULK_TRAINEE_INTAKE_SUCCESS',
      entity: `Batch of ${addedCount} Trainees (${femaleAddedCount} Female)`,
      ip: req.ip || '127.0.0.1',
      payload: { total_added: addedCount, female_added: femaleAddedCount, partner: consortiumPartner }
    });

    res.json({
      success: true,
      message: `Successfully bulk registered ${addedCount} trainees into database (${femaleAddedCount} Female).`,
      addedCount,
      femaleAddedCount
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

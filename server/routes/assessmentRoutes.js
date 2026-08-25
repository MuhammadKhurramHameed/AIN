import express from 'express';
import { QuizAttempt } from '../models/QuizAttempt.js';
import { Certificate } from '../models/Certificate.js';

const router = express.Router();

// POST Submit Timed Assessment
router.post('/submit', async (req, res) => {
  try {
    const { traineeCnic, traineeName, score, totalQuestions } = req.body;
    const passed = (score / (totalQuestions || 5)) >= 0.6; // 60% passing mark

    let cert = null;
    if (passed) {
      const hash = `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`;
      cert = await Certificate.create({
        certificateId: `NAIAI-CERT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        traineeCnic: traineeCnic || '35201-1122334-6',
        traineeName: traineeName || 'Fatima Khan',
        trackTitle: 'Track 1: Applied MLOps (Level 2: Applied)',
        consortiumPartner: 'National University of Sciences & Technology (NUST)',
        ed25519Signature: `ed25519_sig_${hash}`,
        verifyUrl: `http://localhost:5173/?verify=${hash}`
      });
    }

    const attempt = await QuizAttempt.create({
      traineeCnic: traineeCnic || '35201-1122334-6',
      traineeName: traineeName || 'Fatima Khan',
      score,
      totalQuestions: totalQuestions || 5,
      passed,
      certificateRef: cert ? cert.certificateId : null
    });

    res.json({ success: true, attempt, certificate: cert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

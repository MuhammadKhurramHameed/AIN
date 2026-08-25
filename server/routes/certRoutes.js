import express from 'express';
import { Certificate } from '../models/Certificate.js';

const router = express.Router();

// GET Certificate Search by ID or CNIC
router.get('/verify/:query', async (req, res) => {
  try {
    const query = req.params.query.trim().toUpperCase();
    const cert = await Certificate.findOne({
      $or: [
        { certificateNumber: query },
        { cnic: query }
      ]
    });

    if (!cert) {
      return res.status(404).json({
        success: false,
        message: `Certificate record matching '${query}' not found in MongoDB verification database.`
      });
    }

    res.json({
      success: true,
      data: {
        certificate_number: cert.certificateNumber,
        trainee_name: cert.traineeName,
        cnic: cert.cnic,
        track_title: cert.trackTitle,
        hours_completed: cert.hoursCompleted,
        final_score: cert.finalScore,
        issue_date: cert.issueDate,
        consortium_partner: cert.consortiumPartner,
        digital_signature: cert.digitalSignature,
        qr_url: cert.qrUrl
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

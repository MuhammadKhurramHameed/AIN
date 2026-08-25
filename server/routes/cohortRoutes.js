import express from 'express';
import { Cohort } from '../models/Cohort.js';

const router = express.Router();

// GET all cohorts
router.get('/', async (req, res) => {
  try {
    const cohorts = await Cohort.find().sort({ createdAt: -1 });
    res.json({ success: true, count: cohorts.length, data: cohorts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create cohort
router.post('/', async (req, res) => {
  try {
    const { name, institution, trackTitle, trainerName, capacity } = req.body;
    const cohort = await Cohort.create({
      name,
      institution: institution || 'NUST',
      trackTitle: trackTitle || 'Track 1: Applied MLOps',
      trainerName: trainerName || 'Dr. Zeeshan Haider',
      capacity: capacity || 250,
      enrolled: 0,
      status: 'IN_PROGRESS'
    });
    res.status(201).json({ success: true, data: cohort });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

import express from 'express';
import { Track } from '../models/Track.js';

const router = express.Router();

// GET all 9 curriculum tracks
router.get('/', async (req, res) => {
  try {
    const tracks = await Track.find().sort({ number: 1 });
    res.json({ success: true, count: tracks.length, data: tracks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

import express from 'express';
import { Question } from '../models/Question.js';

const router = express.Router();

// GET all Questions
router.get('/', async (req, res) => {
  try {
    const questions = await Question.find().sort({ trackNumber: 1 });
    res.json({ success: true, count: questions.length, data: questions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST add Question
router.post('/', async (req, res) => {
  try {
    const question = await Question.create(req.body);
    res.status(201).json({ success: true, data: question });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

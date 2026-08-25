import express from 'express';
import { KanbanCard } from '../models/KanbanCard.js';

const router = express.Router();

// GET all Kanban Cards
router.get('/', async (req, res) => {
  try {
    const cards = await KanbanCard.find().sort({ createdAt: -1 });
    res.json({ success: true, count: cards.length, data: cards });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create Kanban Card
router.post('/', async (req, res) => {
  try {
    const card = await KanbanCard.create(req.body);
    res.status(201).json({ success: true, data: card });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update Kanban Card column
router.put('/:id', async (req, res) => {
  try {
    const card = await KanbanCard.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: card });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

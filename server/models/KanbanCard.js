import mongoose from 'mongoose';

const kanbanCardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  trackId: { type: String, default: 'Track 1' },
  column: { type: String, enum: ['BACKLOG', 'IN_REVIEW', 'APPROVED', 'PUBLISHED'], default: 'BACKLOG' },
  assignee: { type: String, required: true },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
  dueDate: { type: String },
  tags: [{ type: String }],
  notes: { type: String }
}, { timestamps: true });

export const KanbanCard = mongoose.model('KanbanCard', kanbanCardSchema);

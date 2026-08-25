import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  trackNumber: { type: Number, required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['MCQ', 'CODE', 'SHORT_ANSWER'], default: 'MCQ' },
  difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], default: 'MEDIUM' },
  options: [{ type: String }],
  correctAnswer: { type: mongoose.Schema.Types.Mixed, required: true },
  explanation: { type: String },
  points: { type: Number, default: 10 }
}, { timestamps: true });

export const Question = mongoose.model('Question', questionSchema);

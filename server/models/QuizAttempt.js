import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema({
  traineeCnic: { type: String, required: true },
  traineeName: { type: String, required: true },
  trackTitle: { type: String, default: 'Track 1: Applied MLOps' },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, default: 5 },
  passed: { type: Boolean, required: true },
  certificateRef: { type: String }
}, { timestamps: true });

export const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);

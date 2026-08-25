import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  cnic: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  gender: { type: String, enum: ['MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY'], required: true },
  province: { type: String, required: true },
  district: { type: String, required: true },
  isPwd: { type: Boolean, default: false },
  pwdDetails: { type: String },
  role: {
    type: String,
    enum: ['SUPER_ADMIN', 'MOITT_AUDITOR', 'CONSORTIUM_ADMIN', 'TRAINER', 'CONTENT_REVIEWER', 'TRAINEE'],
    required: true
  },
  phone: { type: String },
  profileStatus: { type: String, default: 'ACTIVE' },
  verifiedHours: { type: Number, default: 0 },
  requiredHours: { type: Number, default: 24 },
  enrolledTrack: { type: String },
  cohort: { type: String },
  avatarInitials: { type: String }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);

import mongoose from 'mongoose';

const reportScheduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: 'National AI Executive Briefing'
  },
  reportType: {
    type: String,
    required: true,
    enum: ['FULL_EXECUTIVE', 'TRAINEE_CAPACITY', 'FEMALE_QUOTA', 'TELEMETRY_HOURS', 'CERT_REGISTRY'],
    default: 'FULL_EXECUTIVE'
  },
  frequency: {
    type: String,
    required: true,
    enum: ['DAILY', 'EVERY_6_HOURS', 'EVERY_12_HOURS', 'EVERY_24_HOURS', 'CUSTOM_TIME'],
    default: 'DAILY'
  },
  scheduledTime: {
    type: String,
    required: true,
    default: '18:00' // HH:mm format
  },
  actionType: {
    type: String,
    enum: ['DOWNLOAD_ONLY', 'EMAIL_ONLY', 'BOTH'],
    default: 'BOTH'
  },
  recipientEmails: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  emailSubject: {
    type: String,
    default: 'MoITT National AI Capacity Initiative — Automated Executive KPI Report'
  },
  notes: {
    type: String,
    default: 'Automated executive dispatch from Synapse LMS Control Plane.'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastDispatchedAt: {
    type: Date,
    default: null
  },
  dispatchHistory: [{
    dispatchedAt: { type: Date, default: Date.now },
    reportType: { type: String },
    actionType: { type: String },
    recipients: [String],
    status: { type: String, enum: ['SUCCESS', 'PARTIAL', 'FAILED'], default: 'SUCCESS' },
    message: { type: String }
  }]
}, {
  timestamps: true
});

export const ReportSchedule = mongoose.model('ReportSchedule', reportScheduleSchema);

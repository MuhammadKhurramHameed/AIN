import mongoose from 'mongoose';

const ticketMessageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  sender: { type: String, required: true },
  role: { type: String, required: true },
  avatarInitials: { type: String, default: 'US' },
  text: { type: String, required: true },
  isInternalNote: { type: Boolean, default: false },
  attachmentUrl: { type: String, default: '' },
  timestamp: { type: String, required: true }
}, { _id: false });

const ticketSchema = new mongoose.Schema({
  ticketId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  title: { 
    type: String, 
    required: true,
    trim: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  category: {
    type: String,
    enum: [
      'TECHNICAL', 
      'COURSE_QUERY', 
      'CERTIFICATE', 
      'CONSORTIUM_OPS', 
      'CONTENT_REVIEW', 
      'COMPLIANCE', 
      'GENERAL'
    ],
    default: 'GENERAL',
    required: true
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM',
    required: true
  },
  status: {
    type: String,
    enum: ['OPEN', 'IN_PROGRESS', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED'],
    default: 'OPEN',
    required: true
  },
  createdBy: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['SUPER_ADMIN', 'MOITT_AUDITOR', 'CONSORTIUM_ADMIN', 'TRAINER', 'CONTENT_REVIEWER', 'TRAINEE'],
      required: true 
    },
    email: { type: String, required: true },
    avatarInitials: { type: String, default: 'ST' },
    cnic: { type: String },
    track: { type: String },
    cohort: { type: String },
    consortiumPartner: { type: String }
  },
  assignedTo: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    email: { type: String },
    desk: { type: String, default: 'Central Helpdesk' }
  },
  relatedTrack: { type: String, default: '' },
  relatedCohort: { type: String, default: '' },
  attachmentUrl: { type: String, default: '' },
  tags: [{ type: String }],
  messages: [ticketMessageSchema],
  resolutionNote: { type: String, default: '' },
  resolvedBy: {
    name: { type: String },
    role: { type: String },
    email: { type: String }
  },
  resolvedAt: { type: Date },
  slaDeadline: { type: String },
  slaBreached: { type: Boolean, default: false }
}, { timestamps: true });

export const Ticket = mongoose.model('Ticket', ticketSchema);


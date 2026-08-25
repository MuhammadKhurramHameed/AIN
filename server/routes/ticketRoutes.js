import express from 'express';
import { Ticket } from '../models/Ticket.js';
import { AuditLog } from '../models/AuditLog.js';

const router = express.Router();

// Helper: Smart Auto-Routing Desk Resolver
const resolveDeskAssignment = (category, requestedAssignee) => {
  if (requestedAssignee && requestedAssignee.id) {
    return requestedAssignee;
  }

  switch (category) {
    case 'COURSE_QUERY':
      return {
        id: 'usr-trainer-04',
        name: 'Dr. Zeeshan Haider',
        role: 'TRAINER',
        email: 'z.haider@nust.edu.pk',
        desk: 'Lead Trainer & Academic SME Desk'
      };
    case 'CERTIFICATE':
      return {
        id: 'usr-auditor-02',
        name: 'Engr. Ayesha Malik',
        role: 'MOITT_AUDITOR',
        email: 'auditor.ai@moitt.gov.pk',
        desk: 'MoITT Credential Verification Desk'
      };
    case 'CONSORTIUM_OPS':
      return {
        id: 'usr-partner-03',
        name: 'Prof. Tariq Hassan',
        role: 'CONSORTIUM_ADMIN',
        email: 'tariq.hassan@nust.edu.pk',
        desk: 'Consortium Operations Liaison'
      };
    case 'CONTENT_REVIEW':
      return {
        id: 'usr-reviewer-05',
        name: 'Dr. Sara Ahmed',
        role: 'CONTENT_REVIEWER',
        email: 'sara.ahmed@naiai.gov.pk',
        desk: 'Curriculum & Content Quality Desk'
      };
    case 'TECHNICAL':
    case 'COMPLIANCE':
    case 'GENERAL':
    default:
      return {
        id: 'usr-admin-01',
        name: 'Dr. Kamran Siddiqui',
        role: 'SUPER_ADMIN',
        email: 'director.naiai@moitt.gov.pk',
        desk: 'MoITT Central Helpdesk & Infrastructure Desk'
      };
  }
};

// GET /api/v1/tickets — List tickets with filtering
router.get('/', async (req, res) => {
  try {
    const { 
      role, 
      userId, 
      status, 
      priority, 
      category, 
      assignedToId, 
      search, 
      view 
    } = req.query;

    const query = {};

    // Status filter
    if (status && status !== 'ALL') {
      query.status = status;
    }

    // Priority filter
    if (priority && priority !== 'ALL') {
      query.priority = priority;
    }

    // Category filter
    if (category && category !== 'ALL') {
      query.category = category;
    }

    // Assignee filter
    if (assignedToId) {
      query['assignedTo.id'] = assignedToId;
    }

    // Role-specific view rules
    if (view === 'assigned_to_me' && userId) {
      query['assignedTo.id'] = userId;
    } else if (view === 'my_tickets' && (userId || role)) {
      if (userId) query['createdBy.id'] = userId;
      else if (role) query['createdBy.role'] = role;
    } else if (view === 'urgent') {
      query.priority = { $in: ['HIGH', 'URGENT'] };
      query.status = { $ne: 'CLOSED' };
    } else if (role && !['SUPER_ADMIN', 'MOITT_AUDITOR'].includes(role) && !view) {
      // Default view for trainees / trainers / partners if no explicit view passed
      if (role === 'TRAINEE') {
        if (userId) query['createdBy.id'] = userId;
        else query['createdBy.role'] = 'TRAINEE';
      } else if (role === 'TRAINER') {
        // Trainers see tickets assigned to them OR raised by them
        query.$or = [
          { 'assignedTo.role': 'TRAINER' },
          { 'createdBy.role': 'TRAINER' },
          { category: 'COURSE_QUERY' }
        ];
      } else if (role === 'CONSORTIUM_ADMIN') {
        query.$or = [
          { 'assignedTo.role': 'CONSORTIUM_ADMIN' },
          { 'createdBy.role': 'CONSORTIUM_ADMIN' },
          { category: 'CONSORTIUM_OPS' }
        ];
      }
    }

    // Text search on ticketId, title, requester name, or description
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { ticketId: searchRegex },
          { title: searchRegex },
          { description: searchRegex },
          { 'createdBy.name': searchRegex },
          { 'createdBy.email': searchRegex },
          { relatedTrack: searchRegex }
        ]
      });
    }

    const tickets = await Ticket.find(query).sort({ updatedAt: -1, createdAt: -1 });

    res.json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (err) {
    console.error('[Ticket API] List error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/tickets/stats/kpis — Aggregate stats for Helpdesk dashboard
router.get('/stats/kpis', async (req, res) => {
  try {
    const [total, open, inProgress, underReview, resolved, closed, urgent] = await Promise.all([
      Ticket.countDocuments(),
      Ticket.countDocuments({ status: 'OPEN' }),
      Ticket.countDocuments({ status: 'IN_PROGRESS' }),
      Ticket.countDocuments({ status: 'UNDER_REVIEW' }),
      Ticket.countDocuments({ status: 'RESOLVED' }),
      Ticket.countDocuments({ status: 'CLOSED' }),
      Ticket.countDocuments({ priority: 'URGENT', status: { $nin: ['RESOLVED', 'CLOSED'] } })
    ]);

    const resolutionRate = total > 0 ? (((resolved + closed) / total) * 100).toFixed(1) : '100';

    res.json({
      success: true,
      data: {
        total,
        open,
        inProgress,
        underReview,
        resolved,
        closed,
        urgent,
        resolutionRate: `${resolutionRate}%`,
        avgResponseHours: '2.4'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/tickets/:id — Single ticket
router.get('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      $or: [{ ticketId: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }]
    });

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    res.json({ success: true, data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/v1/tickets — Raise new ticket (any stakeholder)
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      category = 'GENERAL',
      priority = 'MEDIUM',
      createdBy,
      assignedTo,
      relatedTrack,
      relatedCohort,
      attachmentUrl,
      tags
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required.' });
    }

    const nextNumber = Math.floor(1000 + Math.random() * 9000);
    const ticketId = `TKT-2026-${nextNumber}`;
    const timestampStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const deskAssignment = resolveDeskAssignment(category, assignedTo);

    const initialSenderName = createdBy?.name || 'Authorized Stakeholder';
    const initialRole = createdBy?.role || 'TRAINEE';
    const initialInitials = createdBy?.avatarInitials || initialSenderName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

    const newTicket = await Ticket.create({
      ticketId,
      title,
      description,
      category,
      priority,
      status: 'OPEN',
      createdBy: {
        id: createdBy?.id || 'usr-trainee-06',
        name: initialSenderName,
        role: initialRole,
        email: createdBy?.email || 'stakeholder@synapse.gov.pk',
        avatarInitials: initialInitials,
        cnic: createdBy?.cnic || '35201-1122334-6',
        track: relatedTrack || createdBy?.track || 'Track 1: Students & Fresh Graduates',
        cohort: relatedCohort || createdBy?.cohort || 'NUST-MLOps-Batch-04',
        consortiumPartner: createdBy?.consortiumPartner || 'NUST Islamabad'
      },
      assignedTo: deskAssignment,
      relatedTrack: relatedTrack || 'Track 1: Students & Fresh Graduates',
      relatedCohort: relatedCohort || '',
      attachmentUrl: attachmentUrl || '',
      tags: tags || [category],
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: initialSenderName,
          role: initialRole,
          avatarInitials: initialInitials,
          text: description,
          isInternalNote: false,
          attachmentUrl: attachmentUrl || '',
          timestamp: timestampStr
        }
      ],
      slaDeadline: priority === 'URGENT' ? '4 Hours' : priority === 'HIGH' ? '12 Hours' : '24 Hours'
    });

    // Log Audit Trail
    await AuditLog.create({
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: `${initialSenderName} (${initialRole})`,
      action: 'TICKET_RAISED',
      entity: `Ticket: ${ticketId} — [${category}] ${title}`,
      ip: req.ip || '127.0.0.1',
      payload: {
        ticketId,
        category,
        priority,
        assignedTo: deskAssignment.name,
        requesterRole: initialRole
      }
    });

    res.status(201).json({
      success: true,
      message: 'Support ticket successfully raised and routed to responsible desk.',
      data: newTicket
    });
  } catch (err) {
    console.error('[Ticket API] Create error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/v1/tickets/:id/messages — Reply to ticket or post internal staff note
router.post('/:id/messages', async (req, res) => {
  try {
    const { sender, role, avatarInitials, text, isInternalNote = false, attachmentUrl } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message text cannot be empty.' });
    }

    const ticket = await Ticket.findOne({
      $or: [{ ticketId: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }]
    });

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    const timestampStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newMessage = {
      id: `msg-${Date.now()}`,
      sender: sender || 'Support Staff',
      role: role || 'SUPER_ADMIN',
      avatarInitials: avatarInitials || 'ST',
      text: text.trim(),
      isInternalNote: Boolean(isInternalNote),
      attachmentUrl: attachmentUrl || '',
      timestamp: timestampStr
    };

    ticket.messages.push(newMessage);

    // If ticket was OPEN and a staff member replied, transition status to IN_PROGRESS
    if (ticket.status === 'OPEN' && ['SUPER_ADMIN', 'MOITT_AUDITOR', 'TRAINER', 'CONSORTIUM_ADMIN'].includes(role) && !isInternalNote) {
      ticket.status = 'IN_PROGRESS';
    }

    await ticket.save();

    res.json({
      success: true,
      message: isInternalNote ? 'Internal staff note added.' : 'Reply sent successfully.',
      data: ticket
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/v1/tickets/:id/status — Update status & resolution note
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, resolutionNote, resolvedBy } = req.body;

    const validStatuses = ['OPEN', 'IN_PROGRESS', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const ticket = await Ticket.findOne({
      $or: [{ ticketId: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }]
    });

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    ticket.status = status;
    if (resolutionNote) {
      ticket.resolutionNote = resolutionNote;
    }

    if (status === 'RESOLVED' || status === 'CLOSED') {
      ticket.resolvedAt = new Date();
      ticket.resolvedBy = resolvedBy || {
        name: 'MoITT Support Desk',
        role: 'SUPER_ADMIN',
        email: 'director.naiai@moitt.gov.pk'
      };
    }

    await ticket.save();

    // Log Audit Trail
    await AuditLog.create({
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: resolvedBy?.name || 'Administrator',
      action: 'TICKET_STATUS_UPDATED',
      entity: `Ticket: ${ticket.ticketId} -> ${status}`,
      ip: req.ip || '127.0.0.1',
      payload: { ticketId: ticket.ticketId, newStatus: status, resolutionNote }
    });

    res.json({
      success: true,
      message: `Ticket status updated to ${status}.`,
      data: ticket
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/v1/tickets/:id/assign — Reassign ticket
router.patch('/:id/assign', async (req, res) => {
  try {
    const { assignedTo, actor } = req.body;

    if (!assignedTo || !assignedTo.name) {
      return res.status(400).json({ success: false, message: 'Assigned staff details required.' });
    }

    const ticket = await Ticket.findOne({
      $or: [{ ticketId: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }]
    });

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    const oldAssignee = ticket.assignedTo?.name || 'Unassigned';
    ticket.assignedTo = assignedTo;
    await ticket.save();

    // Log Audit Trail
    await AuditLog.create({
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: actor?.name || 'Super Admin',
      action: 'TICKET_REASSIGNED',
      entity: `Ticket: ${ticket.ticketId}`,
      ip: req.ip || '127.0.0.1',
      payload: { ticketId: ticket.ticketId, from: oldAssignee, to: assignedTo.name }
    });

    res.json({
      success: true,
      message: `Ticket reassigned to ${assignedTo.name}.`,
      data: ticket
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/v1/tickets/:id/priority — Update priority
router.patch('/:id/priority', async (req, res) => {
  try {
    const { priority } = req.body;

    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ success: false, message: 'Invalid priority.' });
    }

    const ticket = await Ticket.findOne({
      $or: [{ ticketId: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }]
    });

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    ticket.priority = priority;
    ticket.slaDeadline = priority === 'URGENT' ? '4 Hours' : priority === 'HIGH' ? '12 Hours' : '24 Hours';
    await ticket.save();

    res.json({
      success: true,
      message: `Ticket priority adjusted to ${priority}.`,
      data: ticket
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/v1/tickets/:id — Delete ticket
router.delete('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findOneAndDelete({
      $or: [{ ticketId: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }]
    });

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    res.json({ success: true, message: 'Ticket removed from helpdesk database.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;


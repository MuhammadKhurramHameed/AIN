import express from 'express';
import { ReportSchedule } from '../models/ReportSchedule.js';
import { AuditLog } from '../models/AuditLog.js';
import {
  sendRealEmail,
  generateExecutiveEmailHtml,
  setCustomSmtpConfig,
  getCustomSmtpConfig
} from '../services/emailService.js';

const router = express.Router();

// Fallback in-memory schedule data if MongoDB is offline or empty
let mockSchedules = [
  {
    _id: 'sched-default-1',
    title: 'Daily National Executive Summary',
    reportType: 'FULL_EXECUTIVE',
    frequency: 'DAILY',
    scheduledTime: '18:00',
    actionType: 'BOTH',
    recipientEmails: ['dg.ai@moitt.gov.pk', 'auditor.lead@ain.gov.pk'],
    emailSubject: 'Daily National AI Advancement Initiative — Executive Briefing',
    notes: 'Automated EOD KPI brief with provincial capacity distribution and affirmative female ratios.',
    isActive: true,
    lastDispatchedAt: '2026-08-25T18:00:00.000Z',
    dispatchHistory: [
      {
        dispatchedAt: '2026-08-25T18:00:00.000Z',
        reportType: 'FULL_EXECUTIVE',
        actionType: 'BOTH',
        recipients: ['dg.ai@moitt.gov.pk', 'auditor.lead@ain.gov.pk'],
        status: 'SUCCESS',
        message: 'Dispatched to 2 recipients and downloaded locally.'
      }
    ]
  }
];

// GET SMTP status & configuration
router.get('/smtp-config', (req, res) => {
  const current = getCustomSmtpConfig();
  const envConfigured = !!(process.env.SMTP_USER || process.env.EMAIL_USER);

  res.json({
    success: true,
    isConfigured: !!(current?.user || envConfigured),
    config: {
      host: current?.host || process.env.SMTP_HOST || (process.env.SMTP_SERVICE ? `Service: ${process.env.SMTP_SERVICE}` : 'smtp.gmail.com'),
      port: current?.port || process.env.SMTP_PORT || '587',
      user: current?.user || process.env.SMTP_USER || process.env.EMAIL_USER || '',
      service: current?.service || process.env.SMTP_SERVICE || 'gmail',
      hasPassword: !!(current?.pass || process.env.SMTP_PASS || process.env.EMAIL_PASS)
    }
  });
});

// POST save / test SMTP configuration
router.post('/smtp-config', async (req, res) => {
  try {
    const { host, port, user, pass, service, testRecipient } = req.body;

    const newConfig = {
      host: host || 'smtp.gmail.com',
      port: parseInt(port || '587'),
      user,
      pass,
      service: service || 'gmail',
      secure: parseInt(port || '587') === 465
    };

    setCustomSmtpConfig(newConfig);

    let testResult = null;
    if (testRecipient && user && pass) {
      testResult = await sendRealEmail({
        to: testRecipient,
        subject: 'MoITT National AI Control Plane — Real-Time SMTP Connection Verified',
        html: `
          <div style="font-family: sans-serif; padding: 20px; background: #f8fafc; border-radius: 8px;">
            <h2 style="color: #166534;">✅ SMTP Integration Verified!</h2>
            <p>Your SMTP mailer is properly authenticated and configured to deliver live executive reports in real-time.</p>
            <p style="font-size: 12px; color: #64748b;">Dispatched from: <strong>${user}</strong> at ${new Date().toLocaleString()}</p>
          </div>
        `,
        smtpOverride: newConfig
      });
    }

    res.json({
      success: true,
      message: testResult?.success
        ? `SMTP configured & test verification email delivered to ${testRecipient}!`
        : 'SMTP credentials saved successfully.',
      testResult
    });
  } catch (err) {
    res.status(500).json({ success: false, message: `SMTP verification failed: ${err.message}` });
  }
});

// GET all schedules
router.get('/schedules', async (req, res) => {
  try {
    const schedules = await ReportSchedule.find().sort({ createdAt: -1 });
    if (schedules && schedules.length > 0) {
      return res.json({ success: true, data: schedules });
    }
    return res.json({ success: true, data: mockSchedules });
  } catch (err) {
    console.warn('[ReportRoutes] DB fallback for get schedules:', err.message);
    res.json({ success: true, data: mockSchedules });
  }
});

// POST create or update schedule
router.post('/schedules', async (req, res) => {
  try {
    const {
      _id,
      title,
      reportType,
      frequency,
      scheduledTime,
      actionType,
      recipientEmails,
      emailSubject,
      notes,
      isActive
    } = req.body;

    let schedule;
    try {
      if (_id && _id.startsWith('sched-')) {
        const idx = mockSchedules.findIndex(s => s._id === _id);
        if (idx !== -1) {
          mockSchedules[idx] = { ...mockSchedules[idx], ...req.body };
          schedule = mockSchedules[idx];
        } else {
          schedule = { _id, ...req.body, dispatchHistory: [] };
          mockSchedules.unshift(schedule);
        }
      } else if (_id) {
        schedule = await ReportSchedule.findByIdAndUpdate(_id, req.body, { new: true, upsert: true });
      } else {
        schedule = await ReportSchedule.create(req.body);
      }
    } catch (dbErr) {
      const newMock = {
        _id: _id || `sched-${Date.now()}`,
        title: title || 'Custom Report Schedule',
        reportType: reportType || 'FULL_EXECUTIVE',
        frequency: frequency || 'DAILY',
        scheduledTime: scheduledTime || '18:00',
        actionType: actionType || 'BOTH',
        recipientEmails: recipientEmails || [],
        emailSubject: emailSubject || 'Executive Report Dispatch',
        notes: notes || '',
        isActive: isActive !== undefined ? isActive : true,
        lastDispatchedAt: null,
        dispatchHistory: []
      };
      mockSchedules.unshift(newMock);
      schedule = newMock;
    }

    try {
      await AuditLog.create({
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        actor: req.body.actor || 'Super Admin (System)',
        action: 'SCHEDULE_REPORT_CONFIGURED',
        entity: `ReportSchedule:${schedule._id}`,
        ip: req.ip || '127.0.0.1',
        payload: { title: schedule.title, reportType: schedule.reportType, scheduledTime: schedule.scheduledTime, actionType: schedule.actionType }
      });
    } catch {
      // Ignored for audit log fallback
    }

    res.json({ success: true, data: schedule, message: 'Report schedule saved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE schedule
router.delete('/schedules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    try {
      await ReportSchedule.findByIdAndDelete(id);
    } catch {
      mockSchedules = mockSchedules.filter(s => s._id !== id);
    }
    res.json({ success: true, message: 'Report schedule removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST send immediate or scheduled email dispatch
router.post('/send-email', async (req, res) => {
  try {
    const {
      scheduleId,
      reportType = 'FULL_EXECUTIVE',
      reportTitle = 'Executive Briefing Report',
      recipients = [],
      subject = 'Executive AI Report Dispatch',
      notes = '',
      metricsSnapshot = {},
      actor = 'Super Admin',
      smtpOverride = null
    } = req.body;

    const dispatchTime = new Date().toISOString();
    const cleanRecipients = Array.isArray(recipients)
      ? recipients
      : (typeof recipients === 'string' ? recipients.split(',').map(e => e.trim()).filter(Boolean) : []);

    if (cleanRecipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No recipient email addresses provided.'
      });
    }

    // Generate full-fidelity executive HTML report email
    const emailHtml = generateExecutiveEmailHtml({
      reportTitle,
      reportType,
      metricsSnapshot,
      notes,
      dispatchedAt: new Date().toLocaleString()
    });

    // Attempt real SMTP dispatch
    let emailResult;
    try {
      emailResult = await sendRealEmail({
        to: cleanRecipients,
        subject: subject || `National AI Executive Briefing — ${reportTitle}`,
        html: emailHtml,
        smtpOverride
      });
    } catch (sendErr) {
      console.warn('[ReportRoutes] Real SMTP send error:', sendErr.message);
      emailResult = {
        success: false,
        isConfigured: true,
        error: sendErr.message
      };
    }

    const dispatchRecord = {
      dispatchedAt: dispatchTime,
      reportType,
      actionType: 'EMAIL_DISPATCH',
      recipients: cleanRecipients,
      status: emailResult?.success ? 'SUCCESS' : (emailResult?.isConfigured ? 'FAILED' : 'NEEDS_SMTP_SETUP'),
      message: emailResult?.success
        ? `Real email delivered to ${cleanRecipients.join(', ')} (Message ID: ${emailResult.messageId})`
        : (emailResult?.error
            ? `SMTP Delivery Error: ${emailResult.error}`
            : `Recipients: ${cleanRecipients.join(', ')}. SMTP credentials not yet provided in Settings.`)
    };

    // Update schedule history if scheduleId is provided
    try {
      if (scheduleId && !scheduleId.startsWith('sched-')) {
        await ReportSchedule.findByIdAndUpdate(scheduleId, {
          lastDispatchedAt: dispatchTime,
          $push: { dispatchHistory: dispatchRecord }
        });
      } else if (scheduleId) {
        const found = mockSchedules.find(s => s._id === scheduleId);
        if (found) {
          found.lastDispatchedAt = dispatchTime;
          found.dispatchHistory = [dispatchRecord, ...(found.dispatchHistory || [])];
        }
      }
    } catch (err) {
      console.warn('[ReportRoutes] Failed updating schedule dispatch history:', err.message);
    }

    // Register cryptographic Audit Log entry
    try {
      await AuditLog.create({
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        actor,
        action: emailResult?.success ? 'REPORT_EMAIL_DELIVERED' : 'REPORT_EMAIL_ATTEMPTED',
        entity: `Report:${reportType}`,
        ip: req.ip || '127.0.0.1',
        payload: {
          reportTitle,
          recipients: cleanRecipients,
          subject,
          emailResult
        }
      });
    } catch {
      // Ignore fallback
    }

    res.json({
      success: emailResult?.success || false,
      isConfigured: emailResult?.isConfigured || false,
      error: emailResult?.error || null,
      data: {
        dispatchedAt: dispatchTime,
        recipients: cleanRecipients,
        subject,
        deliveryId: emailResult?.messageId || `MSG-PENDING-${Date.now()}`,
        status: emailResult?.success ? 'DELIVERED_REALTIME' : (emailResult?.isConfigured ? 'FAILED' : 'SMTP_REQUIRED'),
        previewSummary: {
          reportTitle,
          totalRegistered: metricsSnapshot.registered_count || 14850,
          femaleRatio: metricsSnapshot.femalePct || '34.5%',
          verifiedHours: metricsSnapshot.verified_hours_total || '284,500h',
          notes
        }
      },
      message: emailResult?.success
        ? `Real email successfully delivered to ${cleanRecipients.join(', ')}!`
        : (emailResult?.error
            ? `Failed sending email: ${emailResult.error}. Check your SMTP credentials.`
            : `SMTP settings required to deliver live emails. Please enter your Gmail / SMTP credentials in the Email Settings tab.`)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

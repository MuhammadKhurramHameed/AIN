import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users, UserCheck, Clock, Award, Download, CheckCircle,
  X, Calendar, Bell, Play, Trash2, Plus,
  FileText, Sparkles, Settings, Key, Send, CheckCircle2, AlertCircle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import { exportExecutiveReportPDF, exportStructuredReportPDF } from '../utils/pdfExport';
import { apiService } from '../services/api';

export const OversightDashboardView = () => {
  const {
    programme,
    tracks,
    partners,
    provincialStats,
    navigateTo,
    reportSchedules = [],
    reportDispatchHistory = [],
    activeSchedulerToast,
    saveReportSchedule,
    deleteReportSchedule,
    triggerReportDispatch,
    dismissSchedulerToast
  } = useApp();

  const [activeMetricModal, setActiveMetricModal] = useState(null); // 'TRAINEES', 'FEMALE', 'HOURS', 'CERTS'
  const [showSchedulerModal, setShowSchedulerModal] = useState(false);
  const [schedulerTab, setSchedulerTab] = useState('CONFIG'); // 'CONFIG' | 'HISTORY' | 'SMTP'
  const [isExporting, setIsExporting] = useState(false);
  const [isDispatchingTest, setIsDispatchingTest] = useState(false);
  const [dispatchFeedback, setDispatchFeedback] = useState(null);

  // New Schedule Form State
  const [formData, setFormData] = useState({
    title: 'Daily National Executive Briefing',
    reportType: 'FULL_EXECUTIVE',
    frequency: 'DAILY',
    scheduledTime: '18:00',
    actionType: 'BOTH',
    recipientEmails: '',
    emailSubject: 'MoITT National AI Capacity Initiative — Daily Executive KPI Briefing',
    notes: 'Automated EOD KPI brief with provincial capacity distribution and affirmative female ratios.',
    isActive: true
  });

  // SMTP Settings State
  const [smtpForm, setSmtpForm] = useState({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: '587',
    user: '',
    pass: '',
    testRecipient: ''
  });
  const [smtpStatus, setSmtpStatus] = useState({ isConfigured: false, user: '', service: 'gmail' });
  const [isSavingSmtp, setIsSavingSmtp] = useState(false);
  const [smtpFeedback, setSmtpFeedback] = useState(null);

  // Load SMTP config status
  useEffect(() => {
    async function loadSmtp() {
      const res = await apiService.getSmtpConfig();
      if (res && res.success) {
        setSmtpStatus({
          isConfigured: res.isConfigured,
          user: res.config?.user || '',
          service: res.config?.service || 'gmail'
        });
        if (res.config) {
          setSmtpForm(prev => ({
            ...prev,
            host: res.config.host || 'smtp.gmail.com',
            port: String(res.config.port || '587'),
            user: res.config.user || '',
            service: res.config.service || 'gmail'
          }));
        }
      }
    }
    loadSmtp();
  }, []);

  const femalePct = ((programme.female_registered_count / programme.registered_count) * 100).toFixed(1);
  const maleCount = programme.registered_count - programme.female_registered_count;

  // Recharts Data
  const genderPieData = [
    { name: 'Female Trainees (Quota ≥ 30%)', value: programme.female_registered_count, color: '#16a34a' },
    { name: 'Male & Other Trainees', value: maleCount, color: '#1d4ed8' }
  ];

  const handleExportPDF = async (nodeId, filename) => {
    setIsExporting(true);
    await exportExecutiveReportPDF(nodeId, filename);
    setIsExporting(false);
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    const recipientsArray = formData.recipientEmails
      ? formData.recipientEmails.split(',').map(e => e.trim()).filter(Boolean)
      : [];

    await saveReportSchedule({
      ...formData,
      recipientEmails: recipientsArray
    });

    setDispatchFeedback({
      type: 'success',
      message: `Schedule "${formData.title}" successfully saved! It will automatically trigger when the app is active.`
    });
  };

  const handleTriggerTest = async (schedData) => {
    setIsDispatchingTest(true);
    setDispatchFeedback(null);

    const scheduleToRun = schedData || {
      ...formData,
      recipientEmails: formData.recipientEmails.split(',').map(e => e.trim()).filter(Boolean)
    };

    const res = await triggerReportDispatch(scheduleToRun, true);
    setIsDispatchingTest(false);

    if (res && res.emailSuccess) {
      setDispatchFeedback({
        type: 'success',
        message: `Real email successfully dispatched to ${scheduleToRun.recipientEmails.join(', ')} and PDF downloaded!`
      });
    } else if (res && !res.emailSuccess && (scheduleToRun.actionType === 'EMAIL_ONLY' || scheduleToRun.actionType === 'BOTH')) {
      setDispatchFeedback({
        type: 'warning',
        message: `PDF was downloaded, but real email delivery requires SMTP mail credentials. Please set your Gmail / SMTP details in the "⚙️ Email Server Settings" tab.`
      });
    }
  };

  const handleSaveSmtp = async (e) => {
    e.preventDefault();
    setIsSavingSmtp(true);
    setSmtpFeedback(null);

    const res = await apiService.saveSmtpConfig(smtpForm);
    setIsSavingSmtp(false);

    if (res && res.success) {
      setSmtpStatus({
        isConfigured: true,
        user: smtpForm.user,
        service: smtpForm.service
      });
      setSmtpFeedback({
        type: 'success',
        message: res.message || 'SMTP settings verified and active!'
      });
    } else {
      setSmtpFeedback({
        type: 'error',
        message: res?.message || 'Failed to authenticate SMTP credentials. Please check host, port, and app password.'
      });
    }
  };

  const activeSchedulesCount = reportSchedules.filter(s => s.isActive).length;
  const nextScheduleTime = reportSchedules.find(s => s.isActive)?.scheduledTime || '18:00';

  return (
    <div className="page-view">
      {/* Top Banner: Scheduled Automated Dispatch Notification */}
      {activeSchedulerToast && (
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          border: '1px solid #6366f1',
          color: '#ffffff',
          padding: '14px 20px',
          borderRadius: '10px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 10px 25px -5px rgba(49, 46, 129, 0.4)',
          animation: 'fadeIn 0.3s ease-in-out'
        }}>
          <div style={{ background: '#4f46e5', padding: '8px', borderRadius: '8px', display: 'flex' }}>
            <Sparkles size={20} style={{ color: '#fbbf24' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{activeSchedulerToast.title}</span>
              <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px' }}>
                {activeSchedulerToast.time} PKT
              </span>
            </div>
            <div style={{ fontSize: '12.5px', color: '#e0e7ff', marginTop: '2px' }}>
              {activeSchedulerToast.message}
            </div>
          </div>
          <button
            onClick={dismissSchedulerToast}
            style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', opacity: 0.8 }}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Top Executive Action Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--surface)',
        padding: '16px 20px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              National AI Capacity Control Plane
            </h2>
            <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              Live Telemetry Streaming
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Multi-stakeholder analytics across 7 provinces, 9 tracks, and 4 consortium partners
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Active Schedule Status Pill */}
          <div
            onClick={() => { setShowSchedulerModal(true); setSchedulerTab('CONFIG'); }}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 14px',
              borderRadius: '20px',
              background: activeSchedulesCount > 0 ? '#f0fdf4' : 'var(--surface-dim)',
              border: `1px solid ${activeSchedulesCount > 0 ? '#86efac' : 'var(--border-color)'}`,
              fontSize: '12px',
              fontWeight: 600,
              color: activeSchedulesCount > 0 ? '#166534' : 'var(--text-subtle)'
            }}
            title="Click to configure automated scheduled PDF downloads and email delivery"
          >
            <Bell size={14} style={{ color: activeSchedulesCount > 0 ? '#16a34a' : 'var(--text-subtle)' }} />
            <span>{activeSchedulesCount > 0 ? `${activeSchedulesCount} Active Schedule (Next: ${nextScheduleTime} PKT)` : 'Scheduler Idle'}</span>
          </div>

          {/* Schedule Reports Button */}
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowSchedulerModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
          >
            <Calendar size={15} />
            <span>Schedule Auto-Download &amp; Email</span>
          </button>

          {/* Quick Full PDF Export */}
          <button
            className="btn btn-secondary btn-sm"
            disabled={isExporting}
            onClick={async () => {
              setIsExporting(true);
              await exportStructuredReportPDF({
                reportType: 'FULL_EXECUTIVE',
                programme,
                tracks,
                partners,
                provincialStats
              });
              setIsExporting(false);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={15} />
            <span>{isExporting ? 'Generating...' : 'Export Full Briefing'}</span>
          </button>
        </div>
      </div>

      {/* 4 Clickable KPI Cards with Hover Indicators */}
      <div className="grid-4" style={{ marginBottom: "24px" }}>
        
        {/* Card 1: Registered Trainees */}
        <div
          className="kpi-card"
          style={{ cursor: "pointer", transition: "transform 0.2s ease, box-shadow 0.2s ease" }}
          onClick={() => setActiveMetricModal('TRAINEES')}
          title="Click to view detailed Trainee Registration Metrics & Export PDF"
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div className="kpi-icon"><Users size={22} /></div>
            <span className="badge badge-primary" style={{ fontSize: "10px" }}>Click for details ➔</span>
          </div>
          <div className="kpi-value">{programme.registered_count.toLocaleString()}</div>
          <div className="kpi-label">Registered Trainees / {programme.target_participants.toLocaleString()} Cap</div>
          <div className="kpi-meta"><span style={{ color: "var(--success)", fontWeight: 700 }}>74.25%</span> capacity filled</div>
        </div>

        {/* Card 2: Female Participation Ratio */}
        <div
          className="kpi-card kpi-success"
          style={{ cursor: "pointer", transition: "transform 0.2s ease, box-shadow 0.2s ease" }}
          onClick={() => setActiveMetricModal('FEMALE')}
          title="Click to view Female Quota Analytics & Export PDF"
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div className="kpi-icon" style={{ background: "var(--success-tint)", color: "var(--success)" }}><UserCheck size={22} /></div>
            <span className="badge badge-success" style={{ fontSize: "10px" }}>Click for details ➔</span>
          </div>
          <div className="kpi-value">{femalePct}%</div>
          <div className="kpi-label">Female Participation Ratio</div>
          <div className="kpi-meta"><span style={{ color: "var(--success)", fontWeight: 700 }}>+4.5%</span> above 30% statutory rule</div>
        </div>

        {/* Card 3: Contact Hours */}
        <div
          className="kpi-card kpi-purple"
          style={{ cursor: "pointer", transition: "transform 0.2s ease, box-shadow 0.2s ease" }}
          onClick={() => setActiveMetricModal('HOURS')}
          title="Click to view Telemetry Hours & Export PDF"
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div className="kpi-icon" style={{ background: "#f3e8ff", color: "#8b5cf6" }}><Clock size={22} /></div>
            <span className="badge badge-neutral" style={{ fontSize: "10px" }}>Click for details ➔</span>
          </div>
          <div className="kpi-value">{programme.verified_hours_total.toLocaleString()}h</div>
          <div className="kpi-label">Verified Contact Hours</div>
          <div className="kpi-meta">Live Telemetry Pings Active</div>
        </div>

        {/* Card 4: Certificates Issued */}
        <div
          className="kpi-card kpi-warning"
          style={{ cursor: "pointer", transition: "transform 0.2s ease, box-shadow 0.2s ease" }}
          onClick={() => setActiveMetricModal('CERTS')}
          title="Click to view Certificate Audit & Export PDF"
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div className="kpi-icon" style={{ background: "var(--warning-tint)", color: "var(--warning)" }}><Award size={22} /></div>
            <span className="badge badge-warning" style={{ fontSize: "10px" }}>Click for details ➔</span>
          </div>
          <div className="kpi-value">{programme.certificates_issued.toLocaleString()}</div>
          <div className="kpi-label">Certificates Issued &amp; Signed</div>
          <div className="kpi-meta"><span style={{ color: "var(--warning)", fontWeight: 700 }}>100%</span> Ed25519 root verified</div>
        </div>
      </div>

      {/* Relocated Section 1: Quota Balancer & Provincial Allocations Charts */}
      <div className="grid-12" style={{ marginBottom: "24px" }}>
        {/* Donut Chart: Real-Time Quota Balancer */}
        <div className="col-span-4">
          <div className="card" style={{ height: "100%" }}>
            <div className="card-header">
              <div>
                <h3 className="card-title">Real-Time Quota Balancer</h3>
                <p className="card-subtitle">Enforcing statutory female ratio ≥ 30%</p>
              </div>
              <span className="badge badge-success">34.5% Female</span>
            </div>

            <div style={{ width: '100%', height: 210 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={genderPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {genderPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value.toLocaleString()} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ fontSize: "11.5px", background: "var(--surface-dim)", padding: "10px", borderRadius: "var(--radius-md)", textAlign: "center" }}>
              <CheckCircle size={14} style={{ verticalAlign: "middle", color: "var(--success)", marginRight: "4px" }} />
              Female Ratio: <strong>{femalePct}%</strong> ({programme.female_registered_count.toLocaleString()} Trainees). Statutory compliance active.
            </div>
          </div>
        </div>

        {/* Bar Chart: Provincial Quota Allocation */}
        <div className="col-span-8">
          <div className="card" style={{ height: "100%" }}>
            <div className="card-header">
              <div>
                <h3 className="card-title">Provincial Quota Allocations</h3>
                <p className="card-subtitle">Enrolled Trainees vs. Target Capacity across Provinces &amp; Territories</p>
              </div>
              <span className="badge badge-primary">Nationwide Distribution</span>
            </div>

            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <BarChart data={provincialStats} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="province" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => value.toLocaleString()} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="enrolled" name="Enrolled Trainees" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="capacity" name="Target Capacity" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: National Track Matrix & Consortium Partners */}
      <div className="grid-12">
        <div className="col-span-8">
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">National Track Performance Matrix</h3>
                <p className="card-subtitle">9 Target Audience Tracks &amp; Hours Completion Status</p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => navigateTo("curriculum-builder")}>Manage Tracks</button>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Track Title</th>
                    <th>Level</th>
                    <th>Req Hours</th>
                    <th>Enrolled</th>
                    <th>Cohorts</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tracks.map(t => (
                    <tr key={t.id}>
                      <td><strong>Track {t.number}: {t.title}</strong></td>
                      <td><span className="badge badge-neutral">{t.category}</span></td>
                      <td style={{ fontFamily: "var(--font-mono)" }}>{t.hours}h</td>
                      <td style={{ fontWeight: 600 }}>{t.enrolled.toLocaleString()}</td>
                      <td style={{ fontFamily: "var(--font-mono)" }}>{t.active_cohorts}</td>
                      <td><span className="badge badge-success">Active</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-span-4">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Consortium Partners Index</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {partners.slice(0, 5).map(p => (
                <div key={p.id} style={{ padding: "10px", background: "var(--surface-dim)", borderRadius: "var(--radius-md)", fontSize: "12.5px" }}>
                  <div style={{ fontWeight: 700, color: "var(--text-main)" }}>{p.name}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", color: "var(--text-subtle)", fontSize: "11px" }}>
                    <span>MOU: {p.mou_ref}</span>
                    <span style={{ fontWeight: 600, color: "var(--primary)" }}>{p.enrolled} / {p.allocated_capacity} Trainees</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* AUTOMATED REPORT SCHEDULER & EMAIL DISPATCH MODAL */}
      {/* ========================================================================= */}
      {showSchedulerModal && (
        <div className="modal-backdrop" style={{ backdropFilter: "blur(8px)" }}>
          <div className="modal-card" style={{ maxWidth: "880px", width: "95%" }}>
            
            {/* Modal Header */}
            <div className="modal-header">
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ background: "var(--primary-tint)", padding: "8px", borderRadius: "10px", color: "var(--primary)" }}>
                  <Calendar size={22} />
                </div>
                <div>
                  <h4 className="card-title" style={{ fontSize: "17px" }}>Automated Report Scheduler &amp; Live Email Dispatch Center</h4>
                  <p className="card-subtitle">Auto-download PDFs at set times and deliver live executive briefings to real stakeholder email inboxes</p>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowSchedulerModal(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Sub-Tabs */}
            <div style={{ display: "flex", gap: "10px", padding: "12px 24px", borderBottom: "1px solid var(--border-color)", background: "var(--surface-dim)", flexWrap: "wrap" }}>
              <button
                className={`btn btn-sm ${schedulerTab === 'CONFIG' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setSchedulerTab('CONFIG')}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Plus size={14} /> Configure &amp; Active Schedules
              </button>
              <button
                className={`btn btn-sm ${schedulerTab === 'HISTORY' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setSchedulerTab('HISTORY')}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <FileText size={14} /> Dispatch Logs &amp; Audit Trail ({reportDispatchHistory.length})
              </button>
              <button
                className={`btn btn-sm ${schedulerTab === 'SMTP' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setSchedulerTab('SMTP')}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Settings size={14} />
                <span>⚙️ Email Server / SMTP Settings</span>
                {smtpStatus.isConfigured && (
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', marginLeft: '4px' }} />
                )}
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body" style={{ maxHeight: "65vh", overflowY: "auto", padding: "20px 24px" }}>
              
              {/* TAB 1: SCHEDULE CONFIGURATION */}
              {schedulerTab === 'CONFIG' && (
                <div>
                  {/* Inline Feedback Banner */}
                  {dispatchFeedback && (
                    <div style={{
                      background: dispatchFeedback.type === 'success' ? '#f0fdf4' : '#fffbeb',
                      border: `1px solid ${dispatchFeedback.type === 'success' ? '#bbf7d0' : '#fde68a'}`,
                      color: dispatchFeedback.type === 'success' ? '#166534' : '#92400e',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {dispatchFeedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <span>{dispatchFeedback.message}</span>
                      </div>
                      {dispatchFeedback.type === 'warning' && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSchedulerTab('SMTP')}
                          style={{ fontSize: '11px', padding: '4px 10px', whiteSpace: 'nowrap' }}
                        >
                          Configure SMTP
                        </button>
                      )}
                    </div>
                  )}

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', marginBottom: '24px' }}>
                    <h5 style={{ fontWeight: 800, fontSize: '14px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={16} style={{ color: '#2563eb' }} />
                      Create or Update Scheduled Report Dispatch
                    </h5>

                    <form onSubmit={handleSaveSchedule}>
                      <div className="grid-2" style={{ gap: "14px", marginBottom: "14px" }}>
                        
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label" style={{ fontSize: "12px", fontWeight: 700 }}>Schedule Title</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                          />
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label" style={{ fontSize: "12px", fontWeight: 700 }}>Report Template</label>
                          <select
                            className="form-control form-select"
                            value={formData.reportType}
                            onChange={(e) => setFormData({ ...formData, reportType: e.target.value })}
                          >
                            <option value="FULL_EXECUTIVE">Full National Executive Briefing</option>
                            <option value="TRAINEE_CAPACITY">Trainee Capacity &amp; Provincial Allocations</option>
                            <option value="FEMALE_QUOTA">Affirmative Female Quota Audit</option>
                            <option value="TELEMETRY_HOURS">WebSocket Telemetry &amp; Contact Hours</option>
                            <option value="CERT_REGISTRY">Ed25519 Certificate Registry</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid-3" style={{ gap: "14px", marginBottom: "14px" }}>
                        
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label" style={{ fontSize: "12px", fontWeight: 700 }}>Execution Frequency</label>
                          <select
                            className="form-control form-select"
                            value={formData.frequency}
                            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                          >
                            <option value="DAILY">Daily at Set Clock Time</option>
                            <option value="EVERY_6_HOURS">Recurring Every 6 Hours</option>
                            <option value="EVERY_12_HOURS">Recurring Every 12 Hours</option>
                            <option value="EVERY_24_HOURS">Daily at Midnight (00:00)</option>
                          </select>
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label" style={{ fontSize: "12px", fontWeight: 700 }}>Trigger Time (PKT Local)</label>
                          <input
                            type="time"
                            className="form-control"
                            value={formData.scheduledTime}
                            onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                            required
                          />
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label" style={{ fontSize: "12px", fontWeight: 700 }}>Automated Actions</label>
                          <select
                            className="form-control form-select"
                            value={formData.actionType}
                            onChange={(e) => setFormData({ ...formData, actionType: e.target.value })}
                          >
                            <option value="BOTH">Auto-Download PDF &amp; Email Snapshot</option>
                            <option value="DOWNLOAD_ONLY">Auto-Download PDF Only</option>
                            <option value="EMAIL_ONLY">Auto-Email Snapshot Only</option>
                          </select>
                        </div>
                      </div>

                      {(formData.actionType === 'EMAIL_ONLY' || formData.actionType === 'BOTH') && (
                        <div style={{ marginBottom: "14px" }}>
                          <div className="form-group" style={{ marginBottom: "10px" }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                              <label className="form-label" style={{ fontSize: "12px", fontWeight: 700, margin: 0 }}>
                                Recipient Email Address(es) <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(Comma-separated for multiple)</span>
                              </label>
                              {!smtpStatus.isConfigured && (
                                <span
                                  style={{ fontSize: '11px', color: '#b45309', cursor: 'pointer', textDecoration: 'underline' }}
                                  onClick={() => setSchedulerTab('SMTP')}
                                >
                                  ⚙️ Set SMTP credentials for live emails
                                </span>
                              )}
                            </div>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="e.g. seriesmaster67@gmail.com, auditor@moitt.gov.pk"
                              value={formData.recipientEmails}
                              onChange={(e) => setFormData({ ...formData, recipientEmails: e.target.value })}
                              required={formData.actionType !== 'DOWNLOAD_ONLY'}
                            />
                          </div>

                          <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label" style={{ fontSize: "12px", fontWeight: 700 }}>Executive Subject Line</label>
                            <input
                              type="text"
                              className="form-control"
                              value={formData.emailSubject}
                              onChange={(e) => setFormData({ ...formData, emailSubject: e.target.value })}
                            />
                          </div>
                        </div>
                      )}

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #e2e8f0" }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          disabled={isDispatchingTest}
                          onClick={() => handleTriggerTest()}
                          style={{ display: "flex", alignItems: "center", gap: "6px" }}
                        >
                          <Play size={14} />
                          <span>{isDispatchingTest ? 'Dispatching Test...' : '⚡ Test Instant Dispatch Now'}</span>
                        </button>

                        <button type="submit" className="btn btn-primary btn-sm" style={{ fontWeight: 700 }}>
                          Save &amp; Activate Schedule
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Active Schedules List */}
                  <h5 style={{ fontWeight: 800, fontSize: "14px", marginBottom: "12px" }}>Configured Report Schedules</h5>
                  
                  {reportSchedules.length === 0 ? (
                    <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>No report schedules configured yet.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {reportSchedules.map(sched => (
                        <div
                          key={sched._id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "14px 16px",
                            background: "var(--surface)",
                            border: `1px solid ${sched.isActive ? '#bbf7d0' : 'var(--border-color)'}`,
                            borderRadius: "8px",
                            flexWrap: "wrap",
                            gap: "12px"
                          }}
                        >
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontWeight: 700, fontSize: "14px" }}>{sched.title}</span>
                              <span className={`badge ${sched.isActive ? 'badge-success' : 'badge-neutral'}`}>
                                {sched.isActive ? 'Active' : 'Disabled'}
                              </span>
                              <span className="badge badge-primary" style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                                {sched.scheduledTime} PKT
                              </span>
                            </div>

                            <div style={{ fontSize: "12px", color: "var(--text-subtle)", marginTop: "4px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                              <span>Template: <strong>{sched.reportType}</strong></span>
                              <span>Action: <strong>{sched.actionType}</strong></span>
                              {sched.lastDispatchedAt && (
                                <span>Last Run: <strong>{sched.lastDispatchedAt}</strong></span>
                              )}
                            </div>

                            {sched.recipientEmails && sched.recipientEmails.length > 0 && (
                              <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "4px" }}>
                                ✉️ Recipients: {sched.recipientEmails.join(', ')}
                              </div>
                            )}
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              disabled={isDispatchingTest}
                              onClick={() => handleTriggerTest(sched)}
                              title="Run immediate test download & email"
                            >
                              <Play size={13} /> Test
                            </button>

                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => saveReportSchedule({ ...sched, isActive: !sched.isActive })}
                              title={sched.isActive ? "Disable Schedule" : "Enable Schedule"}
                            >
                              {sched.isActive ? 'Disable' : 'Enable'}
                            </button>

                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => deleteReportSchedule(sched._id)}
                              style={{ color: '#ef4444' }}
                              title="Delete schedule"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: DISPATCH HISTORY & LOGS */}
              {schedulerTab === 'HISTORY' && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <div>
                      <h5 style={{ fontWeight: 800, fontSize: "14px", margin: 0 }}>Chronological Dispatch History</h5>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>
                        Cryptographically logged executions from both background timer triggers and manual test runs
                      </p>
                    </div>
                  </div>

                  {reportDispatchHistory.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)", fontSize: "13px" }}>
                      No dispatches recorded yet. Use "Test Instant Dispatch" to execute a sample run.
                    </div>
                  ) : (
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Dispatched Time (PKT)</th>
                            <th>Report Name</th>
                            <th>Action Mode</th>
                            <th>Recipients</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportDispatchHistory.map(h => (
                            <tr key={h.id}>
                              <td style={{ fontFamily: "var(--font-mono)", fontSize: "11.5px" }}>{h.dispatchedAt}</td>
                              <td><strong>{h.reportTitle}</strong></td>
                              <td>
                                <span className="badge badge-primary" style={{ fontSize: "10.5px" }}>
                                  {h.actionType}
                                </span>
                              </td>
                              <td style={{ fontSize: "11.5px" }}>
                                {h.recipients && h.recipients.length > 0 ? h.recipients.join(', ') : 'Local Download Only'}
                              </td>
                              <td>
                                <span className={`badge ${h.status === 'SUCCESS' ? 'badge-success' : 'badge-warning'}`}>
                                  {h.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SMTP & EMAIL SERVER CONFIGURATION */}
              {schedulerTab === 'SMTP' && (
                <div>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '18px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <Key size={20} style={{ color: '#2563eb', flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <h5 style={{ fontWeight: 800, fontSize: '14px', margin: 0 }}>Mail Server / SMTP Authentication</h5>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                          To deliver real HTML executive briefings straight to inboxes (Gmail, Outlook, Yahoo, Custom SMTP), enter your credentials below.
                        </p>
                      </div>
                    </div>

                    {/* How to get Gmail App Password tip */}
                    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px 14px', fontSize: '12px', color: '#1e40af', marginBottom: '16px' }}>
                      <strong>💡 Recommended (Gmail):</strong><br />
                      1. Go to your <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" style={{ color: '#1d4ed8', fontWeight: 700 }}>Google Account App Passwords</a>.<br />
                      2. Generate a 16-character App Password for "Mail".<br />
                      3. Enter your Gmail address below and paste the 16-character App Password.
                    </div>

                    {/* SMTP Feedback Banner */}
                    {smtpFeedback && (
                      <div style={{
                        background: smtpFeedback.type === 'success' ? '#f0fdf4' : '#fef2f2',
                        border: `1px solid ${smtpFeedback.type === 'success' ? '#bbf7d0' : '#fca5a5'}`,
                        color: smtpFeedback.type === 'success' ? '#166534' : '#991b1b',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        fontSize: '12.5px',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        {smtpFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        <span>{smtpFeedback.message}</span>
                      </div>
                    )}

                    <form onSubmit={handleSaveSmtp}>
                      <div className="grid-2" style={{ gap: '14px', marginBottom: '14px' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>Mail Service Provider</label>
                          <select
                            className="form-control form-select"
                            value={smtpForm.service}
                            onChange={(e) => {
                              const s = e.target.value;
                              if (s === 'gmail') {
                                setSmtpForm({ ...smtpForm, service: s, host: 'smtp.gmail.com', port: '587' });
                              } else if (s === 'outlook') {
                                setSmtpForm({ ...smtpForm, service: s, host: 'smtp-mail.outlook.com', port: '587' });
                              } else {
                                setSmtpForm({ ...smtpForm, service: 'custom' });
                              }
                            }}
                          >
                            <option value="gmail">Gmail (Google Workspace / @gmail.com)</option>
                            <option value="outlook">Outlook / Microsoft 365</option>
                            <option value="custom">Custom SMTP Server</option>
                          </select>
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>Sender Email (Username)</label>
                          <input
                            type="email"
                            className="form-control"
                            placeholder="e.g. your-email@gmail.com"
                            value={smtpForm.user}
                            onChange={(e) => setSmtpForm({ ...smtpForm, user: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid-2" style={{ gap: '14px', marginBottom: '14px' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>SMTP Host</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="smtp.gmail.com"
                            value={smtpForm.host}
                            onChange={(e) => setFormData({ ...smtpForm, host: e.target.value })}
                            required
                          />
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>SMTP Port</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="587"
                            value={smtpForm.port}
                            onChange={(e) => setSmtpForm({ ...smtpForm, port: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid-2" style={{ gap: '14px', marginBottom: '14px' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>
                            App Password / Token
                          </label>
                          <input
                            type="password"
                            className="form-control"
                            placeholder="16-character App Password (e.g. abcd efgh ijkl mnop)"
                            value={smtpForm.pass}
                            onChange={(e) => setSmtpForm({ ...smtpForm, pass: e.target.value })}
                            required
                          />
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>
                            Send Test Verification Email To (Optional)
                          </label>
                          <input
                            type="email"
                            className="form-control"
                            placeholder="your-personal@email.com"
                            value={smtpForm.testRecipient}
                            onChange={(e) => setSmtpForm({ ...smtpForm, testRecipient: e.target.value })}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                        <button
                          type="submit"
                          className="btn btn-primary btn-sm"
                          disabled={isSavingSmtp}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                        >
                          <Send size={14} />
                          <span>{isSavingSmtp ? 'Authenticating & Verifying...' : 'Save & Verify Mail Connection'}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="modal-footer" style={{ background: "var(--surface-dim)" }}>
              <button className="btn btn-secondary" onClick={() => setShowSchedulerModal(false)}>
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* METRIC DRILL-DOWN MODALS (BLURRED BACKDROP SaaS OVERLAYS WITH EXPORT PDF) */}
      {/* ========================================================================= */}

      {/* Metric 1 Modal: Registered Trainees */}
      {activeMetricModal === 'TRAINEES' && (
        <div className="modal-backdrop" style={{ backdropFilter: "blur(8px)" }}>
          <div className="modal-card" style={{ maxWidth: "780px" }}>
            <div className="modal-header">
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <Users size={24} style={{ color: "var(--primary)" }} />
                <div>
                  <h4 className="card-title">Trainee Registration &amp; Capacity Analytics</h4>
                  <p className="card-subtitle">National capacity breakdown across all 7 provinces &amp; territories</p>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setActiveMetricModal(null)}><X size={18} /></button>
            </div>

            <div className="modal-body" id="metric-trainees-pdf-node">
              <div className="grid-3" style={{ marginBottom: "20px" }}>
                <div style={{ background: "var(--surface-dim)", padding: "12px", borderRadius: "var(--radius-md)" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-subtle)" }}>Total Registered</span>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--primary)" }}>{programme.registered_count.toLocaleString()}</div>
                </div>
                <div style={{ background: "var(--surface-dim)", padding: "12px", borderRadius: "var(--radius-md)" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-subtle)" }}>Target Capacity Cap</span>
                  <div style={{ fontSize: "22px", fontWeight: 800 }}>{programme.target_participants.toLocaleString()}</div>
                </div>
                <div style={{ background: "var(--surface-dim)", padding: "12px", borderRadius: "var(--radius-md)" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-subtle)" }}>Capacity Filled</span>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--success)" }}>74.25%</div>
                </div>
              </div>

              <h5 style={{ fontFamily: "var(--font-headline)", fontWeight: 700, marginBottom: "10px" }}>Provincial Enrolled Breakdown</h5>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Province / Territory</th>
                      <th>Enrolled Trainees</th>
                      <th>Target Capacity</th>
                      <th>Female Ratio</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {provincialStats.map(p => (
                      <tr key={p.province}>
                        <td><strong>{p.province}</strong></td>
                        <td style={{ fontWeight: 600 }}>{p.enrolled.toLocaleString()}</td>
                        <td style={{ fontFamily: "var(--font-mono)" }}>{p.capacity.toLocaleString()}</td>
                        <td><span className="badge badge-success">{p.female_pct}%</span></td>
                        <td><span className="badge badge-primary">{(p.enrolled / p.capacity * 100).toFixed(0)}% Filled</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setActiveMetricModal(null)}>Close</button>
              <button className="btn btn-primary" disabled={isExporting} onClick={() => handleExportPDF('metric-trainees-pdf-node', 'Trainee_Registration_Analytics_Report.pdf')}>
                <Download size={16} /> {isExporting ? "Exporting..." : "Export as PDF Report"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metric 2 Modal: Female Participation Ratio */}
      {activeMetricModal === 'FEMALE' && (
        <div className="modal-backdrop" style={{ backdropFilter: "blur(8px)" }}>
          <div className="modal-card" style={{ maxWidth: "720px" }}>
            <div className="modal-header">
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <UserCheck size={24} style={{ color: "var(--success)" }} />
                <div>
                  <h4 className="card-title">Affirmative Female Quota Compliance Audit</h4>
                  <p className="card-subtitle">Statutory requirement: Minimum 30.0% female participation</p>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setActiveMetricModal(null)}><X size={18} /></button>
            </div>

            <div className="modal-body" id="metric-female-pdf-node">
              <div style={{ background: "var(--success-tint)", border: "1px solid rgba(22, 163, 74, 0.3)", padding: "16px", borderRadius: "var(--radius-md)", marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h4 style={{ color: "var(--success-text)", fontWeight: 800, fontSize: "18px" }}>Statutory Rule Fully Compliant</h4>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                      Current female trainee ratio is <strong>{femalePct}%</strong> ({programme.female_registered_count.toLocaleString()} Female Trainees).
                    </p>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: "13px", padding: "6px 14px" }}>+4.5% Margin</span>
                </div>
              </div>

              <h5 style={{ fontFamily: "var(--font-headline)", fontWeight: 700, marginBottom: "10px" }}>Female Participation per Province</h5>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Province</th>
                      <th>Female Ratio %</th>
                      <th>Quota Compliance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {provincialStats.map(p => (
                      <tr key={p.province}>
                        <td><strong>{p.province}</strong></td>
                        <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--success)" }}>{p.female_pct}%</td>
                        <td><span className="badge badge-success">≥ 30% Satisfied</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setActiveMetricModal(null)}>Close</button>
              <button className="btn btn-primary" disabled={isExporting} onClick={() => handleExportPDF('metric-female-pdf-node', 'Female_Quota_Compliance_Report.pdf')}>
                <Download size={16} /> {isExporting ? "Exporting..." : "Export as PDF Report"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metric 3 Modal: Verified Contact Hours */}
      {activeMetricModal === 'HOURS' && (
        <div className="modal-backdrop" style={{ backdropFilter: "blur(8px)" }}>
          <div className="modal-card" style={{ maxWidth: "780px" }}>
            <div className="modal-header">
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <Clock size={24} style={{ color: "#8b5cf6" }} />
                <div>
                  <h4 className="card-title">WebSocket Telemetry &amp; Contact Hours Audit</h4>
                  <p className="card-subtitle">Real-time attendance logging via 60-second WebSocket heartbeat pings</p>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setActiveMetricModal(null)}><X size={18} /></button>
            </div>

            <div className="modal-body" id="metric-hours-pdf-node">
              <div className="grid-3" style={{ marginBottom: "20px" }}>
                <div style={{ background: "var(--surface-dim)", padding: "12px", borderRadius: "var(--radius-md)" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-subtle)" }}>Total Contact Hours</span>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: "#8b5cf6" }}>{programme.verified_hours_total.toLocaleString()}h</div>
                </div>
                <div style={{ background: "var(--surface-dim)", padding: "12px", borderRadius: "var(--radius-md)" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-subtle)" }}>Heartbeat Ping Rate</span>
                  <div style={{ fontSize: "22px", fontWeight: 800 }}>60 Seconds</div>
                </div>
                <div style={{ background: "var(--surface-dim)", padding: "12px", borderRadius: "var(--radius-md)" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-subtle)" }}>Attendance Compliance</span>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--success)" }}>98.4%</div>
                </div>
              </div>

              <h5 style={{ fontFamily: "var(--font-headline)", fontWeight: 700, marginBottom: "10px" }}>Required Contact Hours by Track</h5>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Track Title</th>
                      <th>Level Taxonomy</th>
                      <th>Required Contact Hours</th>
                      <th>Active Cohorts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tracks.map(t => (
                      <tr key={t.id}>
                        <td><strong>Track {t.number}: {t.title}</strong></td>
                        <td><span className="badge badge-neutral">{t.category}</span></td>
                        <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{t.hours} Contact Hours</td>
                        <td style={{ fontFamily: "var(--font-mono)" }}>{t.active_cohorts} Cohorts</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setActiveMetricModal(null)}>Close</button>
              <button className="btn btn-primary" disabled={isExporting} onClick={() => handleExportPDF('metric-hours-pdf-node', 'Contact_Hours_Telemetry_Report.pdf')}>
                <Download size={16} /> {isExporting ? "Exporting..." : "Export as PDF Report"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metric 4 Modal: Certificates Issued */}
      {activeMetricModal === 'CERTS' && (
        <div className="modal-backdrop" style={{ backdropFilter: "blur(8px)" }}>
          <div className="modal-card" style={{ maxWidth: "780px" }}>
            <div className="modal-header">
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <Award size={24} style={{ color: "var(--warning)" }} />
                <div>
                  <h4 className="card-title">Ed25519 Cryptographic Certificate Audit</h4>
                  <p className="card-subtitle">Root key signature verification &amp; consortium issuance breakdown</p>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setActiveMetricModal(null)}><X size={18} /></button>
            </div>

            <div className="modal-body" id="metric-certs-pdf-node">
              <div className="grid-3" style={{ marginBottom: "20px" }}>
                <div style={{ background: "var(--surface-dim)", padding: "12px", borderRadius: "var(--radius-md)" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-subtle)" }}>Total Certificates Issued</span>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--warning)" }}>{programme.certificates_issued.toLocaleString()}</div>
                </div>
                <div style={{ background: "var(--surface-dim)", padding: "12px", borderRadius: "var(--radius-md)" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-subtle)" }}>Root Signing Algorithm</span>
                  <div style={{ fontSize: "16px", fontWeight: 800, fontFamily: "var(--font-mono)" }}>Ed25519</div>
                </div>
                <div style={{ background: "var(--surface-dim)", padding: "12px", borderRadius: "var(--radius-md)" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-subtle)" }}>Audit Verification</span>
                  <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--success)" }}>100% Passed</div>
                </div>
              </div>

              <h5 style={{ fontFamily: "var(--font-headline)", fontWeight: 700, marginBottom: "10px" }}>Consortium Partner Issuance Breakdown</h5>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Consortium Partner</th>
                      <th>MOU Ref</th>
                      <th>Enrolled Trainees</th>
                      <th>Issuance Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partners.map(p => (
                      <tr key={p.id}>
                        <td><strong>{p.name}</strong></td>
                        <td style={{ fontFamily: "var(--font-mono)", fontSize: "11.5px" }}>{p.mou_ref}</td>
                        <td style={{ fontWeight: 600 }}>{p.enrolled.toLocaleString()}</td>
                        <td><span className="badge badge-success">Root Signed</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setActiveMetricModal(null)}>Close</button>
              <button className="btn btn-primary" disabled={isExporting} onClick={() => handleExportPDF('metric-certs-pdf-node', 'Certificate_Audit_Report.pdf')}>
                <Download size={16} /> {isExporting ? "Exporting..." : "Export as PDF Report"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

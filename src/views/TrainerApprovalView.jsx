import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  GraduationCap, 
  Briefcase, 
  ExternalLink, 
  ArrowRight,
  Filter
} from 'lucide-react';

export const TrainerApprovalView = () => {
  const { pendingTrainers, approveTrainer, rejectTrainer, switchRole, navigateTo } = useApp();
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const filtered = pendingTrainers.filter(t => {
    if (filterStatus === "ALL") return true;
    return t.status === filterStatus;
  });

  const pendingCount = pendingTrainers.filter(t => t.status === "PENDING_APPROVAL").length;
  const approvedCount = pendingTrainers.filter(t => t.status === "APPROVED").length;

  const handleApprove = (trainer) => {
    approveTrainer(trainer.id);
    alert(`Success: ${trainer.full_name} has been officially accredited as a Certified AI Trainer by MoITT Super Admin!`);
  };

  const handleReject = (e) => {
    e.preventDefault();
    if (!selectedTrainer) return;
    rejectTrainer(selectedTrainer.id, rejectReason);
    setShowRejectModal(false);
    setRejectReason("");
  };

  const handleImpersonateTrainer = (trainer) => {
    switchRole("TRAINER");
    navigateTo("trainer-hub");
  };

  return (
    <div className="page-view">
      <div className="card" style={{ marginBottom: "20px" }}>
        <div className="card-header">
          <div>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={20} color="var(--primary)" /> Trainer Accreditation & Verification Desk
            </h3>
            <p className="card-subtitle">
              Super Admin authority to verify Trainer SME qualifications against MoITT Tender rules (≥ 16 years education, ≥ 3 years AI experience, verified CNIC).
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <span className="badge badge-warning" style={{ fontSize: "12px", padding: "6px 12px" }}>
              {pendingCount} Awaiting Verification
            </span>
            <span className="badge badge-success" style={{ fontSize: "12px", padding: "6px 12px" }}>
              {approvedCount} Accredited Trainers
            </span>
          </div>
        </div>

        {/* Filter bar */}
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button 
            className={`btn btn-sm ${filterStatus === "ALL" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setFilterStatus("ALL")}
          >
            All Applicants ({pendingTrainers.length})
          </button>
          <button 
            className={`btn btn-sm ${filterStatus === "PENDING_APPROVAL" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setFilterStatus("PENDING_APPROVAL")}
          >
            Pending Verification ({pendingCount})
          </button>
          <button 
            className={`btn btn-sm ${filterStatus === "APPROVED" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setFilterStatus("APPROVED")}
          >
            Approved ({approvedCount})
          </button>
        </div>
      </div>

      <div className="grid-12">
        <div className="col-span-12">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Applicant Roster & Qualification Metrics</h4>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {filtered.map(trainer => (
                <div 
                  key={trainer.id}
                  style={{ 
                    border: trainer.status === "PENDING_APPROVAL" ? "2px solid var(--warning-border, #fef3c7)" : "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "20px",
                    background: "var(--surface-card)",
                    boxShadow: "var(--shadow-sm)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 700, color: "var(--text-subtle)" }}>
                          {trainer.id}
                        </span>
                        {trainer.status === "PENDING_APPROVAL" && (
                          <span className="badge badge-warning">
                            <Clock size={11} style={{ marginRight: "4px" }} /> PENDING SUPER ADMIN APPROVAL
                          </span>
                        )}
                        {trainer.status === "APPROVED" && (
                          <span className="badge badge-success">
                            <CheckCircle2 size={11} style={{ marginRight: "4px" }} /> ACCREDITED INSTRUCTOR
                          </span>
                        )}
                        {trainer.status === "REJECTED" && (
                          <span className="badge badge-danger">
                            <XCircle size={11} style={{ marginRight: "4px" }} /> REJECTED
                          </span>
                        )}
                      </div>

                      <h3 style={{ fontSize: "17px", fontWeight: 800, color: "var(--text-main)", margin: "4px 0" }}>
                        {trainer.full_name}
                      </h3>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        {trainer.institution} • {trainer.email} • CNIC: <span style={{ fontFamily: "var(--font-mono)" }}>{trainer.cnic}</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      {trainer.status === "PENDING_APPROVAL" && (
                        <>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => { setSelectedTrainer(trainer); setShowRejectModal(true); }}
                          >
                            <XCircle size={14} /> Reject
                          </button>
                          <button 
                            className="btn btn-primary btn-sm"
                            style={{ background: "var(--success)", borderColor: "var(--success)" }}
                            onClick={() => handleApprove(trainer)}
                          >
                            <CheckCircle2 size={14} /> 🟢 Verify & Approve Trainer
                          </button>
                        </>
                      )}

                      {trainer.status === "APPROVED" && (
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => handleImpersonateTrainer(trainer)}
                        >
                          🚀 Launch Trainer Portal <ArrowRight size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Criteria Checklist */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", background: "var(--surface-dim)", padding: "12px 16px", borderRadius: "var(--radius-sm)", marginBottom: "14px", fontSize: "12px" }}>
                    <div>
                      <div style={{ color: "var(--text-subtle)", fontWeight: 600 }}>🎓 Education (≥ 16 Years):</div>
                      <div style={{ color: "var(--text-main)", fontWeight: 700, marginTop: "2px" }}>{trainer.education}</div>
                    </div>
                    <div>
                      <div style={{ color: "var(--text-subtle)", fontWeight: 600 }}>💼 Industry Experience:</div>
                      <div style={{ color: "var(--text-main)", fontWeight: 700, marginTop: "2px" }}>{trainer.experience_years} Years (Requirement: ≥ 3 yrs)</div>
                    </div>
                    <div>
                      <div style={{ color: "var(--text-subtle)", fontWeight: 600 }}>🎯 Assigned Track:</div>
                      <div style={{ color: "var(--primary)", fontWeight: 700, marginTop: "2px" }}>{trainer.assigned_track}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ color: "var(--text-subtle)", fontWeight: 600 }}>Specializations:</span>
                      {trainer.specializations.map(s => (
                        <span key={s} className="badge badge-neutral" style={{ fontSize: "11px" }}>{s}</span>
                      ))}
                    </div>

                    {trainer.portfolio_url && (
                      <a href={trainer.portfolio_url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ textDecoration: "none" }}>
                        <ExternalLink size={12} /> Inspect Profile / Portfolio
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showRejectModal && selectedTrainer && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Reject Trainer Application</h3>
              <button className="btn-close" onClick={() => setShowRejectModal(false)}>×</button>
            </div>
            <form onSubmit={handleReject}>
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="form-label">Rejection Reason (RFP Compliance Check) *</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="State reason (e.g. Under 3 years experience, unaccredited degree, missing CNIC verification)..."
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                ></textarea>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRejectModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ background: "var(--error)", borderColor: "var(--error)" }}>
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

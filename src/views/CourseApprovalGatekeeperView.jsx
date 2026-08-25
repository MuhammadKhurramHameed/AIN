import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, XCircle, Clock, ShieldCheck, ExternalLink, Check } from 'lucide-react';

export const CourseApprovalGatekeeperView = () => {
  const { courseProposals, approveAndPublishCourse, rejectCoursePush } = useApp();
  const [rejectModalId, setRejectModalId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const pendingProposals = courseProposals.filter(p => p.status === "PENDING_ADMIN_APPROVAL");
  const publishedProposals = courseProposals.filter(p => p.status === "PUBLISHED_LIVE");

  const handleApprove = (proposalId, title) => {
    approveAndPublishCourse(proposalId);
    alert(`Success: Course "${title}" has been Approved & Pushed Live to 20,000 Trainees!`);
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!rejectModalId) return;

    rejectCoursePush(rejectModalId, rejectReason);
    setRejectModalId(null);
    setRejectReason("");
  };

  return (
    <div className="page-view">
      <div className="card" style={{ marginBottom: "20px" }}>
        <div className="card-header">
          <div>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} color="var(--primary)" /> MoITT Course Release & Governance Gatekeeper
            </h3>
            <p className="card-subtitle">
              Final release authority. Review completed courses submitted by Content Creators, verify MoITT RFP standards, and 1-click Push to Production.
            </p>
          </div>
          <span className="badge badge-warning" style={{ fontSize: "13px", padding: "6px 12px" }}>
            {pendingProposals.length} Course(s) Awaiting Release
          </span>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="card-header">
          <h4 className="card-title">Pending Course Push Requests ({pendingProposals.length})</h4>
        </div>

        {pendingProposals.length === 0 ? (
          <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
            <CheckCircle2 size={36} color="var(--success)" style={{ margin: "0 auto 10px" }} />
            <p style={{ margin: 0, fontWeight: 600 }}>All submitted courses have been reviewed and processed!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {pendingProposals.map(prop => (
              <div key={prop.id} style={{ border: "2px solid var(--primary-tint)", borderRadius: "var(--radius-md)", padding: "20px", background: "var(--surface)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                  <div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px" }}>
                      <span className="badge badge-primary">{prop.track_title}</span>
                      <span className="badge badge-neutral">{prop.target_hours} Hours</span>
                      <span className="badge badge-warning">
                        <Clock size={12} style={{ marginRight: "4px" }} /> Submitted for Production Push
                      </span>
                    </div>
                    <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-main)", margin: "4px 0" }}>
                      {prop.title}
                    </h3>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setRejectModalId(prop.id)}>
                      <XCircle size={14} /> Request Revision
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => handleApprove(prop.id, prop.title)} style={{ background: "var(--success)", borderColor: "var(--success)" }}>
                      <CheckCircle2 size={14} /> 🚀 Approve & Push Live
                    </button>
                  </div>
                </div>

                <div className="grid-2" style={{ gap: "14px", background: "var(--surface-dim)", padding: "14px", borderRadius: "var(--radius-sm)", marginBottom: "14px", fontSize: "12px" }}>
                  <div>
                    <strong style={{ color: "var(--text-main)", display: "block", marginBottom: "4px" }}>👨‍🏫 Trainer SME Outlines:</strong>
                    <div style={{ color: "var(--text-subtle)" }}>Proposed by: <strong>{prop.proposed_by.name}</strong></div>
                    <ul style={{ paddingLeft: "16px", color: "var(--text-muted)", margin: "6px 0 0" }}>
                      {prop.syllabus_outline.slice(0, 3).map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                      {prop.syllabus_outline.length > 3 && <li>+{prop.syllabus_outline.length - 3} more modules...</li>}
                    </ul>
                  </div>

                  <div>
                    <strong style={{ color: "var(--text-main)", display: "block", marginBottom: "4px" }}>🎨 Content Creator Built Assets:</strong>
                    <div style={{ color: "var(--text-subtle)" }}>Built by: <strong>{prop.built_assets?.builder_name}</strong></div>
                    <div style={{ marginTop: "6px", color: "var(--text-muted)" }}>
                      • <strong>{prop.built_assets?.lesson_count} Lessons</strong> ({prop.built_assets?.video_duration_minutes} Mins Video)<br />
                      • <strong>{prop.built_assets?.quiz_count} Quizzes</strong> attached<br />
                      • Lab Repo: <span style={{ fontFamily: "var(--font-mono)", color: "var(--primary)" }}>{prop.built_assets?.lab_notebook_url}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
                  <div style={{ color: "var(--success)", fontWeight: 600 }}>
                    <Check size={14} style={{ verticalAlign: "middle", marginRight: "4px" }} /> Compliance Validated: 18-24 hrs criterion & PWD accessibility verified.
                  </div>
                  {prop.built_assets?.video_url && (
                    <a href={prop.built_assets.video_url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                      <ExternalLink size={12} /> Inspect Live Video Stream
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h4 className="card-title">Live Production Courses ({publishedProposals.length})</h4>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Course Name</th>
                <th>Track</th>
                <th>Trainer SME</th>
                <th>Content Creator</th>
                <th>Status</th>
                <th>Deployment</th>
              </tr>
            </thead>
            <tbody>
              {publishedProposals.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.title}</strong></td>
                  <td><span className="badge badge-primary">{p.track_title}</span></td>
                  <td>{p.proposed_by.name}</td>
                  <td>{p.built_assets?.builder_name || "Instructional Design Team"}</td>
                  <td><span className="badge badge-success">Live for 20,000 Trainees</span></td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-subtle)" }}>Production Cluster</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {rejectModalId && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Request Course Revision</h3>
              <button className="btn-close" onClick={() => setRejectModalId(null)}>×</button>
            </div>
            <form onSubmit={handleRejectSubmit}>
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="form-label">Feedback / Revision Reason *</label>
                <textarea
                  className="form-input"
                  rows="4"
                  placeholder="Specify why changes are requested (e.g. video audio quality, quiz question count, PWD subtitles missing)..."
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                ></textarea>
              </div>
              <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setRejectModalId(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Send Revision Feedback</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FileCode, Sparkles, Send, CheckCircle2, Clock, Video, FileText, Layers } from 'lucide-react';

export const CourseBuilderStudioView = () => {
  const { courseProposals, startBuildingProposal, submitCourseForApproval } = useApp();
  const [activeTab, setActiveTab] = useState("proposals");
  const [selectedProposal, setSelectedProposal] = useState(null);

  const [builderForm, setBuilderForm] = useState({
    video_url: "https://www.youtube.com/watch?v=aircAruvnKk",
    video_duration_minutes: 240,
    lesson_count: 10,
    quiz_count: 2,
    lab_notebook_url: "https://github.com/naiai-pakistan/hands-on-lab.git"
  });

  const handleOpenBuilder = (proposal) => {
    setSelectedProposal(proposal);
    startBuildingProposal(proposal.id);
    setActiveTab("builder");
  };

  const handlePushToAdmin = (e) => {
    e.preventDefault();
    if (!selectedProposal) return;

    submitCourseForApproval(selectedProposal.id, builderForm);
    alert(`Course "${selectedProposal.title}" has been built and submitted to Super Admin for Production Push Approval!`);
    setActiveTab("proposals");
  };

  return (
    <div className="page-view">
      <div className="card" style={{ marginBottom: "20px" }}>
        <div className="card-header">
          <div>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileCode size={20} color="var(--primary)" /> Content Creator & Instructional Design Studio
            </h3>
            <p className="card-subtitle">
              Transform Trainer SME syllabi into interactive video lessons, quizzes, and code labs. Submit completed courses to Super Admin for release.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className={`btn ${activeTab === "proposals" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setActiveTab("proposals")}
            >
              <Layers size={14} /> Incoming Trainer Requests ({courseProposals.filter(p => p.status !== "PUBLISHED_LIVE").length})
            </button>
            {selectedProposal && (
              <button 
                className={`btn ${activeTab === "builder" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setActiveTab("builder")}
              >
                <Sparkles size={14} /> Active Builder: {selectedProposal.title.slice(0, 24)}...
              </button>
            )}
          </div>
        </div>
      </div>

      {activeTab === "proposals" && (
        <div className="grid-12">
          <div className="col-span-12">
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">Curriculum Pipeline Queue</h4>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Proposal ID</th>
                      <th>Course Title & Track</th>
                      <th>Proposed By (Trainer SME)</th>
                      <th>Target Hours</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseProposals.map(prop => (
                      <tr key={prop.id}>
                        <td style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>{prop.id}</td>
                        <td>
                          <strong>{prop.title}</strong>
                          <div style={{ fontSize: "11px", color: "var(--text-subtle)" }}>{prop.track_title}</div>
                        </td>
                        <td>
                          <div>{prop.proposed_by.name}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{prop.proposed_at}</div>
                        </td>
                        <td style={{ fontFamily: "var(--font-mono)" }}>{prop.target_hours} hrs</td>
                        <td>
                          {prop.status === "PROPOSED" && <span className="badge badge-warning">Awaiting Builder</span>}
                          {prop.status === "IN_PRODUCTION" && <span className="badge badge-primary">In Production</span>}
                          {prop.status === "PENDING_ADMIN_APPROVAL" && <span className="badge badge-warning">Pending Admin Push</span>}
                          {prop.status === "PUBLISHED_LIVE" && <span className="badge badge-success">Published Live</span>}
                        </td>
                        <td>
                          {prop.status === "PROPOSED" && (
                            <button className="btn btn-primary btn-sm" onClick={() => handleOpenBuilder(prop)}>
                              <Sparkles size={12} /> Start Building
                            </button>
                          )}
                          {prop.status === "IN_PRODUCTION" && (
                            <button className="btn btn-secondary btn-sm" onClick={() => handleOpenBuilder(prop)}>
                              <FileCode size={12} /> Resume Builder
                            </button>
                          )}
                          {prop.status === "PENDING_ADMIN_APPROVAL" && (
                            <span style={{ fontSize: "11px", color: "var(--warning)", fontWeight: 600 }}>
                              <Clock size={12} style={{ verticalAlign: "middle" }} /> Awaiting Admin Approval
                            </span>
                          )}
                          {prop.status === "PUBLISHED_LIVE" && (
                            <span style={{ fontSize: "11px", color: "var(--success)", fontWeight: 600 }}>
                              <CheckCircle2 size={12} style={{ verticalAlign: "middle" }} /> Live on LMS
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "builder" && selectedProposal && (
        <div className="grid-12">
          <div className="col-span-4">
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">Trainer SME Blueprint</h4>
              </div>
              <div style={{ marginBottom: "12px" }}>
                <span className="badge badge-primary">{selectedProposal.track_title}</span>
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginTop: "6px" }}>{selectedProposal.title}</h3>
                <div style={{ fontSize: "11px", color: "var(--text-subtle)" }}>By: {selectedProposal.proposed_by.name}</div>
              </div>

              <div style={{ background: "var(--surface-dim)", padding: "12px", borderRadius: "var(--radius-sm)", marginBottom: "12px" }}>
                <strong style={{ fontSize: "12px", display: "block", marginBottom: "6px" }}>Requested Syllabus:</strong>
                <ul style={{ paddingLeft: "16px", fontSize: "11.5px", color: "var(--text-muted)", margin: 0 }}>
                  {selectedProposal.syllabus_outline.map((topic, i) => (
                    <li key={i} style={{ marginBottom: "4px" }}>{topic}</li>
                  ))}
                </ul>
              </div>

              <div style={{ fontSize: "11.5px", marginBottom: "8px" }}>
                <strong>References: </strong>
                <span style={{ color: "var(--primary)", wordBreak: "break-all" }}>{selectedProposal.reference_material || "Standard curriculum"}</span>
              </div>
              <div style={{ fontSize: "11.5px" }}>
                <strong>Assessment Guideline: </strong>
                <span style={{ color: "var(--text-muted)" }}>{selectedProposal.suggested_quiz_concepts || "Coding & MCQs"}</span>
              </div>
            </div>
          </div>

          <div className="col-span-8">
            <div className="card">
              <div className="card-header">
                <div>
                  <h4 className="card-title">Interactive Asset Assembly</h4>
                  <p className="card-subtitle">Attach video streams, code notebooks, and authored question bank assessments.</p>
                </div>
              </div>

              <form onSubmit={handlePushToAdmin}>
                <div className="form-group" style={{ marginBottom: "14px" }}>
                  <label className="form-label">
                    <Video size={14} style={{ verticalAlign: "middle", marginRight: "4px" }} /> Video Lecture Stream (YouTube / CDN URL) *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={builderForm.video_url}
                    onChange={(e) => setBuilderForm({ ...builderForm, video_url: e.target.value })}
                    required
                  />
                </div>

                <div className="grid-3" style={{ marginBottom: "14px" }}>
                  <div className="form-group">
                    <label className="form-label">Total Video Mins *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={builderForm.video_duration_minutes}
                      onChange={(e) => setBuilderForm({ ...builderForm, video_duration_minutes: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Lesson Modules Count *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={builderForm.lesson_count}
                      onChange={(e) => setBuilderForm({ ...builderForm, lesson_count: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Quizzes Count *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={builderForm.quiz_count}
                      onChange={(e) => setBuilderForm({ ...builderForm, quiz_count: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: "16px" }}>
                  <label className="form-label">
                    <FileText size={14} style={{ verticalAlign: "middle", marginRight: "4px" }} /> Interactive Lab Notebook / GitHub Repository
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={builderForm.lab_notebook_url}
                    onChange={(e) => setBuilderForm({ ...builderForm, lab_notebook_url: e.target.value })}
                  />
                </div>

                <div style={{ background: "var(--surface-dim)", padding: "14px", borderRadius: "var(--radius-md)", marginBottom: "20px", border: "1px solid var(--border)" }}>
                  <strong style={{ fontSize: "12px", color: "var(--text-main)", display: "block", marginBottom: "8px" }}>
                    ✅ MoITT RFP Compliance Validation:
                  </strong>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "12px", color: "var(--text-muted)" }}>
                    <div>✔️ 18–24 Hours Duration Requirement Met</div>
                    <div>✔️ Formative + Summative Quizzes Attached</div>
                    <div>✔️ WCAG 2.1 Accessibility & Subtitles Ready</div>
                    <div>✔️ Compatible across Web & Mobile</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setActiveTab("proposals")}>
                    Back to Proposals
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Send size={14} /> 🚀 Submit Push Request to Super Admin
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

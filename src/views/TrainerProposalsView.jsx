import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lightbulb, Plus, CheckCircle, Clock, Send, ExternalLink, Sparkles } from 'lucide-react';

export const TrainerProposalsView = () => {
  const { courseProposals, proposeCourse, tracks } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    track_id: "track-1",
    level_code: "LEVEL_2_APPLIED",
    target_hours: 24,
    syllabus_text: "",
    reference_material: "",
    suggested_quiz_concepts: ""
  });

  const handleTrackChange = (e) => {
    const selectedTrack = tracks.find(t => t.id === e.target.value);
    setFormData(prev => ({
      ...prev,
      track_id: e.target.value,
      level_code: selectedTrack?.level_code || "LEVEL_2_APPLIED",
      target_hours: selectedTrack?.hours || 24
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const selectedTrack = tracks.find(t => t.id === formData.track_id);
    const outline = formData.syllabus_text
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    proposeCourse({
      title: formData.title,
      track_id: formData.track_id,
      track_title: selectedTrack?.title || "Track 1: Applied ML",
      level_code: formData.level_code,
      target_hours: formData.target_hours,
      syllabus_outline: outline.length > 0 ? outline : ["Module 1: Fundamentals", "Module 2: Hands-On Code Lab", "Module 3: Capstone Deployment"],
      reference_material: formData.reference_material,
      suggested_quiz_concepts: formData.suggested_quiz_concepts
    });

    setShowModal(false);
    setFormData({
      title: "",
      track_id: "track-1",
      level_code: "LEVEL_2_APPLIED",
      target_hours: 24,
      syllabus_text: "",
      reference_material: "",
      suggested_quiz_concepts: ""
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PROPOSED":
        return <span className="badge badge-warning"><Clock size={12} style={{ marginRight: "4px" }} /> Awaiting Content Creator</span>;
      case "IN_PRODUCTION":
        return <span className="badge badge-primary"><Sparkles size={12} style={{ marginRight: "4px" }} /> In Production by Creator</span>;
      case "PENDING_ADMIN_APPROVAL":
        return <span className="badge badge-warning"><Clock size={12} style={{ marginRight: "4px" }} /> Pending Admin Push Approval</span>;
      case "PUBLISHED_LIVE":
        return <span className="badge badge-success"><CheckCircle size={12} style={{ marginRight: "4px" }} /> Published Live to Trainees</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  return (
    <div className="page-view">
      <div className="card" style={{ marginBottom: "20px" }}>
        <div className="card-header">
          <div>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lightbulb size={20} color="var(--primary)" /> Trainer Subject Matter Expert (SME) Proposals
            </h3>
            <p className="card-subtitle">
              Propose new course topics, outline syllabus requirements, and delegate interactive content construction to Content Creators.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Propose New Course Syllabus
          </button>
        </div>

        <div className="grid-3" style={{ marginTop: '10px' }}>
          <div style={{ background: "var(--surface-dim)", padding: "16px", borderRadius: "var(--radius-md)", borderLeft: "4px solid var(--primary)" }}>
            <div style={{ fontSize: "12px", color: "var(--text-subtle)", fontWeight: 600 }}>1. SME IDEATION</div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-main)", marginTop: "4px" }}>Trainer Outlines Topics</div>
            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "4px" }}>Define core learning objectives, reference links & assessment requirements.</div>
          </div>
          <div style={{ background: "var(--surface-dim)", padding: "16px", borderRadius: "var(--radius-md)", borderLeft: "4px solid var(--warning)" }}>
            <div style={{ fontSize: "12px", color: "var(--text-subtle)", fontWeight: 600 }}>2. CONTENT PRODUCTION</div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-main)", marginTop: "4px" }}>Creator Builds Assets</div>
            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "4px" }}>Instructional designers create video lectures, notes & question bank quizzes.</div>
          </div>
          <div style={{ background: "var(--surface-dim)", padding: "16px", borderRadius: "var(--radius-md)", borderLeft: "4px solid var(--success)" }}>
            <div style={{ fontSize: "12px", color: "var(--text-subtle)", fontWeight: 600 }}>3. ADMIN GATEKEEPER</div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-main)", marginTop: "4px" }}>Super Admin Pushes Live</div>
            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "4px" }}>Compliance verified against 18-24 hr criteria and published to 20k trainees.</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h4 className="card-title">My Proposed Curricula Pipeline ({courseProposals.length})</h4>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {courseProposals.map(proposal => (
            <div key={proposal.id} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "18px", background: "var(--surface)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <span className="badge badge-primary">{proposal.track_title}</span>
                    <span className="badge badge-neutral" style={{ fontFamily: "var(--font-mono)" }}>{proposal.target_hours} Hours Target</span>
                    {getStatusBadge(proposal.status)}
                  </div>
                  <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-main)", margin: "4px 0" }}>
                    {proposal.title}
                  </h3>
                  <div style={{ fontSize: "12px", color: "var(--text-subtle)" }}>
                    Proposed by <strong>{proposal.proposed_by.name}</strong> • Timestamp: {proposal.proposed_at}
                  </div>
                </div>

                {proposal.status === "PUBLISHED_LIVE" && (
                  <span className="badge badge-success" style={{ fontSize: "12px", padding: "6px 12px" }}>
                    🚀 Live on Platform
                  </span>
                )}
              </div>

              <div style={{ background: "var(--surface-dim)", padding: "12px 16px", borderRadius: "var(--radius-sm)", marginBottom: "12px" }}>
                <strong style={{ fontSize: "12px", color: "var(--text-main)", display: "block", marginBottom: "6px" }}>
                  📋 Syllabus & Learning Modules:
                </strong>
                <ul style={{ paddingLeft: "18px", fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
                  {proposal.syllabus_outline.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: "3px" }}>{item}</li>
                  ))}
                </ul>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "12px" }}>
                <div>
                  <span style={{ color: "var(--text-subtle)", fontWeight: 600 }}>Reference Material: </span>
                  <span style={{ color: "var(--primary)", fontFamily: "var(--font-mono)" }}>{proposal.reference_material || "N/A"}</span>
                </div>
                <div>
                  <span style={{ color: "var(--text-subtle)", fontWeight: 600 }}>Assessment Focus: </span>
                  <span style={{ color: "var(--text-muted)" }}>{proposal.suggested_quiz_concepts || "Practical coding & concept evaluation"}</span>
                </div>
              </div>

              {proposal.built_assets && (
                <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px dashed var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
                  <div>
                    <span className="badge badge-success" style={{ marginRight: "8px" }}>Assets Attached</span>
                    <span style={{ color: "var(--text-subtle)" }}>Built by <strong>{proposal.built_assets.builder_name}</strong> ({proposal.built_assets.lesson_count} Lessons, {proposal.built_assets.quiz_count} Quizzes)</span>
                  </div>
                  {proposal.built_assets.video_url && (
                    <a href={proposal.built_assets.video_url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                      <ExternalLink size={12} /> Preview Lecture Video
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: "600px" }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lightbulb size={18} color="var(--primary)" /> Propose Course Curriculum (Trainer SME)
              </h3>
              <button className="btn-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: "14px" }}>
                <label className="form-label">Course Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Deep Reinforcement Learning for Autonomous Robotics"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid-2" style={{ marginBottom: "14px" }}>
                <div className="form-group">
                  <label className="form-label">Target Track *</label>
                  <select className="form-input" value={formData.track_id} onChange={handleTrackChange}>
                    {tracks.map(t => (
                      <option key={t.id} value={t.id}>Track #{t.number}: {t.title}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Target Duration (Hours) *</label>
                  <input
                    type="number"
                    className="form-input"
                    min="18"
                    max="40"
                    value={formData.target_hours}
                    onChange={(e) => setFormData({ ...formData, target_hours: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "14px" }}>
                <label className="form-label">Syllabus Outline (One topic per line) *</label>
                <textarea
                  className="form-input"
                  rows="4"
                  placeholder="Module 1: Fundamentals & Math&#10;Module 2: Hands-On Code Lab&#10;Module 3: Deployment & Docker&#10;Module 4: Real-world Capstone"
                  required
                  value={formData.syllabus_text}
                  onChange={(e) => setFormData({ ...formData, syllabus_text: e.target.value })}
                ></textarea>
              </div>

              <div className="form-group" style={{ marginBottom: "14px" }}>
                <label className="form-label">Reference Material / GitHub Repo / Papers</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://github.com/..."
                  value={formData.reference_material}
                  onChange={(e) => setFormData({ ...formData, reference_material: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label className="form-label">Suggested Assessment Concepts</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Model evaluation metrics, parameter tuning quiz, Docker deployment test"
                  value={formData.suggested_quiz_concepts}
                  onChange={(e) => setFormData({ ...formData, suggested_quiz_concepts: e.target.value })}
                />
              </div>

              <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <Send size={14} /> Send Proposal to Content Creator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

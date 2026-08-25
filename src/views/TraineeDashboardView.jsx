import React from 'react';
import { useApp } from '../context/AppContext';
import { PlayCircle, CheckCircle, Clock, Award, FileText } from 'lucide-react';

export const TraineeDashboardView = () => {
  const { currentUser, traineeHours, navigateTo } = useApp();

  return (
    <div className="page-view">
      <div className="grid-12">
        <div className="col-span-8">
          <div className="card" style={{ marginBottom: "24px", background: "linear-gradient(135deg, #1e3a8a, #1d4ed8)", color: "#ffffff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span className="badge" style={{ background: "rgba(255,255,255,0.2)", color: "#ffffff", marginBottom: "8px" }}>
                  Enrolled Trainee
                </span>
                <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "24px", fontWeight: 800 }}>
                  Welcome back, {currentUser.name}!
                </h2>
                <p style={{ opacity: 0.9, fontSize: "13px", marginTop: "4px" }}>
                  Track 1: Students & Fresh Graduates (Level 2: Applied)
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <button
                  className="btn btn-secondary"
                  style={{ background: "rgba(255,255,255,0.15)", color: "#ffffff", borderColor: "rgba(255,255,255,0.3)" }}
                  onClick={() => navigateTo("trainee-classroom")}
                >
                  <PlayCircle size={16} /> Join Live Session
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Enrolled Track Curriculum Progress</h3>
              <span className="badge badge-success">89% Completed</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", background: "var(--surface-dim)", borderRadius: "var(--radius-md)" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <CheckCircle size={18} style={{ color: "var(--success)" }} />
                  <div>
                    <strong style={{ fontSize: "13.5px" }}>Module 1: Python for AI & Math Foundations</strong>
                    <div style={{ fontSize: "11px", color: "var(--text-subtle)" }}>4.0 Contact Hours • Completed</div>
                  </div>
                </div>
                <span className="badge badge-success">Passed</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", background: "var(--surface-dim)", borderRadius: "var(--radius-md)" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <CheckCircle size={18} style={{ color: "var(--success)" }} />
                  <div>
                    <strong style={{ fontSize: "13.5px" }}>Module 2: Machine Learning Foundations & Computer Vision</strong>
                    <div style={{ fontSize: "11px", color: "var(--text-subtle)" }}>6.0 Contact Hours • Completed</div>
                  </div>
                </div>
                <span className="badge badge-success">Passed</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", background: "var(--surface-dim)", borderRadius: "var(--radius-md)" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <CheckCircle size={18} style={{ color: "var(--success)" }} />
                  <div>
                    <strong style={{ fontSize: "13.5px" }}>Module 3: NLP & LLM Prompt Engineering</strong>
                    <div style={{ fontSize: "11px", color: "var(--text-subtle)" }}>6.0 Contact Hours • Completed</div>
                  </div>
                </div>
                <span className="badge badge-success">Passed</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", background: "var(--primary-tint)", border: "1px solid var(--primary-border)", borderRadius: "var(--radius-md)" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <Clock size={18} style={{ color: "var(--primary)" }} />
                  <div>
                    <strong style={{ fontSize: "13.5px", color: "var(--primary-dark)" }}>Module 4: End-to-End MLOps Pipeline & Capstone</strong>
                    <div style={{ fontSize: "11px", color: "var(--text-subtle)" }}>{traineeHours.toFixed(1)} / 24.0 Contact Hours Completed</div>
                  </div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => navigateTo("trainee-assessment")}>
                  <FileText size={14} /> Take Assessment
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-4">
          <div className="card" style={{ marginBottom: "24px", textAlign: "center" }}>
            <h4 className="card-title" style={{ marginBottom: "12px" }}>Contact Hours Telemetry</h4>
            <div style={{ position: "relative", width: "140px", height: "140px", margin: "0 auto" }}>
              <svg viewBox="0 0 36 36" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1d4ed8" strokeWidth="3.5" strokeDasharray={`${(traineeHours / 24.0 * 100).toFixed(0)}, 100`} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "var(--font-headline)", fontSize: "24px", fontWeight: 800, color: "var(--primary)" }}>
                  {traineeHours.toFixed(1)}h
                </span>
                <span style={{ fontSize: "10px", color: "var(--text-subtle)" }}>Target: 24.0h</span>
              </div>
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "12px" }}>
              {(24.0 - traineeHours).toFixed(1)} hours remaining to unlock final certificate issuance!
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Certificate Status</h4>
            </div>
            <div style={{ textAlign: "center", padding: "12px" }}>
              <Award size={40} style={{ color: "var(--success)", margin: "0 auto 8px auto" }} />
              <p style={{ fontSize: "12px", color: "var(--text-subtle)", margin: "8px 0 16px 0" }}>
                Capstone Evaluation Score: <strong>92.5%</strong>
              </p>
              <button className="btn btn-primary btn-sm" style={{ width: "100%" }} onClick={() => navigateTo("trainee-certificate")}>
                View Certificate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

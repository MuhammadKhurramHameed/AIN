import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Award, CheckCircle } from 'lucide-react';

export const EvaluationWorkspaceView = () => {
  const { navigateTo } = useApp();
  const [s1, setS1] = useState(38);
  const [s2, setS2] = useState(36);
  const [s3, setS3] = useState(18.5);

  const totalScore = s1 + s2 + s3;

  const handleApprove = () => {
    alert("Capstone Evaluation Approved!\n\nCertificate NAIAI-2026-884920 has been digitally signed using root key Ed25519 and dispatched to trainee Fatima Khan.");
    navigateTo("authenticator");
  };

  return (
    <div className="page-view">
      <div className="grid-12">
        <div className="col-span-8">
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Capstone Project Evaluation Workspace</h3>
                <p className="card-subtitle">Trainee: <strong>Fatima Khan</strong> (Students & Fresh Graduates Track)</p>
              </div>
              <span className="badge badge-primary">Submission #884920</span>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label className="form-label">Submission Title:</label>
              <h4 style={{ fontFamily: "var(--font-headline)", fontSize: "16px", fontWeight: 700, color: "var(--primary)" }}>
                End-to-End MLOps Pipeline for Crop Disease Detection
              </h4>
              <p style={{ fontSize: "12.5px", color: "var(--text-subtle)", marginTop: "4px" }}>
                GitHub Repo: <code>github.com/fatimarepo/mlops-agtech-pipeline</code> | Submitted: 2026-08-22
              </p>
            </div>

            <pre className="code-box" style={{ marginBottom: "20px" }}>{`# Sample Model Pipeline Deployment Script (MLflow + FastAPI)
from fastapi import FastAPI, UploadFile
import torch

app = FastAPI(title="Crop Diagnostics Engine")

@app.post("/predict")
async def predict_crop_disease(file: UploadFile):
    image_bytes = await file.read()
    tensor = preprocess_image(image_bytes)
    prediction = model(tensor)
    return {"disease": prediction.label, "confidence": float(prediction.score)}`}</pre>

            <div className="card" style={{ background: "var(--surface-dim)", border: "none" }}>
              <h4 className="card-title" style={{ marginBottom: "12px" }}>Rubric Evaluation Sliders</h4>

              <div className="form-group">
                <label className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Code Quality & Architecture (40 pts)</span>
                  <strong>{s1}/40</strong>
                </label>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={s1}
                  className="form-control"
                  onChange={(e) => setS1(parseFloat(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Model Accuracy & Pipeline Robustness (40 pts)</span>
                  <strong>{s2}/40</strong>
                </label>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={s2}
                  className="form-control"
                  onChange={(e) => setS2(parseFloat(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Documentation & Deployment SOP (20 pts)</span>
                  <strong>{s3}/20</strong>
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.5"
                  value={s3}
                  className="form-control"
                  onChange={(e) => setS3(parseFloat(e.target.value))}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)" }}>
                <span style={{ fontWeight: 700, fontSize: "15px" }}>Total Score:</span>
                <span style={{ fontFamily: "var(--font-headline)", fontSize: "22px", fontWeight: 800, color: "var(--success)" }}>
                  {totalScore.toFixed(1)} / 100
                </span>
              </div>
            </div>

            <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button className="btn btn-secondary">Request Revision</button>
              <button className="btn btn-primary btn-lg" onClick={handleApprove}>
                <Award size={18} /> Approve Capstone & Issue Certificate
              </button>
            </div>
          </div>
        </div>

        <div className="col-span-4">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Evaluation Checklist</h4>
            </div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", fontSize: "12.5px" }}>
              <li style={{ display: "flex", gap: "8px" }}>
                <CheckCircle size={16} style={{ color: "var(--success)" }} /> 24.0 Contact Hours verified by WebSocket telemetry
              </li>
              <li style={{ display: "flex", gap: "8px" }}>
                <CheckCircle size={16} style={{ color: "var(--success)" }} /> Passed Timed MLOps Qualification Exam (Score: 94%)
              </li>
              <li style={{ display: "flex", gap: "8px" }}>
                <CheckCircle size={16} style={{ color: "var(--success)" }} /> Plagiarism check passed (Similarity index &lt; 4%)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

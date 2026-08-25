import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserPlus, Upload, X, CheckCircle, Users } from 'lucide-react';

export const ConsortiumDashboardView = () => {
  const { trainers, addTrainer, bulkRegisterTrainees, navigateTo } = useApp();
  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Trainer Form
  const [trainerForm, setTrainerForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    cnic: '',
    specialization: 'Applied MLOps & Computer Vision'
  });

  // Bulk Trainee Form
  const [bulkText, setBulkText] = useState(`[
  { "fullName": "Ayesha Zainab", "gender": "FEMALE", "province": "Punjab", "district": "Lahore", "trackId": "track-1" },
  { "fullName": "Bilal Ahmed", "gender": "MALE", "province": "Sindh", "district": "Karachi", "trackId": "track-1" },
  { "fullName": "Sobia Hassan", "gender": "FEMALE", "province": "Khyber Pakhtunkhwa", "district": "Peshawar", "trackId": "track-2" }
]`);

  const handleAddTrainer = (e) => {
    e.preventDefault();
    if (!trainerForm.fullName || !trainerForm.email) {
      alert("Please fill trainer name and official email.");
      return;
    }
    addTrainer({
      ...trainerForm,
      consortiumPartner: "National University of Sciences & Technology (NUST)"
    });
    setShowTrainerModal(false);
    setTrainerForm({ fullName: '', email: '', phone: '', cnic: '', specialization: 'Applied MLOps & Computer Vision' });
    alert(`Trainer "${trainerForm.fullName}" successfully registered and assigned credentials!`);
  };

  const handleBulkUpload = (e) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(bulkText);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        alert("Please provide a valid non-empty JSON array of trainees.");
        return;
      }
      bulkRegisterTrainees(parsed, "NUST Consortium Partner");
      setShowBulkModal(false);
      alert(`Bulk Registration Completed!\n\n${parsed.length} Trainees successfully imported into NUST Cohorts and quota metrics updated.`);
    } catch (err) {
      alert("Invalid JSON format. Please check your syntax.\n\nExample format:\n[\n  { \"fullName\": \"John Doe\", \"gender\": \"MALE\", \"province\": \"Punjab\" }\n]");
    }
  };

  return (
    <div className="page-view">
      {/* Header Card */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">NUST Consortium Partner Portal</h3>
            <p className="card-subtitle">Allocated Capacity: <strong>5,000 Trainees</strong> | Enrolled: <strong>4,120</strong></p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowTrainerModal(true)}>
              <UserPlus size={14} /> Add New Trainer
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowBulkModal(true)}>
              <Upload size={14} /> Bulk Add Trainees
            </button>
          </div>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: "24px" }}>
        <div className="kpi-card">
          <div className="kpi-value">{trainers.length}</div>
          <div className="kpi-label">Active Consortium Trainers</div>
        </div>
        <div className="kpi-card kpi-success">
          <div className="kpi-value">2,840</div>
          <div className="kpi-label">Batch Certificates Approved</div>
        </div>
        <div className="kpi-card kpi-purple">
          <div className="kpi-value">98.4%</div>
          <div className="kpi-label">Attendance Telemetry Compliance</div>
        </div>
      </div>

      {/* Cohorts Table */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="card-header">
          <h4 className="card-title">Assigned Partner Cohorts & Live Streams</h4>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Cohort Name</th>
                <th>Track Title</th>
                <th>Primary Trainer</th>
                <th>Enrolled</th>
                <th>Telemetry Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>NUST-MLOps-Batch-04</strong></td>
                <td>Students & Fresh Graduates</td>
                <td>Dr. Zeeshan Haider</td>
                <td>480 / 500</td>
                <td><span className="badge badge-success">Live Session Active</span></td>
                <td>
                  <button className="btn btn-primary btn-sm" onClick={() => navigateTo("trainer-hub")}>
                    Manage Roster
                  </button>
                </td>
              </tr>
              <tr>
                <td><strong>NUST-LLM-Batch-02</strong></td>
                <td>Startup Founders</td>
                <td>Engr. Saad Farooq</td>
                <td>320 / 400</td>
                <td><span className="badge badge-neutral">Scheduled</span></td>
                <td>
                  <button className="btn btn-secondary btn-sm">Details</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Trainers Directory */}
      <div className="card">
        <div className="card-header">
          <div>
            <h4 className="card-title">Consortium Trainer Directory</h4>
            <p className="card-subtitle">Trainers authorized to conduct telemetry-tracked sessions & grade capstones</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowTrainerModal(true)}>
            <UserPlus size={14} /> Add Trainer
          </button>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Trainer Name</th>
                <th>Official Email</th>
                <th>CNIC</th>
                <th>Specialization</th>
                <th>Assigned Cohorts</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {trainers.map((t, idx) => (
                <tr key={idx}>
                  <td><strong>{t.fullName}</strong></td>
                  <td>{t.email}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "11.5px" }}>{t.cnic}</td>
                  <td><span className="badge badge-neutral">{t.specialization}</span></td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "11.5px" }}>{t.assignedCohorts.join(", ")}</td>
                  <td><span className="badge badge-success">{t.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Trainer Modal */}
      {showTrainerModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h4 className="card-title">Add New Consortium Trainer</h4>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowTrainerModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleAddTrainer}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Dr. Asadullah Khan"
                    required
                    value={trainerForm.fullName}
                    onChange={(e) => setTrainerForm({ ...trainerForm, fullName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Official Institution Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="trainer@nust.edu.pk"
                    required
                    value={trainerForm.email}
                    onChange={(e) => setTrainerForm({ ...trainerForm, email: e.target.value })}
                  />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">CNIC Number *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="35201-9988776-9"
                      required
                      value={trainerForm.cnic}
                      onChange={(e) => setTrainerForm({ ...trainerForm, cnic: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+92 300 1122334"
                      value={trainerForm.phone}
                      onChange={(e) => setTrainerForm({ ...trainerForm, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Primary Specialization / Domain *</label>
                  <select
                    className="form-control form-select"
                    value={trainerForm.specialization}
                    onChange={(e) => setTrainerForm({ ...trainerForm, specialization: e.target.value })}
                  >
                    <option value="Applied MLOps & Computer Vision">Applied MLOps & Computer Vision</option>
                    <option value="LLM Fine-Tuning & Prompt Engineering">LLM Fine-Tuning & Prompt Engineering</option>
                    <option value="AI Governance & Policy">AI Governance & Policy</option>
                    <option value="NLP & Generative Media">NLP & Generative Media</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTrainerModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Register & Provision Credentials</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Add Trainees Modal */}
      {showBulkModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: "680px" }}>
            <div className="modal-header">
              <h4 className="card-title">Bulk Trainee Import (Batch Enrollment)</h4>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowBulkModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleBulkUpload}>
              <div className="modal-body">
                <p style={{ fontSize: "12.5px", color: "var(--text-subtle)", marginBottom: "12px" }}>
                  Paste CSV/JSON records of trainees. The affirmative quota balancer will automatically calculate female ratios and update national MoITT metrics.
                </p>
                <div className="form-group">
                  <label className="form-label">JSON Trainee Array Payload *</label>
                  <textarea
                    className="form-control"
                    rows="8"
                    style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowBulkModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <Upload size={16} /> Execute Bulk Intake Import
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

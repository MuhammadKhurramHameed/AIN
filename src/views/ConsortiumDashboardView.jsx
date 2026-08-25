import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Building2, Users, Award, Plus, FileSpreadsheet, CheckCircle, Upload, X } from 'lucide-react';
import { apiService } from '../services/api';

export const ConsortiumDashboardView = () => {
  const { partners, trainers, addTrainer, bulkRegisterTrainees } = useApp();
  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showCohortModal, setShowCohortModal] = useState(false);

  // New Cohort Form
  const [cohortForm, setCohortForm] = useState({
    name: 'NUST-MLOps-Batch-06',
    institution: 'NUST',
    trackTitle: 'Track 1: Applied MLOps (Students & Fresh Graduates)',
    trainerName: 'Dr. Zeeshan Haider',
    capacity: 250
  });

  // Trainer Form
  const [trainerForm, setTrainerForm] = useState({
    fullName: '',
    email: '',
    cnic: '',
    specialization: 'Applied MLOps & LLM Orchestration',
    consortiumPartner: 'NUST'
  });

  // Bulk Trainees Form
  const [bulkInput, setBulkInput] = useState(`[
  {"fullName": "Ayesha Malik", "email": "ayesha.malik@nust.edu.pk", "cnic": "35201-8877665-1", "gender": "FEMALE", "province": "Punjab"},
  {"fullName": "Zain Ali", "email": "zain.ali@nust.edu.pk", "cnic": "37405-4433221-2", "gender": "MALE", "province": "ICT"}
]`);

  const nustPartner = partners.find(p => p.code === 'NUST') || partners[0] || {
    name: "National University of Sciences & Technology (NUST)",
    allocated_capacity: 5000,
    enrolled: 4120,
    female_ratio: "36.2%"
  };

  const nustTrainers = trainers.filter(t => t.consortiumPartner === 'NUST' || t.consortiumPartner === nustPartner.name);

  const handleAddTrainerSubmit = async (e) => {
    e.preventDefault();
    await addTrainer({ ...trainerForm, consortiumPartner: nustPartner.name });
    alert(`Trainer Registered Successfully!\n\nName: ${trainerForm.fullName}\nEmail: ${trainerForm.email}\nSpecialization: ${trainerForm.specialization}`);
    setShowTrainerModal(false);
    setTrainerForm({ fullName: '', email: '', cnic: '', specialization: 'Applied MLOps & LLM Orchestration', consortiumPartner: 'NUST' });
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(bulkInput);
      if (!Array.isArray(parsed)) throw new Error("Input must be a JSON array of trainees.");
      await bulkRegisterTrainees(parsed, nustPartner.name);
      alert(`Bulk Batch Import Successful!\n\n${parsed.length} Trainees registered under ${nustPartner.name}.`);
      setShowBulkModal(false);
    } catch (err) {
      alert(`Bulk Import Parsing Error: ${err.message}`);
    }
  };

  const handleCreateCohortSubmit = async (e) => {
    e.preventDefault();
    await apiService.addCohort(cohortForm);
    alert(`New Cohort Created Successfully!\n\nCohort: ${cohortForm.name}\nInstitution: ${cohortForm.institution}\nCapacity: ${cohortForm.capacity} Trainees`);
    setShowCohortModal(false);
  };

  return (
    <div className="page-view">
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">{nustPartner.name}</h3>
            <p className="card-subtitle">MOU Reference: MOU-MoITT-2026-001 — Regional Consortium Operations Desk</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowCohortModal(true)}>
              <Plus size={14} /> Create New Cohort
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowTrainerModal(true)}>
              <Plus size={14} /> Register Trainer
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowBulkModal(true)}>
              <FileSpreadsheet size={14} /> Bulk Batch Import Trainees
            </button>
          </div>
        </div>

        <div className="grid-4">
          <div style={{ background: "var(--surface-dim)", padding: "14px", borderRadius: "var(--radius-md)" }}>
            <span style={{ fontSize: "11.5px", color: "var(--text-subtle)" }}>Allocated Capacity</span>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--primary)" }}>{nustPartner.allocated_capacity.toLocaleString()}</div>
          </div>
          <div style={{ background: "var(--surface-dim)", padding: "14px", borderRadius: "var(--radius-md)" }}>
            <span style={{ fontSize: "11.5px", color: "var(--text-subtle)" }}>Enrolled Trainees</span>
            <div style={{ fontSize: "22px", fontWeight: 800 }}>{nustPartner.enrolled.toLocaleString()}</div>
          </div>
          <div style={{ background: "var(--surface-dim)", padding: "14px", borderRadius: "var(--radius-md)" }}>
            <span style={{ fontSize: "11.5px", color: "var(--text-subtle)" }}>Female Participation</span>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--success)" }}>36.2%</div>
          </div>
          <div style={{ background: "var(--surface-dim)", padding: "14px", borderRadius: "var(--radius-md)" }}>
            <span style={{ fontSize: "11.5px", color: "var(--text-subtle)" }}>Active Institution Trainers</span>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#8b5cf6" }}>{nustTrainers.length || 3}</div>
          </div>
        </div>
      </div>

      {/* Cohorts Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">NUST Active Cohorts Index</h3>
          <span className="badge badge-success">4 Batches Live</span>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Cohort Code</th>
                <th>Target Track</th>
                <th>Assigned Trainer</th>
                <th>Enrolled</th>
                <th>Capacity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>NUST-MLOps-Batch-04</strong></td>
                <td>Track 1: Applied MLOps</td>
                <td>Dr. Zeeshan Haider</td>
                <td style={{ fontWeight: 600 }}>242 Trainees</td>
                <td style={{ fontFamily: "var(--font-mono)" }}>250 Cap</td>
                <td><span className="badge badge-success">Live Stream Active</span></td>
              </tr>
              <tr>
                <td><strong>NUST-Exec-Batch-02</strong></td>
                <td>Track 4: C-Level AI Strategy</td>
                <td>Prof. Tariq Hassan</td>
                <td style={{ fontWeight: 600 }}>180 Trainees</td>
                <td style={{ fontFamily: "var(--font-mono)" }}>200 Cap</td>
                <td><span className="badge badge-success">In Session</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Cohort Modal */}
      {showCohortModal && (
        <div className="modal-backdrop" style={{ backdropFilter: "blur(6px)" }}>
          <div className="modal-card" style={{ maxWidth: "560px" }}>
            <div className="modal-header">
              <h4 className="card-title">Create New Institution Cohort Batch</h4>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowCohortModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateCohortSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Cohort Batch Code *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={cohortForm.name}
                    onChange={(e) => setCohortForm({ ...cohortForm, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Target Curriculum Track *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={cohortForm.trackTitle}
                    onChange={(e) => setCohortForm({ ...cohortForm, trackTitle: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Assigned Lead Trainer *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={cohortForm.trainerName}
                    onChange={(e) => setCohortForm({ ...cohortForm, trainerName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Trainee Capacity Cap *</label>
                  <input
                    type="number"
                    className="form-control"
                    required
                    value={cohortForm.capacity}
                    onChange={(e) => setCohortForm({ ...cohortForm, capacity: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCohortModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Cohort Batch</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Trainer Modal */}
      {showTrainerModal && (
        <div className="modal-backdrop" style={{ backdropFilter: "blur(6px)" }}>
          <div className="modal-card" style={{ maxWidth: "560px" }}>
            <div className="modal-header">
              <h4 className="card-title">Register Consortium Trainer</h4>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowTrainerModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddTrainerSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Trainer Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={trainerForm.fullName}
                    onChange={(e) => setTrainerForm({ ...trainerForm, fullName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">University Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    required
                    value={trainerForm.email}
                    onChange={(e) => setTrainerForm({ ...trainerForm, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">CNIC Number *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={trainerForm.cnic}
                    onChange={(e) => setTrainerForm({ ...trainerForm, cnic: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTrainerModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Register Trainer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Modal */}
      {showBulkModal && (
        <div className="modal-backdrop" style={{ backdropFilter: "blur(6px)" }}>
          <div className="modal-card" style={{ maxWidth: "680px" }}>
            <div className="modal-header">
              <h4 className="card-title">Bulk Trainee Batch Import</h4>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowBulkModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleBulkSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">JSON Trainees Batch Roster *</label>
                  <textarea
                    className="form-control code-box"
                    rows={8}
                    required
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowBulkModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Execute Batch Import</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

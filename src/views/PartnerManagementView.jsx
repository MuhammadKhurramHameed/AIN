import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, UserPlus, Upload, X } from 'lucide-react';

export const PartnerManagementView = () => {
  const { partners, addPartner, trainers, addTrainer, bulkRegisterTrainees } = useApp();
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Partner Form
  const [partnerForm, setPartnerForm] = useState({
    name: '',
    email: '',
    mou_ref: '',
    allocated_capacity: 2000
  });

  // Trainer Form
  const [trainerForm, setTrainerForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    cnic: '',
    consortiumPartner: 'National University of Sciences & Technology (NUST)',
    specialization: 'Applied MLOps & Computer Vision'
  });

  // Bulk Trainees Form
  const [bulkText, setBulkText] = useState(`[
  { "fullName": "Tariq Mahmood", "gender": "MALE", "province": "Balochistan", "district": "Quetta" },
  { "fullName": "Bushra Bibi", "gender": "FEMALE", "province": "Punjab", "district": "Multan" }
]`);

  const handleAddPartner = (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!partnerForm.name.trim() || partnerForm.name.length < 3) {
      alert("Please fill in a valid Consortium Partner Organization name (at least 3 characters).");
      return;
    }
    if (!emailRegex.test(partnerForm.email.trim())) {
      alert("Please enter a valid official email address for the partner organization.");
      return;
    }
    if (parseInt(partnerForm.allocated_capacity) <= 0 || isNaN(parseInt(partnerForm.allocated_capacity))) {
      alert("Allocated capacity must be a positive integer greater than zero.");
      return;
    }

    addPartner(partnerForm);
    setShowPartnerModal(false);
    setPartnerForm({ name: '', email: '', mou_ref: '', allocated_capacity: 2000 });
    alert(`Consortium Partner "${partnerForm.name}" successfully registered!`);
  };

  const handleAddTrainer = (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;

    if (!trainerForm.fullName.trim() || trainerForm.fullName.length < 3) {
      alert("Please enter full trainer name (at least 3 characters).");
      return;
    }
    if (!emailRegex.test(trainerForm.email.trim())) {
      alert("Please enter a valid official trainer email address.");
      return;
    }
    if (trainerForm.cnic && !cnicRegex.test(trainerForm.cnic.trim())) {
      alert("CNIC must follow Pakistani format: 00000-0000000-0.");
      return;
    }

    addTrainer(trainerForm);
    setShowTrainerModal(false);
    setTrainerForm({ fullName: '', email: '', phone: '', cnic: '', consortiumPartner: 'National University of Sciences & Technology (NUST)', specialization: 'Applied MLOps & Computer Vision' });
    alert(`Trainer "${trainerForm.fullName}" successfully registered by Super Admin!`);
  };

  const handleBulkUpload = (e) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(bulkText);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        alert("Please provide a valid non-empty JSON array of trainees.");
        return;
      }
      const invalidItem = parsed.find(item => !item.fullName || !item.gender || !item.province);
      if (invalidItem) {
        alert("Each trainee item in JSON array must include 'fullName', 'gender', and 'province'.");
        return;
      }

      bulkRegisterTrainees(parsed, "Ministry Oversight Batch Import");
      setShowBulkModal(false);
      alert(`Bulk Registration Completed!\n\n${parsed.length} Trainees successfully imported into national database and quota metrics updated.`);
    } catch (err) {
      alert("Invalid JSON format. Please format as a valid JSON array.");
    }
  };

  return (
    <div className="page-view">
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Consortium Partner Organizations</h3>
            <p className="card-subtitle">Managing institutional capacity allocations, MOU references, and trainer credentials</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowTrainerModal(true)}>
              <UserPlus size={14} /> Add Trainer
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowBulkModal(true)}>
              <Upload size={14} /> Bulk Add Trainees
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowPartnerModal(true)}>
              <Plus size={14} /> Add Consortium Partner
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Partner Name</th>
                <th>MOU Ref</th>
                <th>Official Email</th>
                <th>Allocated Capacity</th>
                <th>Enrolled Trainees</th>
                <th>Active Cohorts</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {partners.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "11.5px" }}>{p.mou_ref}</td>
                  <td>{p.email}</td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>{p.allocated_capacity.toLocaleString()}</td>
                  <td style={{ fontWeight: 600 }}>{p.enrolled.toLocaleString()}</td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>{p.active_cohorts}</td>
                  <td><span className="badge badge-success">{p.status}</span></td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => alert(`Partner ${p.name} MOU: ${p.mou_ref}`)}>
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trainers Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h4 className="card-title">National Trainers Index</h4>
            <p className="card-subtitle">Authorized trainers across all consortium partner universities</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowTrainerModal(true)}>
            <UserPlus size={14} /> Add Trainer
          </button>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Trainer Name</th>
                <th>Consortium Institution</th>
                <th>Official Email</th>
                <th>CNIC</th>
                <th>Specialization</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {trainers.map((t, idx) => (
                <tr key={idx}>
                  <td><strong>{t.fullName}</strong></td>
                  <td>{t.consortiumPartner}</td>
                  <td>{t.email}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "11.5px" }}>{t.cnic}</td>
                  <td><span className="badge badge-neutral">{t.specialization}</span></td>
                  <td><span className="badge badge-success">{t.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Partner Modal */}
      {showPartnerModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h4 className="card-title">Add Consortium Partner Organization</h4>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowPartnerModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleAddPartner}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Partner Organization Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Lahore University of Management Sciences"
                    required
                    value={partnerForm.name}
                    onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Official Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="lms@partner.edu.pk"
                    required
                    value={partnerForm.email}
                    onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">MOU Reference *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="MOU-MoITT-2026-006"
                    value={partnerForm.mou_ref}
                    onChange={(e) => setPartnerForm({ ...partnerForm, mou_ref: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Allocated Trainee Capacity *</label>
                  <input
                    type="number"
                    className="form-control"
                    value={partnerForm.allocated_capacity}
                    onChange={(e) => setPartnerForm({ ...partnerForm, allocated_capacity: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPartnerModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Partner Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Trainer Modal */}
      {showTrainerModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h4 className="card-title">Add Authorized Trainer</h4>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowTrainerModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleAddTrainer}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Dr. Asadullah Khan"
                    required
                    value={trainerForm.fullName}
                    onChange={(e) => setTrainerForm({ ...trainerForm, fullName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Official Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="trainer@institution.edu.pk"
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
                    <label className="form-label">Consortium Institution *</label>
                    <select
                      className="form-control form-select"
                      value={trainerForm.consortiumPartner}
                      onChange={(e) => setTrainerForm({ ...trainerForm, consortiumPartner: e.target.value })}
                    >
                      {partners.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Specialization / Domain *</label>
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
                <button type="submit" className="btn btn-primary">Register Trainer</button>
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
              <h4 className="card-title">Bulk Trainee Import (National Oversight)</h4>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowBulkModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleBulkUpload}>
              <div className="modal-body">
                <p style={{ fontSize: "12.5px", color: "var(--text-subtle)", marginBottom: "12px" }}>
                  Paste batch trainee payload to register trainees directly into the database.
                </p>
                <div className="form-group">
                  <label className="form-label">JSON Trainee Payload *</label>
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
                  <Upload size={16} /> Register Batch Trainees
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

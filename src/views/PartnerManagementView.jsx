import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, X } from 'lucide-react';

export const PartnerManagementView = () => {
  const { partners, addPartner } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mou_ref: '',
    allocated_capacity: 2000
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert("Please fill in partner name and official email.");
      return;
    }
    addPartner(formData);
    setShowModal(false);
    setFormData({ name: '', email: '', mou_ref: '', allocated_capacity: 2000 });
    alert(`Consortium Partner "${formData.name}" successfully registered!`);
  };

  return (
    <div className="page-view">
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Consortium Partner Organizations</h3>
            <p className="card-subtitle">Managing institutional capacity allocations and MOU references</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add New Consortium Partner
          </button>
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

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h4 className="card-title">Add Consortium Partner Organization</h4>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Partner Organization Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Lahore University of Management Sciences"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Official Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="lms@partner.edu.pk"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">MOU Reference *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="MOU-MoITT-2026-006"
                    value={formData.mou_ref}
                    onChange={(e) => setFormData({ ...formData, mou_ref: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Allocated Trainee Capacity *</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.allocated_capacity}
                    onChange={(e) => setFormData({ ...formData, allocated_capacity: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Partner Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

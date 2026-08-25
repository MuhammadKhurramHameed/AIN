import React from 'react';
import { useApp } from '../context/AppContext';

export const ConsortiumDashboardView = () => {
  const { navigateTo } = useApp();

  return (
    <div className="page-view">
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">NUST Consortium Partner Portal</h3>
            <p className="card-subtitle">Allocated Capacity: <strong>5,000 Trainees</strong> | Enrolled: <strong>4,120</strong></p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => alert("Cohort Creation Wizard launched.")}>
            Create New Cohort
          </button>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: "24px" }}>
        <div className="kpi-card">
          <div className="kpi-value">12</div>
          <div className="kpi-label">Active Partner Cohorts</div>
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

      <div className="card">
        <div className="card-header">
          <h4 className="card-title">Assigned Partner Trainers & Active Batches</h4>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Cohort Name</th>
                <th>Track Title</th>
                <th>Trainer</th>
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
    </div>
  );
};

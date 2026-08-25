import React from 'react';
import { useApp } from '../context/AppContext';
import { PlayCircle, Radio, Download, CheckSquare } from 'lucide-react';

export const TrainerHubView = () => {
  const { navigateTo } = useApp();

  return (
    <div className="page-view">
      <div className="grid-12">
        <div className="col-span-8">
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Live Classroom & Telemetry Control</h3>
                <p className="card-subtitle">Cohort: <strong>NUST-MLOps-Batch-04</strong> (480 Active Trainees Connected)</p>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => navigateTo("trainee-classroom")}>
                <PlayCircle size={14} /> Join Stream
              </button>
            </div>

            <div style={{ background: "var(--surface-dim)", borderRadius: "var(--radius-md)", padding: "16px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, color: "var(--text-main)" }}>Session #14: Scalable MLOps Architecture & Docker</div>
                <div style={{ fontSize: "12px", color: "var(--text-subtle)" }}>Started at 10:00 AM | Duration: 120 mins</div>
              </div>
              <span className="badge badge-success">
                <span className="pulse-dot" style={{ marginRight: "6px" }}></span> LIVE TELEMETRY STREAMING
              </span>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Trainee Name</th>
                    <th>CNIC</th>
                    <th>Joined At</th>
                    <th>Active Duration</th>
                    <th>Heartbeat Pings</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Fatima Khan</strong></td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>35201-1122334-6</td>
                    <td>10:01:14 AM</td>
                    <td>118 mins</td>
                    <td>118 / 120</td>
                    <td><span className="badge badge-success">Verified Active</span></td>
                  </tr>
                  <tr>
                    <td><strong>Usman Tariq</strong></td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>37405-9988776-3</td>
                    <td>10:04:20 AM</td>
                    <td>114 mins</td>
                    <td>114 / 120</td>
                    <td><span className="badge badge-success">Verified Active</span></td>
                  </tr>
                  <tr>
                    <td><strong>Ayesha Zainab</strong></td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>61101-4455667-2</td>
                    <td>10:15:00 AM</td>
                    <td>95 mins</td>
                    <td>95 / 120</td>
                    <td><span className="badge badge-warning">Partial Attendance</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-span-4">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Live Attendance Controls</h4>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button className="btn btn-secondary" onClick={() => alert("Broadcasting telemetry ping to 480 trainees...")}>
                <Radio size={16} /> Force Telemetry Ping
              </button>
              <button className="btn btn-secondary" onClick={() => alert("Attendance log exported to CSV!")}>
                <Download size={16} /> Export Attendance Log
              </button>
              <button className="btn btn-primary" onClick={() => navigateTo("trainer-grading")}>
                <CheckSquare size={16} /> Open Evaluation Workspace
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

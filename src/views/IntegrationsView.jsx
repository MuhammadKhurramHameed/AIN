import React, { useState } from 'react';
import { Network, CheckCircle, RefreshCw, AlertTriangle } from 'lucide-react';

export const IntegrationsView = () => {
  const [integrations, setIntegrations] = useState([
    { id: "int-1", name: "NADRA CNIC Verification API Gateway", category: "Identity & Verification", status: "CONNECTED", endpoint: "https://api.nadra.gov.pk/v2/cnic-verify", sync: "2 mins ago" },
    { id: "int-2", name: "Zoom & Webex Live Stream SDK", category: "Classroom Telemetry", status: "CONNECTED", endpoint: "https://api.zoom.us/v2/webinars/telemetry", sync: "1 min ago" },
    { id: "int-3", name: "Turnitin AI & Plagiarism Scanner", category: "Academic Quality", status: "CONNECTED", endpoint: "https://api.turnitin.com/v1/submissions", sync: "14 mins ago" },
    { id: "int-4", name: "National Data Center PostgreSQL Audit Mirror", category: "Government Compliance", status: "CONNECTED", endpoint: "postgresql://audit-cluster.moitt.gov.pk:5432/lms_audit", sync: "Real-Time" }
  ]);

  const toggleStatus = (id) => {
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, status: i.status === 'CONNECTED' ? 'DISCONNECTED' : 'CONNECTED' } : i));
  };

  return (
    <div className="page-view">
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Enterprise System Integrations & Government Gateways</h3>
            <p className="card-subtitle">Active interconnects with NADRA CNIC Verification, Live Classroom SDKs, and National Data Center</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => alert("Integration Webhook Wizard launched.")}>
            + Add New Gateway
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Integration Name</th>
                <th>Category</th>
                <th>Endpoint URL</th>
                <th>Last Synced</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {integrations.map(item => (
                <tr key={item.id}>
                  <td><strong>{item.name}</strong></td>
                  <td><span className="badge badge-neutral">{item.category}</span></td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "11.5px" }}>{item.endpoint}</td>
                  <td style={{ fontSize: "12px", color: "var(--text-subtle)" }}>{item.sync}</td>
                  <td>
                    <span className={`badge ${item.status === 'CONNECTED' ? 'badge-success' : 'badge-error'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => toggleStatus(item.id)}>
                      {item.status === 'CONNECTED' ? 'Disconnect' : 'Connect'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

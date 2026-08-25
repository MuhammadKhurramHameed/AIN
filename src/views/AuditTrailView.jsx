import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Code, X } from 'lucide-react';

export const AuditTrailView = () => {
  const { auditLogs } = useApp();
  const [selectedPayload, setSelectedPayload] = useState(null);

  return (
    <div className="page-view">
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">National Audit & Telemetry Log Explorer</h3>
            <p className="card-subtitle">Immutable log records for certificates, attendance, and administrative actions</p>
          </div>
          <span className="badge badge-primary">PostgreSQL Audit Schema</span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Action Type</th>
                <th>Entity Affected</th>
                <th>IP Address</th>
                <th>Payload Snapshot</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map(log => (
                <tr key={log.id}>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "11.5px" }}>{log.timestamp}</td>
                  <td><strong>{log.actor}</strong></td>
                  <td><span className="badge badge-primary">{log.action}</span></td>
                  <td style={{ fontSize: "12px" }}>{log.entity}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>{log.ip}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => setSelectedPayload(log.payload)}>
                      <Code size={14} /> Inspect JSON
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPayload && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h4 className="card-title">JSON Audit Payload Inspector</h4>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedPayload(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <pre className="code-box">{JSON.stringify(selectedPayload, null, 2)}</pre>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedPayload(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

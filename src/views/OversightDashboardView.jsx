import React from 'react';
import { useApp } from '../context/AppContext';
import { Users, UserCheck, Clock, Award } from 'lucide-react';

export const OversightDashboardView = () => {
  const { programme, tracks, partners, navigateTo } = useApp();

  const femalePct = ((programme.female_registered_count / programme.registered_count) * 100).toFixed(1);

  return (
    <div className="page-view">
      {/* 4 KPI Cards */}
      <div className="grid-4" style={{ marginBottom: "24px" }}>
        <div className="kpi-card">
          <div className="kpi-icon"><Users size={22} /></div>
          <div className="kpi-value">{programme.registered_count.toLocaleString()}</div>
          <div className="kpi-label">Registered Trainees / {programme.target_participants.toLocaleString()} Cap</div>
          <div className="kpi-meta"><span style={{ color: "var(--success)", fontWeight: 700 }}>74.25%</span> of national capacity filled</div>
        </div>
        <div className="kpi-card kpi-success">
          <div className="kpi-icon" style={{ background: "var(--success-tint)", color: "var(--success)" }}><UserCheck size={22} /></div>
          <div className="kpi-value">{femalePct}%</div>
          <div className="kpi-label">Female Participation Ratio</div>
          <div className="kpi-meta"><span style={{ color: "var(--success)", fontWeight: 700 }}>+4.4%</span> above statutory requirement (30%)</div>
        </div>
        <div className="kpi-card kpi-purple">
          <div className="kpi-icon" style={{ background: "#f3e8ff", color: "#8b5cf6" }}><Clock size={22} /></div>
          <div className="kpi-value">{programme.verified_hours_total.toLocaleString()}h</div>
          <div className="kpi-label">Telemetry Verified Contact Hours</div>
          <div className="kpi-meta">WebSocket pings every 60s active</div>
        </div>
        <div className="kpi-card kpi-warning">
          <div className="kpi-icon" style={{ background: "var(--warning-tint)", color: "var(--warning)" }}><Award size={22} /></div>
          <div className="kpi-value">{programme.certificates_issued.toLocaleString()}</div>
          <div className="kpi-label">Certificates Issued & Root Signed</div>
          <div className="kpi-meta"><span style={{ color: "var(--warning)", fontWeight: 700 }}>100%</span> audit trail verified</div>
        </div>
      </div>

      <div className="grid-12">
        <div className="col-span-8">
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">National Track Performance Matrix</h3>
                <p className="card-subtitle">9 Target Audience Tracks & Hours Completion Status</p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => navigateTo("curriculum-builder")}>Manage Tracks</button>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Track Title</th>
                    <th>Level</th>
                    <th>Req Hours</th>
                    <th>Enrolled</th>
                    <th>Cohorts</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tracks.map(t => (
                    <tr key={t.id}>
                      <td><strong>Track {t.number}: {t.title}</strong></td>
                      <td><span className="badge badge-neutral">{t.category}</span></td>
                      <td style={{ fontFamily: "var(--font-mono)" }}>{t.hours}h</td>
                      <td style={{ fontWeight: 600 }}>{t.enrolled.toLocaleString()}</td>
                      <td style={{ fontFamily: "var(--font-mono)" }}>{t.active_cohorts}</td>
                      <td><span className="badge badge-success">Active</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-span-4">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Consortium Partners Index</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {partners.slice(0, 4).map(p => (
                <div key={p.id} style={{ padding: "10px", background: "var(--surface-dim)", borderRadius: "var(--radius-md)", fontSize: "12.5px" }}>
                  <div style={{ fontWeight: 700, color: "var(--text-main)" }}>{p.name}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", color: "var(--text-subtle)", fontSize: "11px" }}>
                    <span>MOU: {p.mou_ref}</span>
                    <span style={{ fontWeight: 600, color: "var(--primary)" }}>{p.enrolled} / {p.allocated_capacity} Trainees</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

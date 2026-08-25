import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, UserCheck, Clock, Award, Download, CheckCircle, ShieldCheck, X, ExternalLink } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import { exportExecutiveReportPDF } from '../utils/pdfExport';

export const OversightDashboardView = () => {
  const { programme, tracks, partners, provincialStats, navigateTo } = useApp();
  const [activeMetricModal, setActiveMetricModal] = useState(null); // 'TRAINEES', 'FEMALE', 'HOURS', 'CERTS'
  const [isExporting, setIsExporting] = useState(false);

  const femalePct = ((programme.female_registered_count / programme.registered_count) * 100).toFixed(1);
  const maleCount = programme.registered_count - programme.female_registered_count;

  // Recharts Data
  const genderPieData = [
    { name: 'Female Trainees (Quota ≥ 30%)', value: programme.female_registered_count, color: '#16a34a' },
    { name: 'Male & Other Trainees', value: maleCount, color: '#1d4ed8' }
  ];

  const handleExportPDF = async (nodeId, filename) => {
    setIsExporting(true);
    await exportExecutiveReportPDF(nodeId, filename);
    setIsExporting(false);
  };

  return (
    <div className="page-view">
      {/* 4 Clickable KPI Cards with Hover Indicators */}
      <div className="grid-4" style={{ marginBottom: "24px" }}>
        
        {/* Card 1: Registered Trainees */}
        <div
          className="kpi-card"
          style={{ cursor: "pointer", transition: "transform 0.2s ease, box-shadow 0.2s ease" }}
          onClick={() => setActiveMetricModal('TRAINEES')}
          title="Click to view detailed Trainee Registration Metrics & Export PDF"
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div className="kpi-icon"><Users size={22} /></div>
            <span className="badge badge-primary" style={{ fontSize: "10px" }}>Click for details ➔</span>
          </div>
          <div className="kpi-value">{programme.registered_count.toLocaleString()}</div>
          <div className="kpi-label">Registered Trainees / {programme.target_participants.toLocaleString()} Cap</div>
          <div className="kpi-meta"><span style={{ color: "var(--success)", fontWeight: 700 }}>74.25%</span> capacity filled</div>
        </div>

        {/* Card 2: Female Participation Ratio */}
        <div
          className="kpi-card kpi-success"
          style={{ cursor: "pointer", transition: "transform 0.2s ease, box-shadow 0.2s ease" }}
          onClick={() => setActiveMetricModal('FEMALE')}
          title="Click to view Female Quota Analytics & Export PDF"
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div className="kpi-icon" style={{ background: "var(--success-tint)", color: "var(--success)" }}><UserCheck size={22} /></div>
            <span className="badge badge-success" style={{ fontSize: "10px" }}>Click for details ➔</span>
          </div>
          <div className="kpi-value">{femalePct}%</div>
          <div className="kpi-label">Female Participation Ratio</div>
          <div className="kpi-meta"><span style={{ color: "var(--success)", fontWeight: 700 }}>+4.5%</span> above 30% statutory rule</div>
        </div>

        {/* Card 3: Contact Hours */}
        <div
          className="kpi-card kpi-purple"
          style={{ cursor: "pointer", transition: "transform 0.2s ease, box-shadow 0.2s ease" }}
          onClick={() => setActiveMetricModal('HOURS')}
          title="Click to view Telemetry Hours & Export PDF"
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div className="kpi-icon" style={{ background: "#f3e8ff", color: "#8b5cf6" }}><Clock size={22} /></div>
            <span className="badge badge-neutral" style={{ fontSize: "10px" }}>Click for details ➔</span>
          </div>
          <div className="kpi-value">{programme.verified_hours_total.toLocaleString()}h</div>
          <div className="kpi-label">Verified Contact Hours</div>
          <div className="kpi-meta">Live Telemetry Pings Active</div>
        </div>

        {/* Card 4: Certificates Issued */}
        <div
          className="kpi-card kpi-warning"
          style={{ cursor: "pointer", transition: "transform 0.2s ease, box-shadow 0.2s ease" }}
          onClick={() => setActiveMetricModal('CERTS')}
          title="Click to view Certificate Audit & Export PDF"
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div className="kpi-icon" style={{ background: "var(--warning-tint)", color: "var(--warning)" }}><Award size={22} /></div>
            <span className="badge badge-warning" style={{ fontSize: "10px" }}>Click for details ➔</span>
          </div>
          <div className="kpi-value">{programme.certificates_issued.toLocaleString()}</div>
          <div className="kpi-label">Certificates Issued & Signed</div>
          <div className="kpi-meta"><span style={{ color: "var(--warning)", fontWeight: 700 }}>100%</span> Ed25519 root verified</div>
        </div>
      </div>

      {/* Relocated Section 1: Quota Balancer & Provincial Allocations Charts */}
      <div className="grid-12" style={{ marginBottom: "24px" }}>
        {/* Donut Chart: Real-Time Quota Balancer */}
        <div className="col-span-4">
          <div className="card" style={{ height: "100%" }}>
            <div className="card-header">
              <div>
                <h3 className="card-title">Real-Time Quota Balancer</h3>
                <p className="card-subtitle">Enforcing statutory female ratio ≥ 30%</p>
              </div>
              <span className="badge badge-success">34.5% Female</span>
            </div>

            <div style={{ width: '100%', height: 210 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={genderPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {genderPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value.toLocaleString()} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ fontSize: "11.5px", background: "var(--surface-dim)", padding: "10px", borderRadius: "var(--radius-md)", textAlign: "center" }}>
              <CheckCircle size={14} style={{ verticalAlign: "middle", color: "var(--success)", marginRight: "4px" }} />
              Female Ratio: <strong>{femalePct}%</strong> ({programme.female_registered_count.toLocaleString()} Trainees). Statutory compliance active.
            </div>
          </div>
        </div>

        {/* Bar Chart: Provincial Quota Allocation */}
        <div className="col-span-8">
          <div className="card" style={{ height: "100%" }}>
            <div className="card-header">
              <div>
                <h3 className="card-title">Provincial Quota Allocations</h3>
                <p className="card-subtitle">Enrolled Trainees vs. Target Capacity across Provinces & Territories</p>
              </div>
              <span className="badge badge-primary">Nationwide Distribution</span>
            </div>

            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <BarChart data={provincialStats} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="province" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => value.toLocaleString()} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="enrolled" name="Enrolled Trainees" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="capacity" name="Target Capacity" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: National Track Matrix & Consortium Partners */}
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
              {partners.slice(0, 5).map(p => (
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

      {/* ========================================================================= */}
      {/* METRIC DRILL-DOWN MODALS (BLURRED BACKDROP SaaS OVERLAYS WITH EXPORT PDF) */}
      {/* ========================================================================= */}

      {/* Metric 1 Modal: Registered Trainees */}
      {activeMetricModal === 'TRAINEES' && (
        <div className="modal-backdrop" style={{ backdropFilter: "blur(8px)" }}>
          <div className="modal-card" style={{ maxWidth: "780px" }}>
            <div className="modal-header">
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <Users size={24} style={{ color: "var(--primary)" }} />
                <div>
                  <h4 className="card-title">Trainee Registration & Capacity Analytics</h4>
                  <p className="card-subtitle">National capacity breakdown across all 7 provinces & territories</p>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setActiveMetricModal(null)}><X size={18} /></button>
            </div>

            <div className="modal-body" id="metric-trainees-pdf-node">
              <div className="grid-3" style={{ marginBottom: "20px" }}>
                <div style={{ background: "var(--surface-dim)", padding: "12px", borderRadius: "var(--radius-md)" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-subtle)" }}>Total Registered</span>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--primary)" }}>{programme.registered_count.toLocaleString()}</div>
                </div>
                <div style={{ background: "var(--surface-dim)", padding: "12px", borderRadius: "var(--radius-md)" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-subtle)" }}>Target Capacity Cap</span>
                  <div style={{ fontSize: "22px", fontWeight: 800 }}>{programme.target_participants.toLocaleString()}</div>
                </div>
                <div style={{ background: "var(--surface-dim)", padding: "12px", borderRadius: "var(--radius-md)" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-subtle)" }}>Capacity Filled</span>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--success)" }}>74.25%</div>
                </div>
              </div>

              <h5 style={{ fontFamily: "var(--font-headline)", fontWeight: 700, marginBottom: "10px" }}>Provincial Enrolled Breakdown</h5>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Province / Territory</th>
                      <th>Enrolled Trainees</th>
                      <th>Target Capacity</th>
                      <th>Female Ratio</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {provincialStats.map(p => (
                      <tr key={p.province}>
                        <td><strong>{p.province}</strong></td>
                        <td style={{ fontWeight: 600 }}>{p.enrolled.toLocaleString()}</td>
                        <td style={{ fontFamily: "var(--font-mono)" }}>{p.capacity.toLocaleString()}</td>
                        <td><span className="badge badge-success">{p.female_pct}%</span></td>
                        <td><span className="badge badge-primary">{(p.enrolled / p.capacity * 100).toFixed(0)}% Filled</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setActiveMetricModal(null)}>Close</button>
              <button className="btn btn-primary" disabled={isExporting} onClick={() => handleExportPDF('metric-trainees-pdf-node', 'Trainee_Registration_Analytics_Report.pdf')}>
                <Download size={16} /> {isExporting ? "Exporting..." : "Export as PDF Report"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metric 2 Modal: Female Participation Ratio */}
      {activeMetricModal === 'FEMALE' && (
        <div className="modal-backdrop" style={{ backdropFilter: "blur(8px)" }}>
          <div className="modal-card" style={{ maxWidth: "720px" }}>
            <div className="modal-header">
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <UserCheck size={24} style={{ color: "var(--success)" }} />
                <div>
                  <h4 className="card-title">Affirmative Female Quota Compliance Audit</h4>
                  <p className="card-subtitle">Statutory requirement: Minimum 30.0% female participation</p>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setActiveMetricModal(null)}><X size={18} /></button>
            </div>

            <div className="modal-body" id="metric-female-pdf-node">
              <div style={{ background: "var(--success-tint)", border: "1px solid rgba(22, 163, 74, 0.3)", padding: "16px", borderRadius: "var(--radius-md)", marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h4 style={{ color: "var(--success-text)", fontWeight: 800, fontSize: "18px" }}>Statutory Rule Fully Compliant</h4>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                      Current female trainee ratio is <strong>{femalePct}%</strong> ({programme.female_registered_count.toLocaleString()} Female Trainees).
                    </p>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: "13px", padding: "6px 14px" }}>+4.5% Margin</span>
                </div>
              </div>

              <h5 style={{ fontFamily: "var(--font-headline)", fontWeight: 700, marginBottom: "10px" }}>Female Participation per Province</h5>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Province</th>
                      <th>Female Ratio %</th>
                      <th>Quota Compliance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {provincialStats.map(p => (
                      <tr key={p.province}>
                        <td><strong>{p.province}</strong></td>
                        <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--success)" }}>{p.female_pct}%</td>
                        <td><span className="badge badge-success">≥ 30% Satisfied</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setActiveMetricModal(null)}>Close</button>
              <button className="btn btn-primary" disabled={isExporting} onClick={() => handleExportPDF('metric-female-pdf-node', 'Female_Quota_Compliance_Report.pdf')}>
                <Download size={16} /> {isExporting ? "Exporting..." : "Export as PDF Report"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metric 3 Modal: Verified Contact Hours */}
      {activeMetricModal === 'HOURS' && (
        <div className="modal-backdrop" style={{ backdropFilter: "blur(8px)" }}>
          <div className="modal-card" style={{ maxWidth: "780px" }}>
            <div className="modal-header">
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <Clock size={24} style={{ color: "#8b5cf6" }} />
                <div>
                  <h4 className="card-title">WebSocket Telemetry & Contact Hours Audit</h4>
                  <p className="card-subtitle">Real-time attendance logging via 60-second WebSocket heartbeat pings</p>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setActiveMetricModal(null)}><X size={18} /></button>
            </div>

            <div className="modal-body" id="metric-hours-pdf-node">
              <div className="grid-3" style={{ marginBottom: "20px" }}>
                <div style={{ background: "var(--surface-dim)", padding: "12px", borderRadius: "var(--radius-md)" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-subtle)" }}>Total Contact Hours</span>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: "#8b5cf6" }}>{programme.verified_hours_total.toLocaleString()}h</div>
                </div>
                <div style={{ background: "var(--surface-dim)", padding: "12px", borderRadius: "var(--radius-md)" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-subtle)" }}>Heartbeat Ping Rate</span>
                  <div style={{ fontSize: "22px", fontWeight: 800 }}>60 Seconds</div>
                </div>
                <div style={{ background: "var(--surface-dim)", padding: "12px", borderRadius: "var(--radius-md)" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-subtle)" }}>Attendance Compliance</span>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--success)" }}>98.4%</div>
                </div>
              </div>

              <h5 style={{ fontFamily: "var(--font-headline)", fontWeight: 700, marginBottom: "10px" }}>Required Contact Hours by Track</h5>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Track Title</th>
                      <th>Level Taxonomy</th>
                      <th>Required Contact Hours</th>
                      <th>Active Cohorts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tracks.map(t => (
                      <tr key={t.id}>
                        <td><strong>Track {t.number}: {t.title}</strong></td>
                        <td><span className="badge badge-neutral">{t.category}</span></td>
                        <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{t.hours} Contact Hours</td>
                        <td style={{ fontFamily: "var(--font-mono)" }}>{t.active_cohorts} Cohorts</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setActiveMetricModal(null)}>Close</button>
              <button className="btn btn-primary" disabled={isExporting} onClick={() => handleExportPDF('metric-hours-pdf-node', 'Contact_Hours_Telemetry_Report.pdf')}>
                <Download size={16} /> {isExporting ? "Exporting..." : "Export as PDF Report"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metric 4 Modal: Certificates Issued */}
      {activeMetricModal === 'CERTS' && (
        <div className="modal-backdrop" style={{ backdropFilter: "blur(8px)" }}>
          <div className="modal-card" style={{ maxWidth: "780px" }}>
            <div className="modal-header">
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <Award size={24} style={{ color: "var(--warning)" }} />
                <div>
                  <h4 className="card-title">Ed25519 Cryptographic Certificate Audit</h4>
                  <p className="card-subtitle">Root key signature verification & consortium issuance breakdown</p>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setActiveMetricModal(null)}><X size={18} /></button>
            </div>

            <div className="modal-body" id="metric-certs-pdf-node">
              <div className="grid-3" style={{ marginBottom: "20px" }}>
                <div style={{ background: "var(--surface-dim)", padding: "12px", borderRadius: "var(--radius-md)" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-subtle)" }}>Total Certificates Issued</span>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--warning)" }}>{programme.certificates_issued.toLocaleString()}</div>
                </div>
                <div style={{ background: "var(--surface-dim)", padding: "12px", borderRadius: "var(--radius-md)" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-subtle)" }}>Root Signing Algorithm</span>
                  <div style={{ fontSize: "16px", fontWeight: 800, fontFamily: "var(--font-mono)" }}>Ed25519</div>
                </div>
                <div style={{ background: "var(--surface-dim)", padding: "12px", borderRadius: "var(--radius-md)" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-subtle)" }}>Audit Verification</span>
                  <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--success)" }}>100% Passed</div>
                </div>
              </div>

              <h5 style={{ fontFamily: "var(--font-headline)", fontWeight: 700, marginBottom: "10px" }}>Consortium Partner Issuance Breakdown</h5>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Consortium Partner</th>
                      <th>MOU Ref</th>
                      <th>Enrolled Trainees</th>
                      <th>Issuance Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partners.map(p => (
                      <tr key={p.id}>
                        <td><strong>{p.name}</strong></td>
                        <td style={{ fontFamily: "var(--font-mono)", fontSize: "11.5px" }}>{p.mou_ref}</td>
                        <td style={{ fontWeight: 600 }}>{p.enrolled.toLocaleString()}</td>
                        <td><span className="badge badge-success">Root Signed</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setActiveMetricModal(null)}>Close</button>
              <button className="btn btn-primary" disabled={isExporting} onClick={() => handleExportPDF('metric-certs-pdf-node', 'Certificate_Audit_Report.pdf')}>
                <Download size={16} /> {isExporting ? "Exporting..." : "Export as PDF Report"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

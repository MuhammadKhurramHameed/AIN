import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserCheck, CheckCircle } from 'lucide-react';

export const PublicIntakeView = () => {
  const { programme, tracks, provincialStats, registerTrainee, navigateTo } = useApp();
  const [formData, setFormData] = useState({
    cnic: '35201-1234567-8',
    fullName: 'Fatima Khan',
    email: 'fatima.khan@gmail.com',
    phone: '+92 300 1234567',
    gender: 'FEMALE',
    province: 'Islamabad Capital Territory',
    district: 'Islamabad',
    trackId: 'track-1',
    pwd: false
  });

  const femalePct = ((programme.female_registered_count / programme.registered_count) * 100).toFixed(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    registerTrainee(formData);
    alert(`Intake Application Approved!\n\nTrainee: ${formData.fullName}\nGender: ${formData.gender} (Priority Quota Rule Verified)\nProvince: ${formData.province}\n\nStatus: Registered into Cohort NUST-MLOps-Batch-05.`);
    navigateTo("trainee-dashboard");
  };

  return (
    <div className="page-view">
      <div className="grid-12">
        <div className="col-span-8">
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">National AI Trainee Intake Portal</h3>
                <p className="card-subtitle">Enforcing statutory quota balancing (≥ 30% Female & Provincial Allocations)</p>
              </div>
              <span className="badge badge-primary">NAIAI-2026</span>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">CNIC Number (National ID) *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="35201-1234567-8"
                    required
                    value={formData.cnic}
                    onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Fatima Khan"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Official Email Address *</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="trainee@example.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="+92 300 1234567"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Gender (Affirmative Quota) *</label>
                  <select
                    className="form-control form-select"
                    required
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="FEMALE">Female (≥ 30% Quota Balance)</option>
                    <option value="MALE">Male</option>
                    <option value="NON_BINARY">Non-Binary</option>
                    <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Province *</label>
                  <select
                    className="form-control form-select"
                    required
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  >
                    <option value="Punjab">Punjab</option>
                    <option value="Sindh">Sindh</option>
                    <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                    <option value="Balochistan">Balochistan</option>
                    <option value="Islamabad Capital Territory">Islamabad (ICT)</option>
                    <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                    <option value="Azad Jammu & Kashmir">AJK</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">District *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Islamabad"
                    required
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Target Audience Track *</label>
                <select
                  className="form-control form-select"
                  required
                  value={formData.trackId}
                  onChange={(e) => setFormData({ ...formData, trackId: e.target.value })}
                >
                  {tracks.map(t => (
                    <option key={t.id} value={t.id}>
                      Track {t.number}: {t.title} ({t.category} - {t.hours}h)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formData.pwd}
                    onChange={(e) => setFormData({ ...formData, pwd: e.target.checked })}
                  />
                  <span>Person with Disability (PwD) — Require Specialized Accessibility Support (WCAG 2.1 AA)</span>
                </label>
              </div>

              <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button type="reset" className="btn btn-secondary">Clear</button>
                <button type="submit" className="btn btn-primary btn-lg">
                  <UserCheck size={18} /> Submit Intake Application
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="col-span-4">
          <div className="card" style={{ marginBottom: "24px" }}>
            <div className="card-header">
              <h4 className="card-title">Real-Time Quota Balancer</h4>
              <span className="badge badge-success">Live Engine</span>
            </div>
            <div style={{ textAlign: "center", margin: "16px 0" }}>
              <div style={{ fontFamily: "var(--font-headline)", fontSize: "36px", fontWeight: 800, color: "var(--primary)" }}>
                {femalePct}%
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-subtle)" }}>Nationwide Female Trainee Ratio</div>
              <div className="progress-bar-bg" style={{ marginTop: "12px" }}>
                <div className="progress-bar-fill fill-success" style={{ width: `${femalePct}%` }}></div>
              </div>
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", background: "var(--surface-dim)", padding: "12px", borderRadius: "var(--radius-md)" }}>
              <CheckCircle size={14} style={{ verticalAlign: "middle", color: "var(--success)", marginRight: "6px" }} />
              Statutory Rule: Minimum 30.0% female ratio enforced. Female intake applications are given priority routing.
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Provincial Quota Allocation</h4>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {provincialStats.map(p => (
                <div key={p.province} style={{ fontSize: "12.5px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, marginBottom: "3px" }}>
                    <span>{p.province}</span>
                    <span style={{ fontFamily: "var(--font-mono)", color: "var(--primary)" }}>{p.enrolled} / {p.capacity}</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${(p.enrolled / p.capacity * 100).toFixed(1)}%` }}></div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--text-subtle)", marginTop: "2px" }}>
                    <span>Female Ratio: {p.female_pct}%</span>
                    <span>{(p.enrolled / p.capacity * 100).toFixed(0)}% Filled</span>
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

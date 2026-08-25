import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  UserPlus, 
  CheckCircle2, 
  ArrowLeft, 
  ShieldCheck, 
  Clock, 
  Send, 
  GraduationCap, 
  Briefcase,
  AlertCircle
} from 'lucide-react';

export const TrainerRegistrationView = () => {
  const { registerTrainer, navigateTo, switchRole, tracks } = useApp();
  
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    cnic: "",
    phone: "",
    password: "",
    education: "MS in Computer Science (AI Specialization) — 18 Years",
    institution: "",
    experience_years: 5,
    assigned_track: "Track 1: Students & Fresh Graduates",
    specializations: ["Machine Learning", "Deep Learning"],
    portfolio_url: "",
    notes: ""
  });

  const [submittedRef, setSubmittedRef] = useState(null);

  const handleCheckboxChange = (spec) => {
    setFormData(prev => {
      const exists = prev.specializations.includes(spec);
      return {
        ...prev,
        specializations: exists 
          ? prev.specializations.filter(s => s !== spec)
          : [...prev.specializations, spec]
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email || !formData.cnic) {
      alert("Please fill all mandatory fields!");
      return;
    }

    const created = registerTrainer(formData);
    setSubmittedRef(created);
  };

  if (submittedRef) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "40px 20px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-body)" }}>
        <div className="card" style={{ maxWidth: "640px", width: "100%", textAlign: "center", padding: "40px 30px", borderRadius: "16px", boxShadow: "var(--shadow-lg)" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#fef3c7", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Clock size={32} />
          </div>

          <div className="badge badge-warning" style={{ fontSize: "12px", padding: "6px 14px", marginBottom: "14px" }}>
            Application Status: PENDING SUPER ADMIN APPROVAL
          </div>

          <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-main)", marginBottom: "8px", fontFamily: "var(--font-headline)" }}>
            Trainer Application Registered!
          </h2>

          <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.6", marginBottom: "24px" }}>
            Thank you, <strong>{submittedRef.full_name}</strong>. Your profile and credentials have been securely transmitted to the 
            <strong> MoITT Super Admin Governance Panel</strong> for verification against the National AI RFP Accreditation criteria.
          </p>

          <div style={{ background: "var(--surface-dim)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "16px", textAlign: "left", marginBottom: "28px", fontSize: "12.5px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ color: "var(--text-subtle)" }}>Application Reference:</span>
              <strong style={{ fontFamily: "var(--font-mono)", color: "var(--primary)" }}>{submittedRef.id}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ color: "var(--text-subtle)" }}>Applicant CNIC:</span>
              <strong style={{ fontFamily: "var(--font-mono)" }}>{submittedRef.cnic}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ color: "var(--text-subtle)" }}>Education & Experience:</span>
              <span>{submittedRef.education} ({submittedRef.experience_years} yrs exp)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-subtle)" }}>Assigned Track:</span>
              <span>{submittedRef.assigned_track}</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button 
              onClick={() => { switchRole("SUPER_ADMIN"); navigateTo("trainer-approvals"); }}
              className="btn btn-primary"
              style={{ background: "linear-gradient(135deg, #1d4ed8, #2563eb)", padding: "12px" }}
            >
              👑 Open Super Admin Panel to Approve this Trainer (Demo Quick Action)
            </button>

            <button 
              onClick={() => navigateTo("auth-portal")}
              className="btn btn-secondary"
            >
              <ArrowLeft size={14} /> Back to Sign In Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "var(--font-body)" }}>
      <div style={{ width: "100%", maxWidth: "780px" }}>
        
        {/* Top Header Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <button 
            onClick={() => navigateTo("auth-portal")}
            className="btn btn-secondary btn-sm"
          >
            <ArrowLeft size={14} /> Back to Sign In
          </button>
          <span style={{ fontSize: "12px", color: "var(--text-subtle)" }}>
            MoITT RFP Accredited Instructor Intake
          </span>
        </div>

        <div className="card" style={{ padding: "32px", borderRadius: "16px", boxShadow: "var(--shadow-md)" }}>
          <div style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "20px", marginBottom: "24px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "var(--primary-tint)", border: "1px solid var(--primary-border)", padding: "4px 12px", borderRadius: "9999px", fontSize: "11.5px", color: "var(--primary-dark)", fontWeight: 700, marginBottom: "8px" }}>
              <ShieldCheck size={13} /> Subject Matter Expert (SME) Registration
            </div>
            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-main)", fontFamily: "var(--font-headline)", margin: "0 0 6px" }}>
              Apply as an Accredited AI Trainer
            </h2>
            <p style={{ fontSize: "13.5px", color: "var(--text-muted)", margin: 0 }}>
              Under MoITT policy, all trainers must possess ≥ 16 years of education and ≥ 3 years of industry experience. Applications are reviewed and activated by the Super Admin.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal & Identity */}
            <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-main)", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "var(--primary)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>1</span>
              Personal & NADRA Identity Verification
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name (as on CNIC) *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Dr. Hammad Mustafa"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">CNIC Number (NADRA Verified) *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="35201-1234567-1"
                  required
                  value={formData.cnic}
                  onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                />
              </div>
            </div>

            <div className="grid-3" style={{ marginBottom: "20px" }}>
              <div className="form-group">
                <label className="form-label">Official Email *</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="hammad@university.edu.pk"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Phone *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="+92 300 1234567"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            {/* Step 2: Academic & Industry Qualifications */}
            <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-main)", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px", borderTop: "1px solid var(--border-subtle)", paddingTop: "20px" }}>
              <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "var(--primary)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>2</span>
              Academic Credentials & Industry Experience
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Highest Degree Qualification *</label>
                <select 
                  className="form-control"
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                >
                  <option value="MS in Computer Science (AI Specialization) — 18 Years">MS / M.Phil in CS / AI (18 Years)</option>
                  <option value="PhD in Artificial Intelligence / Data Science — 20+ Years">PhD in AI / Machine Learning (20+ Years)</option>
                  <option value="BS in Computer Science / Software Engineering — 16 Years">BS in CS / SE / Data Science (16 Years)</option>
                  <option value="Master of Information Technology — 16 Years">MIT / MCS (16 Years)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Affiliated University / Organization *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. NUST / FAST / LUMS / Tech Enterprise"
                  required
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                />
              </div>
            </div>

            <div className="grid-2" style={{ marginBottom: "20px" }}>
              <div className="form-group">
                <label className="form-label">Total AI/Industry Experience (Years) *</label>
                <input
                  type="number"
                  min="3"
                  max="35"
                  className="form-control"
                  required
                  value={formData.experience_years}
                  onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Curriculum Track *</label>
                <select 
                  className="form-control"
                  value={formData.assigned_track}
                  onChange={(e) => setFormData({ ...formData, assigned_track: e.target.value })}
                >
                  {tracks.map(t => (
                    <option key={t.id} value={`Track ${t.number}: ${t.title}`}>
                      Track #{t.number}: {t.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Specialization Matrix */}
            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label className="form-label">Key AI Specializations & Competencies</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", background: "var(--surface-dim)", padding: "14px", borderRadius: "var(--radius-md)" }}>
                {[
                  "Machine Learning",
                  "Deep Learning",
                  "NLP & LLMs",
                  "Computer Vision",
                  "MLOps & Deployment",
                  "AI Ethics & Governance",
                  "Robotics & Edge AI",
                  "FinTech & Risk Scoring",
                  "Agentic Workflows"
                ].map(spec => {
                  const isChecked = formData.specializations.includes(spec);
                  return (
                    <label key={spec} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", cursor: "pointer" }}>
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={() => handleCheckboxChange(spec)}
                      />
                      <span>{spec}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "24px" }}>
              <label className="form-label">GitHub / Portfolio / Research Profile URL</label>
              <input
                type="text"
                className="form-control"
                placeholder="https://github.com/your-profile or Google Scholar"
                value={formData.portfolio_url}
                onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "24px" }}>
              <label className="form-label">Brief Background Summary & Industry Track Record</label>
              <textarea
                rows="3"
                className="form-control"
                placeholder="Describe your prior AI teaching experience, capstone mentorship, and hands-on tool proficiencies..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              ></textarea>
            </div>

            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "14px", borderRadius: "var(--radius-md)", marginBottom: "24px", display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "12.5px", color: "#166534" }}>
              <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <strong>Super Admin Gatekeeper Notice:</strong> Submitting this form registers your candidate profile with status <code>PENDING_APPROVAL</code>. 
                MoITT Super Admin will review your credentials and grant accreditation before you can sign in to propose courses and instruct students.
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => navigateTo("auth-portal")}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ padding: "10px 24px" }}
              >
                <Send size={15} /> Submit Application to Super Admin
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

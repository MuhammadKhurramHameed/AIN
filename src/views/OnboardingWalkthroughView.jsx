import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const OnboardingWalkthroughView = () => {
  const { navigateTo } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    cnic: '35201-9988776-1',
    fullName: 'Muhammad Khurram Hameed',
    email: 'khurram@ain.org.pk',
    phone: '300 1234567',
    province: 'Punjab',
    gender: 'Male',
    education: 'Bachelors in CS',
    track: 'Track 1: Applied MLOps & LLM Orchestration'
  });

  const handleNext = (e) => {
    e.preventDefault();
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      navigateTo('trainee-dashboard');
    }
  };

  return (
    <div className="stitch-container">
      {/* Header & Stepper Section */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "32px", fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>
          Registration Wizard
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", maxWidth: "600px" }}>
          Complete your personal profile to initiate the regional allocation process under National AI Program protocols.
        </p>
      </div>

      {/* Stepper Node Progress */}
      <div className="stitch-wizard-stepper">
        <div className="stitch-wizard-line"></div>
        <div
          className="stitch-wizard-progress"
          style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
        ></div>

        <div className={`stitch-step-node ${currentStep >= 1 ? 'active' : ''}`} onClick={() => setCurrentStep(1)}>
          <div className="stitch-step-circle">
            <span className="material-symbols-outlined" style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1" }}>person</span>
          </div>
          <span className="stitch-step-label">1. Personal Profile</span>
        </div>

        <div className={`stitch-step-node ${currentStep >= 2 ? 'active' : ''}`} onClick={() => setCurrentStep(2)}>
          <div className="stitch-step-circle">
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>analytics</span>
          </div>
          <span className="stitch-step-label">2. Regional Domicile</span>
        </div>

        <div className={`stitch-step-node ${currentStep >= 3 ? 'active' : ''}`} onClick={() => setCurrentStep(3)}>
          <div className="stitch-step-circle">
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>category</span>
          </div>
          <span className="stitch-step-label">3. Track Selection</span>
        </div>

        <div className={`stitch-step-node ${currentStep >= 4 ? 'active' : ''}`} onClick={() => setCurrentStep(4)}>
          <div className="stitch-step-circle">
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>verified_user</span>
          </div>
          <span className="stitch-step-label">4. Verification</span>
        </div>
      </div>

      {/* Main Wizard Form Card */}
      <div className="card" style={{ padding: "32px", background: "#ffffff" }}>
        {currentStep === 1 && (
          <form onSubmit={handleNext} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "18px", fontWeight: 700, color: "#0f172a", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
              Step 1: Candidate Identity Profile
            </h2>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">National CNIC *</label>
                <input
                  type="text"
                  className="form-control"
                  style={{ fontFamily: "var(--font-mono)" }}
                  value={formData.cnic}
                  onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Full Legal Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Phone Number *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "12px" }}>
              <button type="submit" className="btn btn-primary btn-lg" style={{ gap: "8px" }}>
                Proceed to Regional Selection
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span>
              </button>
            </div>
          </form>
        )}

        {currentStep === 2 && (
          <form onSubmit={handleNext} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "18px", fontWeight: 700, color: "#0f172a", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
              Step 2: Regional Domicile &amp; Demographics
            </h2>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Domicile Province *</label>
                <select
                  className="form-control form-select"
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                >
                  <option value="Punjab">Punjab</option>
                  <option value="Sindh">Sindh</option>
                  <option value="KPK">Khyber Pakhtunkhwa</option>
                  <option value="Balochistan">Balochistan</option>
                  <option value="ICT">Islamabad Capital Territory</option>
                  <option value="GB">Gilgit-Baltistan</option>
                  <option value="AJK">Azad Jammu &amp; Kashmir</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Gender *</label>
                <select
                  className="form-control form-select"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other / Prefer not to say</option>
                </select>
              </div>
            </div>

            <div style={{ background: "#dcfce7", border: "1px solid #a7f3d0", padding: "14px 16px", borderRadius: "10px", color: "#14532d", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="material-symbols-outlined" style={{ color: "#16a34a" }}>verified</span>
              <span>Seat enrollment available for {formData.province} region. Eligibility verified.</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "12px" }}>
              <button type="button" onClick={() => setCurrentStep(1)} className="btn btn-secondary">Back</button>
              <button type="submit" className="btn btn-primary btn-lg" style={{ gap: "8px" }}>
                Proceed to Track Selection
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span>
              </button>
            </div>
          </form>
        )}

        {currentStep === 3 && (
          <form onSubmit={handleNext} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "18px", fontWeight: 700, color: "#0f172a", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
              Step 3: Curriculum Track Selection
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                "Track 1: Applied MLOps & LLM Orchestration (NUST Hub)",
                "Track 2: Deep Learning & Computer Vision Systems (FAST Hub)",
                "Track 3: Generative AI & Fine-Tuning Architectures (COMSATS Hub)",
                "Track 4: Enterprise Data Engineering & Vector DBs (LUMS Hub)",
              ].map((trackName, idx) => (
                <label
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "16px",
                    borderRadius: "12px",
                    border: formData.track === trackName ? "2px solid #1d4ed8" : "1px solid #e2e8f0",
                    background: formData.track === trackName ? "#eff6ff" : "#ffffff",
                    cursor: "pointer"
                  }}
                >
                  <input
                    type="radio"
                    name="trackOption"
                    checked={formData.track === trackName}
                    onChange={() => setFormData({ ...formData, track: trackName })}
                    style={{ marginRight: "12px" }}
                  />
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>{trackName}</span>
                </label>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "12px" }}>
              <button type="button" onClick={() => setCurrentStep(2)} className="btn btn-secondary">Back</button>
              <button type="submit" className="btn btn-primary btn-lg" style={{ gap: "8px" }}>
                Review &amp; Verify Profile
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span>
              </button>
            </div>
          </form>
        )}

        {currentStep === 4 && (
          <form onSubmit={handleNext} style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyCenter: "center", margin: "0 auto 16px auto", border: "1px solid #a7f3d0" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "36px", fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "24px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>
              Application Ready for Submission
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-subtle)", maxWidth: "500px", margin: "0 auto 24px auto", lineHeight: 1.6 }}>
              Candidate Profile for <strong>{formData.fullName}</strong> ({formData.cnic}) assigned to <strong>{formData.track}</strong> under <strong>{formData.province}</strong> provincial allocation quota.
            </p>

            <button type="submit" className="btn btn-primary btn-lg">
              Submit Candidate Profile &amp; Launch Portal
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

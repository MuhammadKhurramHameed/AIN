import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const LandingPageView = () => {
  const { navigateTo } = useApp();
  const [uuid, setUuid] = useState('');

  const handleVerify = (e) => {
    e.preventDefault();
    if (uuid.trim()) {
      navigateTo('authenticator');
    }
  };

  return (
    <div style={{ background: "var(--surface-canvas)", minHeight: "100vh" }}>
      {/* Stitch Public Top Navbar */}
      <nav style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e2e8f0",
        padding: "14px 32px"
      }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            <a href="#" style={{ fontFamily: "var(--font-headline)", fontSize: "22px", fontWeight: 800, color: "#1d4ed8", textDecoration: "none" }}>
              Synapse LMS
            </a>
            <div style={{ display: "flex", gap: "24px", fontSize: "13.5px", fontWeight: 600, color: "#475569" }}>
              <a href="#curriculum" style={{ color: "inherit", textDecoration: "none" }}>Curriculum Tracks</a>
              <a href="#verification" style={{ color: "inherit", textDecoration: "none" }}>Credential Verification</a>
              <a href="#network" style={{ color: "inherit", textDecoration: "none" }}>University Consortium</a>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button onClick={() => navigateTo("sign-in")} className="btn btn-secondary btn-sm">
              Institutional Sign In
            </button>
            <button onClick={() => navigateTo("sign-in")} className="btn btn-primary btn-sm">
              Launch Portal
            </button>
          </div>
        </div>
      </nav>

      <div className="stitch-container" style={{ paddingTop: "32px" }}>
        {/* Hero Section */}
        <section className="stitch-hero-grid">
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="stitch-badge-cohort">
              <span className="stitch-pulse-dot"></span>
              <span>2026 NATIONAL COHORT OPEN • 20,000 FREE SEATS</span>
            </div>

            <h1 className="stitch-hero-title">
              Empowering Pakistan’s Youth &amp; Next-Gen AI Innovators
            </h1>

            <p className="stitch-hero-desc">
              Comprehensive 9-track AI curriculum designed for students, professionals, and founders. Real-time telemetry tracking and verifiable cryptographic credentialing.
            </p>

            <div className="stitch-badge-quota">
              <span className="material-symbols-outlined text-emerald-600" style={{ fontVariationSettings: "'FILL' 1", color: "#16a34a" }}>verified</span>
              <span>✨ Verified ≥ 30% Female Quota Enforced</span>
            </div>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "8px" }}>
              <button
                onClick={() => navigateTo("public-intake")}
                className="btn btn-primary btn-lg"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                Explore Curriculum Tracks
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span>
              </button>
              <button
                onClick={() => navigateTo("authenticator")}
                className="btn btn-secondary btn-lg"
              >
                Verify a Credential
              </button>
            </div>
          </div>

          {/* Hero Image Box with Floating Cards */}
          <div className="stitch-hero-img-box">
            <img
              alt="Pakistani Students in AI Lab"
              className="stitch-hero-img"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCoWzLJLfszk8rk_7rb7dDVkFOFpMEOdfLpKWcyUhZOcj4sJ941bwZr1ARUwmneptndKxJQEO5IIZv5Jr_PKC72YHfyXU6ybZj7wJnx5wjR2cYj2tAb2LXxN6Gd5A5JbWQMDHq4uJta4L_UJJUu2BQWFkZVqdBUKf1WZ7mqB24b4RaiNlnKdHo06wRzR59lZpLjiac3OXtS-jq8g73xMeo9_6IhaSXPeaenD4YNo6l2sg-jrA8xWwG7UA"
            />

            {/* Floating Card Top Right */}
            <div className="stitch-floating-card stitch-floating-top">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-subtle)", textTransform: "uppercase" }}>Progress Telemetry</span>
                <span className="stitch-pulse-dot" style={{ background: "#1d4ed8" }}></span>
              </div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a" }}>24.0 / 24.0 hrs</div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#16a34a", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>check_circle</span> Logged &amp; Verified
              </div>
            </div>

            {/* Floating Card Bottom Left */}
            <div className="stitch-floating-card stitch-floating-bottom">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyCenter: "center" }}>
                  <span className="material-symbols-outlined">group</span>
                </div>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>55% Participation</div>
                  <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-subtle)", textTransform: "uppercase" }}>Female Quota Compliance</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Verification Card Section */}
        <section id="verification" className="stitch-card-credentials">
          <div style={{ padding: "40px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "var(--surface-dim)", padding: "4px 12px", borderRadius: "9999px", width: "fit-content", marginBottom: "20px" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "var(--text-muted)" }}>security</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", textTransform: "uppercase", fontWeight: 600, color: "var(--text-muted)" }}>Cryptographic Security &amp; Verification</span>
            </div>

            <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "28px", fontWeight: 800, color: "#0f172a", marginBottom: "12px" }}>
              Tamper-Proof National AI Credentials
            </h2>

            <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "24px" }}>
              Every certificate issued is secured with SHA-256 hashing and backed by continuous learning telemetry. Instantly verify the authenticity and logged hours of any graduate.
            </p>

            <form onSubmit={handleVerify} style={{ maxWidth: "440px" }}>
              <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "11px", textTransform: "uppercase", fontWeight: 600, color: "var(--text-subtle)", marginBottom: "8px" }}>
                Enter Certificate UUID or CNIC
              </label>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., UUID-1234-5678..."
                  value={uuid}
                  onChange={(e) => setUuid(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary" style={{ whiteSpace: "nowrap" }}>
                  Verify Instantly
                </button>
              </div>
            </form>
          </div>

          {/* Right Verification Graphic Box */}
          <div style={{ background: "var(--surface-dim)", padding: "40px", borderLeft: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "#ffffff", padding: "28px", borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center", maxWidth: "340px", width: "100%", boxShadow: "var(--shadow-md)" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto", border: "1px solid #a7f3d0" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "32px", fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              </div>
              <h4 style={{ fontFamily: "var(--font-headline)", fontWeight: 800, fontSize: "18px", color: "#0f172a", marginBottom: "4px" }}>Ed25519 Root Signed</h4>
              <p style={{ fontSize: "12px", color: "var(--text-subtle)", marginBottom: "16px" }}>MOITT Ministry Cryptographic Trust Chain</p>
              <div style={{ display: "flex", justifyContent: "center", gap: "6px", fontSize: "11px", fontFamily: "var(--font-mono)" }}>
                <span className="badge badge-primary">SHA-256</span>
                <span className="badge badge-success">VALID</span>
                <span className="badge" style={{ background: "#f3e8ff", color: "#7e22ce" }}>24H TELEMETRY</span>
              </div>
            </div>
          </div>
        </section>

        {/* Curriculum Tracks Explorer */}
        <section id="curriculum" style={{ marginBottom: "48px" }}>
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "32px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>
              Curriculum Tracks
            </h2>
            <p style={{ fontSize: "15px", color: "var(--text-muted)", maxWidth: "600px", margin: "0 auto" }}>
              Select a specialized pathway tailored to your experience level and sector goals.
            </p>
          </div>

          <div className="stitch-track-grid">
            {/* Card 1 */}
            <div className="stitch-track-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span className="badge" style={{ background: "#f1f5f9", color: "#0f172a" }}>Level 2 Applied</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-subtle)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>schedule</span> 24h
                </span>
              </div>
              <h3 style={{ fontFamily: "var(--font-headline)", fontSize: "18px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>Fresh Graduates &amp; Students</h3>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px", flex: 1, lineHeight: 1.5 }}>
                Core foundations in Python, Machine Learning, Computer Vision, and NLP tailored for entry-level talent.
              </p>
              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "16px" }}>
                <button
                  onClick={() => navigateTo("public-intake")}
                  className="btn btn-ghost"
                  style={{ width: "100%", color: "#1d4ed8", justifyContent: "center" }}
                >
                  Apply Now <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="stitch-track-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span className="badge" style={{ background: "#f1f5f9", color: "#0f172a" }}>Level 1/2</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-subtle)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>schedule</span> 18-24h
                </span>
              </div>
              <h3 style={{ fontFamily: "var(--font-headline)", fontSize: "18px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>Teaching &amp; Sectoral Professionals</h3>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px", flex: 1, lineHeight: 1.5 }}>
                Applied AI in Pedagogy, Healthcare, and sector-specific automation workflows.
              </p>
              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "16px" }}>
                <button
                  onClick={() => navigateTo("public-intake")}
                  className="btn btn-ghost"
                  style={{ width: "100%", color: "#1d4ed8", justifyContent: "center" }}
                >
                  Explore Track <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Card 3 */}
            <div className="stitch-track-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span className="badge badge-primary">Level 3 Advanced</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-subtle)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>schedule</span> 24h
                </span>
              </div>
              <h3 style={{ fontFamily: "var(--font-headline)", fontSize: "18px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>Startup Founders &amp; Freelancers</h3>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px", flex: 1, lineHeight: 1.5 }}>
                Advanced deployment, Agentic workflows, LangChain, and scalable AI infrastructure.
              </p>
              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "16px" }}>
                <button
                  onClick={() => navigateTo("public-intake")}
                  className="btn btn-ghost"
                  style={{ width: "100%", color: "#1d4ed8", justifyContent: "center" }}
                >
                  Enroll Now <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ borderTop: "1px solid #e2e8f0", paddingTop: "32px", paddingBottom: "32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div style={{ fontFamily: "var(--font-headline)", fontWeight: 800, fontSize: "18px", color: "#0f172a" }}>Synapse LMS</div>
              <p style={{ fontSize: "12px", color: "var(--text-subtle)", marginTop: "4px" }}>© 2026 National AI Advancement Initiative. Managed by Synapse Consortium.</p>
            </div>
            <div style={{ display: "flex", gap: "20px", fontSize: "12px", color: "var(--text-muted)" }}>
              <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Security Protocol</a>
              <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Credential Verification</a>
              <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Governance</a>
              <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Privacy Policy</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

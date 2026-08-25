import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Award, Download, Share2, Lock } from 'lucide-react';

export const CertificateIssuanceView = () => {
  const { currentUser } = useApp();

  return (
    <div className="page-view">
      <div className="grid-12">
        <div className="col-span-12" style={{ textAlign: "center", marginBottom: "16px" }}>
          <span className="badge badge-success" style={{ fontSize: "13px", padding: "6px 16px" }}>
            Requirements Fully Satisfied (24/24 Contact Hours)
          </span>
          <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "28px", fontWeight: 800, marginTop: "8px" }}>
            Congratulations on Completing NAIAI Level 2!
          </h2>
          <p style={{ color: "var(--text-subtle)" }}>
            Your official Ministry certificate has been cryptographically signed and issued.
          </p>
        </div>

        <div className="col-span-12">
          <div className="certificate-preview-box">
            <div className="certificate-header-logo">
              <ShieldCheck size={32} style={{ color: "#1e3a8a" }} />
              <div style={{ textAlign: "left" }}>
                <h4 style={{ fontFamily: "var(--font-headline)", fontWeight: 800, color: "#1e3a8a", fontSize: "16px" }}>
                  GOVERNMENT OF PAKISTAN
                </h4>
                <p style={{ fontSize: "11px", color: "#475569", letterSpacing: "0.5px" }}>
                  MINISTRY OF INFORMATION TECHNOLOGY & TELECOMMUNICATION
                </p>
              </div>
            </div>

            <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "#64748b", textTransform: "uppercase", letterSpacing: "2px" }}>
              National Certificate of AI Competency
            </p>
            <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "32px", fontWeight: 800, color: "#0f172a", margin: "12px 0 4px 0" }}>
              {currentUser.name}
            </h2>
            <p style={{ fontSize: "13px", color: "#475569" }}>
              CNIC: <span style={{ fontFamily: "var(--font-mono)" }}>{currentUser.cnic}</span>
            </p>

            <div style={{ margin: "20px 0", padding: "18px", background: "#f8fafc", borderRadius: "var(--radius-md)", border: "1px solid #e2e8f0" }}>
              <p style={{ fontSize: "12.5px", color: "#64748b" }}>
                has successfully completed <strong>24.0 Verified Contact Hours</strong> and passed the evaluation capstone for:
              </p>
              <h3 style={{ fontFamily: "var(--font-headline)", fontSize: "20px", color: "#1d4ed8", fontWeight: 700, marginTop: "6px" }}>
                Track 1: Students & Fresh Graduates (Level 2: Applied)
              </h3>
            </div>

            <div className="certificate-seal">
              <Award size={36} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "24px", textAlign: "left", fontSize: "11px" }}>
              <div>
                <p style={{ color: "#64748b" }}>Issued by Consortium Partner:</p>
                <strong style={{ color: "#0f172a" }}>National University of Sciences & Technology (NUST)</strong>
                <p style={{ color: "#64748b", marginTop: "4px" }}>
                  Certificate No: <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>NAIAI-2026-884920</span>
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="badge badge-success" style={{ fontSize: "11px", marginBottom: "4px" }}>
                  <Lock size={12} style={{ marginRight: "4px" }} /> Cryptographically Verified
                </div>
                <p style={{ fontFamily: "var(--font-mono)", color: "#64748b", fontSize: "9.5px" }}>
                  Ed25519: 8f9a2c3b4e5f6a7b8c9d0e1f...
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "24px" }}>
            <button className="btn btn-primary btn-lg" onClick={() => alert("Downloading High-Resolution Verified PDF Certificate...")}>
              <Download size={18} /> Download PDF Certificate
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => alert("Share link copied to clipboard!")}>
              <Share2 size={18} /> Share on LinkedIn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

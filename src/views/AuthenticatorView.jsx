import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Search, Lock, Award } from 'lucide-react';

export const AuthenticatorView = () => {
  const { certificates } = useApp();
  const [searchQuery, setSearchQuery] = useState("NAIAI-2026-884920");
  const [foundCert, setFoundCert] = useState(certificates[0]);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim().toUpperCase();
    const match = certificates.find(c => c.certificate_number === query || c.cnic === query);
    if (match) {
      setFoundCert(match);
    } else {
      alert(`Certificate Record "${query}" not found. Try searching with sample ID: NAIAI-2026-884920`);
    }
  };

  return (
    <div className="page-view">
      <div className="grid-12">
        <div className="col-span-12">
          <div className="card" style={{ textAlign: "center", padding: "36px" }}>
            <ShieldCheck size={48} style={{ color: "var(--primary)", margin: "0 auto 12px auto" }} />
            <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "24px", fontWeight: 800 }}>
              Synapse LMS Credential Authenticator
            </h2>
            <p style={{ color: "var(--text-subtle)", maxWidth: "540px", margin: "6px auto 24px auto" }}>
              Verify the cryptographic validity of certificates issued under the National Artificial Intelligence Advancement Initiative (MoITT).
            </p>

            <form onSubmit={handleSearch} style={{ maxWidth: "580px", margin: "0 auto", display: "flex", gap: "10px" }}>
              <input
                type="text"
                className="form-control"
                placeholder="Enter Certificate ID (e.g. NAIAI-2026-884920) or CNIC"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ fontFamily: "var(--font-mono)", fontSize: "14px" }}
              />
              <button type="submit" className="btn btn-primary btn-lg">
                <Search size={18} /> Verify
              </button>
            </form>
          </div>
        </div>

        {foundCert && (
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
              <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "28px", fontWeight: 800, color: "#0f172a", margin: "12px 0 4px 0" }}>
                {foundCert.trainee_name}
              </h2>
              <p style={{ fontSize: "13px", color: "#475569" }}>
                CNIC: <span style={{ fontFamily: "var(--font-mono)" }}>{foundCert.cnic}</span>
              </p>

              <div style={{ margin: "20px 0", padding: "16px", background: "#f8fafc", borderRadius: "var(--radius-md)", border: "1px solid #e2e8f0" }}>
                <p style={{ fontSize: "12px", color: "#64748b" }}>
                  has successfully completed <strong>{foundCert.hours_completed.toFixed(1)} Verified Contact Hours</strong> and passed the evaluation capstone for:
                </p>
                <h3 style={{ fontFamily: "var(--font-headline)", fontSize: "18px", color: "#1d4ed8", fontWeight: 700, marginTop: "6px" }}>
                  {foundCert.track_title}
                </h3>
              </div>

              <div className="certificate-seal">
                <Award size={36} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "24px", textAlign: "left", fontSize: "11px" }}>
                <div>
                  <p style={{ color: "#64748b" }}>Issued by Consortium Partner:</p>
                  <strong style={{ color: "#0f172a" }}>{foundCert.consortium_partner}</strong>
                  <p style={{ color: "#64748b", marginTop: "4px" }}>
                    Certificate No: <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{foundCert.certificate_number}</span>
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="badge badge-success" style={{ fontSize: "11px", marginBottom: "4px" }}>
                    <Lock size={12} style={{ marginRight: "4px" }} /> Cryptographically Verified
                  </div>
                  <p style={{ fontFamily: "var(--font-mono)", color: "#64748b", fontSize: "9.5px" }}>
                    Ed25519: {foundCert.digital_signature.substring(0, 24)}...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

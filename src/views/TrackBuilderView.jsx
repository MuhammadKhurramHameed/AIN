import React from 'react';
import { useApp } from '../context/AppContext';
import { Plus } from 'lucide-react';

export const TrackBuilderView = () => {
  const { tracks } = useApp();

  return (
    <div className="page-view">
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">National Track Architecture Builder</h3>
            <p className="card-subtitle">Curriculum module design and level taxonomies (Level 1, Level 2, Level 3)</p>
          </div>
          <button className="btn btn-primary" onClick={() => alert("Module Builder Modal launched.")}>
            <Plus size={16} /> Add New Curriculum Module
          </button>
        </div>

        <div className="grid-3">
          {tracks.map(t => (
            <div key={t.id} className="card" style={{ padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <span className="badge badge-primary">Track #{t.number}</span>
                <span className="badge badge-neutral" style={{ fontFamily: "var(--font-mono)" }}>{t.hours} Total Hours</span>
              </div>
              <h4 style={{ fontFamily: "var(--font-headline)", fontWeight: 700, fontSize: "15px", marginBottom: "4px" }}>
                {t.title}
              </h4>
              <p style={{ fontSize: "11px", color: "var(--text-subtle)", marginBottom: "12px" }}>{t.category}</p>

              <div style={{ background: "var(--surface-dim)", padding: "10px", borderRadius: "var(--radius-md)", fontSize: "11.5px", marginBottom: "12px" }}>
                <strong style={{ display: "block", marginBottom: "4px" }}>Core Modules:</strong>
                <ul style={{ paddingLeft: "16px", color: "var(--text-muted)" }}>
                  {t.modules.map((m, idx) => (
                    <li key={idx}>{m}</li>
                  ))}
                </ul>
              </div>

              <div style={{ fontSize: "11px", color: "var(--primary-dark)", background: "var(--primary-tint)", padding: "6px 10px", borderRadius: "var(--radius-sm)" }}>
                🎯 <strong>Capstone:</strong> {t.capstone}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

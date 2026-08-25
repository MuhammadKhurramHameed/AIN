import React, { useState } from 'react';
import { Layers, Plus, CheckCircle, Clock } from 'lucide-react';

export const KanbanView = () => {
  const [cards, setCards] = useState([
    { id: "c1", title: "Module 4: Urdu Translation of MLOps Lab Manual", track: "Track 1", column: "IN_REVIEW", assignee: "Dr. Saima Riaz", priority: "HIGH" },
    { id: "c2", title: "Level 3 Governance Module: Risk Computation SOP", track: "Track 4", column: "APPROVED", assignee: "Prof. Tariq Hassan", priority: "MEDIUM" },
    { id: "c3", title: "Generative AI Legal Ethics for Public Servants", track: "Track 5", column: "PUBLISHED", assignee: "Dr. Kamran Siddiqui", priority: "CRITICAL" },
    { id: "c4", title: "PyTorch Lightning Hands-on Notebook Review", track: "Track 8", column: "BACKLOG", assignee: "Dr. Zeeshan Haider", priority: "MEDIUM" }
  ]);

  const columns = [
    { id: "BACKLOG", label: "Backlog / Drafts", color: "#64748b" },
    { id: "IN_REVIEW", label: "Pedagogy Review", color: "#d97706" },
    { id: "APPROVED", label: "MoITT Approved", color: "#1d4ed8" },
    { id: "PUBLISHED", label: "Published to LMS", color: "#16a34a" }
  ];

  const moveCard = (cardId, newCol) => {
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, column: newCol } : c));
  };

  return (
    <div className="page-view">
      <div className="card" style={{ marginBottom: "20px" }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Curriculum Architecture & Review Kanban</h3>
            <p className="card-subtitle">Agile publishing workflow across pedagogy reviews, Urdu translations, and ministry approvals</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => alert("Task card creation modal launched.")}>
            <Plus size={14} /> New Curriculum Task
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        {columns.map(col => {
          const colCards = cards.filter(c => c.column === col.id);
          return (
            <div key={col.id} style={{ background: "var(--surface-dim)", padding: "16px", borderRadius: "var(--radius-lg)", minHeight: "480px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", paddingBottom: "8px", borderBottom: `2px solid ${col.color}` }}>
                <strong style={{ fontSize: "13px", color: "var(--text-main)" }}>{col.label}</strong>
                <span className="badge badge-neutral">{colCards.length}</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {colCards.map(c => (
                  <div key={c.id} className="card" style={{ padding: "14px", background: "var(--surface-card)" }}>
                    <span className="badge badge-primary" style={{ marginBottom: "6px" }}>{c.track}</span>
                    <h5 style={{ fontFamily: "var(--font-headline)", fontSize: "13.5px", fontWeight: 700, margin: "4px 0 8px 0" }}>{c.title}</h5>
                    <div style={{ fontSize: "11px", color: "var(--text-subtle)", display: "flex", justifyContent: "space-between" }}>
                      <span>👤 {c.assignee}</span>
                      <span style={{ fontWeight: 600, color: c.priority === 'CRITICAL' ? 'var(--error)' : 'var(--warning)' }}>{c.priority}</span>
                    </div>

                    <div style={{ display: "flex", gap: "6px", marginTop: "12px", paddingTop: "8px", borderTop: "1px solid var(--border-subtle)" }}>
                      {columns.map(targetCol => (
                        targetCol.id !== c.column && (
                          <button
                            key={targetCol.id}
                            className="btn btn-ghost btn-sm"
                            style={{ fontSize: "9.5px", padding: "2px 6px" }}
                            onClick={() => moveCard(c.id, targetCol.id)}
                          >
                            → {targetCol.label.split(" ")[0]}
                          </button>
                        )
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

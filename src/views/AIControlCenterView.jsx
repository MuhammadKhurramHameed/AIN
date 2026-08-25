import React, { useState } from 'react';
import { Cpu, Server, Key, Zap, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';

export const AIControlCenterView = () => {
  const [providers] = useState([
    { id: "prov-1", name: "OpenAI GPT Gateway", providerId: "openai", status: "ACTIVE", quota: "50,000,000", used: "14,250,000", model: "gpt-4o", latency: "142ms" },
    { id: "prov-2", name: "Anthropic Claude Suite", providerId: "anthropic", status: "ACTIVE", quota: "30,000,000", used: "8,900,000", model: "claude-3-5-sonnet", latency: "168ms" },
    { id: "prov-3", name: "Google Gemini AI Infrastructure", providerId: "google", status: "ACTIVE", quota: "40,000,000", used: "11,100,000", model: "gemini-1.5-pro", latency: "120ms" },
    { id: "prov-4", name: "National On-Prem Ollama Llama-3 Cluster", providerId: "ollama", status: "DEGRADED", quota: "Unlimited", used: "4,500,000", model: "llama-3-70b-instruct", latency: "310ms" }
  ]);

  return (
    <div className="page-view">
      {/* KPI Stats Header */}
      <div className="grid-4" style={{ marginBottom: "24px" }}>
        <div className="kpi-card">
          <div className="kpi-icon"><Cpu size={22} /></div>
          <div className="kpi-value">4</div>
          <div className="kpi-label">Active AI Model Providers</div>
        </div>
        <div className="kpi-card kpi-purple">
          <div className="kpi-icon" style={{ background: "#f3e8ff", color: "#8b5cf6" }}><Zap size={22} /></div>
          <div className="kpi-value">38.75M</div>
          <div className="kpi-label">Monthly Tokens Consumed</div>
        </div>
        <div className="kpi-card kpi-success">
          <div className="kpi-icon" style={{ background: "var(--success-tint)", color: "var(--success)" }}><ShieldCheck size={22} /></div>
          <div className="kpi-value">99.98%</div>
          <div className="kpi-label">LLM Gateway Uptime</div>
        </div>
        <div className="kpi-card kpi-warning">
          <div className="kpi-icon" style={{ background: "var(--warning-tint)", color: "var(--warning)" }}><Activity size={22} /></div>
          <div className="kpi-value">160ms</div>
          <div className="kpi-label">Average API Latency</div>
        </div>
      </div>

      {/* Model Providers Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">National LLM Model Routing & Key Vault</h3>
            <p className="card-subtitle">Governing AI provider access, rate limits, token budgets, and automated fallback routing</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => alert("Provider Key Vault configuration launched.")}>
            <Key size={14} /> Configure Key Vault
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Provider Name</th>
                <th>Provider ID</th>
                <th>Primary Model</th>
                <th>Monthly Token Quota</th>
                <th>Tokens Used</th>
                <th>Latency</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {providers.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "11.5px" }}>{p.providerId}</td>
                  <td><span className="badge badge-primary">{p.model}</span></td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>{p.quota}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{p.used}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "11.5px" }}>{p.latency}</td>
                  <td>
                    <span className={`badge ${p.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => alert(`Testing live latency ping for ${p.name}... Ping result: ${p.latency}`)}>
                      Ping API
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Video, Send } from 'lucide-react';

export const LiveClassroomView = () => {
  const { heartbeatPing, traineeHours } = useApp();
  const [messages, setMessages] = useState([
    { sender: "Usman Tariq", text: "Will model quantization affect inference latency on low-resource edge devices?", isTrainer: false },
    { sender: "Dr. Zeeshan (Trainer)", text: "Yes, Int8 quantization reduces memory bandwidth usage by ~4x with minimal accuracy drop.", isTrainer: true }
  ]);
  const [inputMsg, setInputMsg] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    setMessages(prev => [...prev, { sender: "Fatima Khan (You)", text: inputMsg, isTrainer: false }]);
    setInputMsg("");
  };

  return (
    <div className="page-view">
      <div className="grid-12">
        <div className="col-span-8">
          <div className="video-wrapper">
            <div className="video-overlay-badge">
              <span className="pulse-dot"></span>
              <span>NUST Cohort 04 — Live Webinar</span>
            </div>

            <div style={{ textAlign: "center", color: "#ffffff" }}>
              <Video size={64} style={{ color: "#60a5fa", margin: "0 auto 12px auto" }} />
              <h3 style={{ fontFamily: "var(--font-headline)", fontSize: "20px", fontWeight: 700 }}>
                Live Session: Scalable MLOps Architecture
              </h3>
              <p style={{ color: "#94a3b8", fontSize: "13px" }}>Instructor: Dr. Zeeshan Haider (NUST)</p>
            </div>

            <div className="video-overlay-telemetry">
              <div>WebSocket Telemetry: <strong style={{ color: "#4ade80" }}>Active (Ping #{heartbeatPing})</strong></div>
              <div>Accumulated Contact Hours: <strong>{traineeHours.toFixed(1)} hrs</strong></div>
            </div>
          </div>
        </div>

        <div className="col-span-4">
          <div className="card" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <div className="card-header">
              <h4 className="card-title">Live Q&A Chat</h4>
              <span className="badge badge-success">480 Online</span>
            </div>

            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", maxHeight: "320px" }}>
              {messages.map((m, idx) => (
                <div key={idx} style={{ background: m.isTrainer ? "var(--primary-tint)" : "var(--surface-dim)", padding: "8px 12px", borderRadius: "var(--radius-md)" }}>
                  <strong style={{ fontSize: "12px", color: m.isTrainer ? "var(--primary-dark)" : "var(--primary)" }}>{m.sender}:</strong>
                  <p style={{ fontSize: "12px", color: "var(--text-main)", marginTop: "2px" }}>{m.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSend} style={{ marginTop: "14px", display: "flex", gap: "8px" }}>
              <input
                type="text"
                className="form-control"
                placeholder="Ask a question..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

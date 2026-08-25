import React, { useState, useEffect } from 'react';
import { Video, Send, Users, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { apiService } from '../services/api';

export const LiveClassroomView = () => {
  const [messages, setMessages] = useState([
    { id: "m1", sender: "Fatima Khan", role: "Trainee", text: "Dr. Zeeshan, can you clarify how Int8 quantization affects model accuracy in edge deployment?", time: "10:14 AM" },
    { id: "m2", sender: "Dr. Zeeshan Haider", role: "Trainer", text: "Excellent question Fatima! Int8 quantization typically incurs < 1% accuracy drop if post-training calibration is performed correctly.", time: "10:16 AM" }
  ]);
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    const fetchChat = async () => {
      const res = await apiService.getChatMessages();
      if (res && res.success && res.data.length > 0) {
        setMessages(res.data.map(m => ({
          id: m._id,
          sender: m.sender,
          role: m.role,
          text: m.text,
          time: m.timestamp || "10:20 AM"
        })));
      }
    };
    fetchChat();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const newMsg = {
      sender: "Fatima Khan",
      role: "Trainee",
      text: inputText.trim()
    };

    setMessages(prev => [...prev, { ...newMsg, id: Date.now().toString(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setInputText("");

    await apiService.sendChatMessage(newMsg);
  };

  return (
    <div className="page-view">
      <div className="grid-12">
        {/* Video Player */}
        <div className="col-span-8">
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: "#0f172a", height: "420px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "#ffffff", position: "relative" }}>
              <div className="badge badge-error" style={{ position: "absolute", top: "16px", left: "16px" }}>
                🔴 LIVE TELEMETRY STREAMING
              </div>
              <div className="badge badge-neutral" style={{ position: "absolute", top: "16px", right: "16px" }}>
                WebSocket Ping 60s Active
              </div>

              <Video size={56} style={{ color: "var(--primary-light)", marginBottom: "16px" }} />
              <h3 style={{ fontFamily: "var(--font-headline)", fontSize: "18px", fontWeight: 700 }}>
                Track 1: Applied MLOps & LLM Orchestration
              </h3>
              <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px" }}>
                Cohort NUST-MLOps-Batch-04 — Lead Trainer: Dr. Zeeshan Haider
              </p>
            </div>
            <div style={{ padding: "16px", background: "var(--surface-card)" }}>
              <h4 style={{ fontWeight: 700 }}>Module 4: Quantization, TensorRT & Model Serving</h4>
              <p style={{ fontSize: "12px", color: "var(--text-subtle)", marginTop: "4px" }}>
                Live contact hours verification ping automatically logged every 60 seconds to satisfy the 24h requirement.
              </p>
            </div>
          </div>
        </div>

        {/* Live Q&A Chat */}
        <div className="col-span-4">
          <div className="card" style={{ height: "510px", display: "flex", flexDirection: "column" }}>
            <div className="card-header">
              <div>
                <h4 className="card-title">Live Q&A Classroom Chat</h4>
                <p className="card-subtitle">Moderated Trainee & Trainer Discussion</p>
              </div>
              <span className="badge badge-primary">242 Active</span>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {messages.map(msg => (
                <div key={msg.id} style={{ background: msg.role === 'Trainer' ? 'var(--primary-tint)' : 'var(--surface-dim)', padding: "10px", borderRadius: "var(--radius-md)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                    <strong style={{ color: msg.role === 'Trainer' ? 'var(--primary)' : 'var(--text-main)' }}>
                      {msg.sender} {msg.role === 'Trainer' && '(Lead Trainer)'}
                    </strong>
                    <span style={{ color: "var(--text-subtle)" }}>{msg.time}</span>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-main)", margin: 0 }}>{msg.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "8px", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid var(--border-subtle)" }}>
              <input
                type="text"
                className="form-control"
                placeholder="Ask a question..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { BookOpen, Plus, Search, CheckCircle } from 'lucide-react';

export const QuestionBankView = () => {
  const [questions] = useState([
    { id: "q1", track: "Track 1: Applied MLOps", type: "MCQ", title: "What is the primary benefit of Int8 model quantization in edge deployment?", difficulty: "MEDIUM", points: 10 },
    { id: "q2", track: "Track 1: Applied MLOps", type: "CODE", title: "Write a PyTorch function to apply gradient clipping before optimizer step.", difficulty: "HARD", points: 20 },
    { id: "q3", track: "Track 4: Mid & C-Level Executives", type: "MCQ", title: "Which statutory framework regulates national data privacy in Pakistan public sector AI?", difficulty: "EASY", points: 10 },
    { id: "q4", track: "Track 8: Startup Founders", type: "MCQ", title: "In Retrieval-Augmented Generation (RAG), what vector database index optimizes similarity search latency?", difficulty: "HARD", points: 15 }
  ]);

  return (
    <div className="page-view">
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">National AI Question Bank & Examination Repository</h3>
            <p className="card-subtitle">Audited assessment items aligned with Level 1, Level 2, and Level 3 competency standards</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => alert("Question Authoring Wizard launched.")}>
            <Plus size={14} /> Add New Question Item
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item Title / Prompt</th>
                <th>Track Alignment</th>
                <th>Type</th>
                <th>Difficulty</th>
                <th>Points</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {questions.map(q => (
                <tr key={q.id}>
                  <td><strong>{q.title}</strong></td>
                  <td><span className="badge badge-neutral">{q.track}</span></td>
                  <td><span className="badge badge-primary">{q.type}</span></td>
                  <td>
                    <span className={`badge ${q.difficulty === 'HARD' ? 'badge-error' : q.difficulty === 'MEDIUM' ? 'badge-warning' : 'badge-success'}`}>
                      {q.difficulty}
                    </span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{q.points} pts</td>
                  <td><span className="badge badge-success">Approved</span></td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => alert(`Inspecting item ${q.id}: ${q.title}`)}>
                      Inspect
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

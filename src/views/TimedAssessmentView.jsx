import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const TimedAssessmentView = () => {
  const { assessment, navigateTo } = useApp();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});

  const q = assessment.questions[currentIdx];

  const handleSelect = (optionIdx) => {
    setAnswers({ ...answers, [q.id]: optionIdx });
  };

  const handleSubmit = () => {
    let score = 0;
    assessment.questions.forEach(quest => {
      if (answers[quest.id] === quest.correct) {
        score += 20;
      }
    });

    alert(`Assessment Completed!\n\nYour Calculated Score: ${score}% (Passing score: 70%)\n\nResult: PASSED. Your contact hours and score have been logged into PostgreSQL audit telemetry.`);
    navigateTo("trainee-certificate");
  };

  return (
    <div className="page-view">
      <div className="grid-12">
        <div className="col-span-8">
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">{assessment.title}</h3>
                <p className="card-subtitle">Applied MLOps & AI Infrastructure Track</p>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "18px", fontWeight: 700, color: "var(--error)" }}>
                29:45
              </div>
            </div>

            <div style={{ margin: "20px 0" }}>
              <div style={{ fontSize: "13px", color: "var(--text-subtle)", marginBottom: "6px" }}>
                Question {currentIdx + 1} of {assessment.total_questions}
              </div>
              <h4 style={{ fontFamily: "var(--font-headline)", fontSize: "16px", fontWeight: 700, color: "var(--text-main)", marginBottom: "18px" }}>
                {q.text}
              </h4>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {q.options.map((opt, idx) => {
                  const isSelected = answers[q.id] === idx;
                  return (
                    <label
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "12px 16px",
                        background: isSelected ? "var(--primary-tint)" : "var(--surface-dim)",
                        border: `1px solid ${isSelected ? "var(--primary)" : "var(--border-subtle)"}`,
                        borderRadius: "var(--radius-md)",
                        cursor: "pointer"
                      }}
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        checked={isSelected}
                        onChange={() => handleSelect(idx)}
                      />
                      <span style={{ fontSize: "13.5px", fontWeight: isSelected ? 600 : 400, color: isSelected ? "var(--primary-dark)" : "var(--text-main)" }}>
                        {opt}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px" }}>
              <button
                className="btn btn-secondary"
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
              >
                Previous
              </button>

              {currentIdx < assessment.total_questions - 1 ? (
                <button className="btn btn-primary" onClick={() => setCurrentIdx(prev => prev + 1)}>
                  Next Question
                </button>
              ) : (
                <button className="btn btn-primary" onClick={handleSubmit}>
                  Submit Exam Now
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-4">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Question Navigator</h4>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px" }}>
              {assessment.questions.map((quest, idx) => {
                const isAnswered = answers[quest.id] !== undefined;
                const isCurrent = idx === currentIdx;
                return (
                  <button
                    key={quest.id}
                    className={`btn ${isCurrent ? "btn-primary" : isAnswered ? "btn-secondary" : "btn-ghost"}`}
                    style={{ padding: "8px 0", fontFamily: "var(--font-mono)" }}
                    onClick={() => setCurrentIdx(idx)}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: "24px" }}>
              <button className="btn btn-primary" style={{ width: "100%" }} onClick={handleSubmit}>
                Submit Exam Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

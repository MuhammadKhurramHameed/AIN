import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, CheckCircle, X, HelpCircle, Code, ListCheck, Eye } from 'lucide-react';
import { apiService } from '../services/api';

export const QuestionBankView = () => {
  const [questions, setQuestions] = useState([
    { id: "q1", trackNumber: 1, track: "Track 1: Applied MLOps", type: "MCQ", title: "What is the primary benefit of Int8 model quantization in edge deployment?", difficulty: "MEDIUM", points: 10, options: ["Increases GPU power consumption", "Reduces model memory footprint by ~4x with minimal accuracy loss", "Requires 100GB extra RAM", "Eliminates need for neural networks"], correctAnswer: "Reduces model memory footprint by ~4x with minimal accuracy loss", explanation: "Int8 quantization converts 32-bit floating point weights to 8-bit integers, yielding ~4x memory savings." },
    { id: "q2", trackNumber: 1, track: "Track 1: Applied MLOps", type: "CODE", title: "Write a PyTorch function to apply gradient clipping before optimizer step.", difficulty: "HARD", points: 20, options: [], correctAnswer: "torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)", explanation: "clip_grad_norm_ prevents exploding gradients during backpropagation." },
    { id: "q3", trackNumber: 4, track: "Track 4: Mid & C-Level Executives", type: "MCQ", title: "Which statutory framework regulates national data privacy in Pakistan public sector AI?", difficulty: "EASY", points: 10, options: ["MoITT National AI Policy 2026", "EU GDPR", "HIPAA", "ISO 9001"], correctAnswer: "MoITT National AI Policy 2026", explanation: "MoITT National AI Policy governs data privacy and statutory quota compliance." },
    { id: "q4", trackNumber: 8, track: "Track 8: Startup Founders", type: "MCQ", title: "In Retrieval-Augmented Generation (RAG), what vector database index optimizes similarity search latency?", difficulty: "HARD", points: 15, options: ["HNSW (Hierarchical Navigable Small World)", "B-Tree Index", "Linear Scan", "MD5 Hash Table"], correctAnswer: "HNSW (Hierarchical Navigable Small World)", explanation: "HNSW builds multi-layer graph structures for sub-linear similarity search." }
  ]);

  const [search, setSearch] = useState("");
  const [trackFilter, setTrackFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const [showAddModal, setShowAddModal] = useState(false);
  const [inspectQuestion, setInspectQuestion] = useState(null);

  const [form, setForm] = useState({
    title: '',
    trackNumber: 1,
    type: 'MCQ',
    difficulty: 'MEDIUM',
    points: 10,
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: '',
    explanation: ''
  });

  useEffect(() => {
    const loadQuestions = async () => {
      const res = await apiService.getQuestions();
      if (res && res.success && res.data.length > 0) {
        setQuestions(res.data.map(q => ({
          id: q._id,
          trackNumber: q.trackNumber || 1,
          track: `Track ${q.trackNumber || 1}`,
          type: q.type || 'MCQ',
          title: q.title,
          difficulty: q.difficulty || 'MEDIUM',
          points: q.points || 10,
          options: q.options || [],
          correctAnswer: q.correctAnswer || '',
          explanation: q.explanation || ''
        })));
      }
    };
    loadQuestions();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const options = form.type === 'MCQ' ? [form.optionA, form.optionB, form.optionC, form.optionD].filter(Boolean) : [];
    
    const newQ = {
      title: form.title,
      trackNumber: Number(form.trackNumber),
      track: `Track ${form.trackNumber}`,
      type: form.type,
      difficulty: form.difficulty,
      points: Number(form.points),
      options,
      correctAnswer: form.correctAnswer || (options[0] || ''),
      explanation: form.explanation
    };

    const res = await apiService.addQuestion(newQ);
    const savedQ = { ...newQ, id: res && res.success ? res.data._id : Date.now().toString() };
    setQuestions(prev => [savedQ, ...prev]);

    alert(`Question Item Created & Saved to Repository!\n\nTitle: ${form.title}\nTrack: Track ${form.trackNumber}\nDifficulty: ${form.difficulty} (${form.points} pts)`);
    setShowAddModal(false);
    setForm({
      title: '',
      trackNumber: 1,
      type: 'MCQ',
      difficulty: 'MEDIUM',
      points: 10,
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: '',
      explanation: ''
    });
  };

  const filteredQuestions = questions.filter(q => {
    const matchesTrack = trackFilter === "ALL" || q.trackNumber === Number(trackFilter);
    const matchesType = typeFilter === "ALL" || q.type === typeFilter;
    const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase());
    return matchesTrack && matchesType && matchesSearch;
  });

  return (
    <div className="page-view">
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">National AI Question Bank & Examination Repository</h3>
            <p className="card-subtitle">Audited assessment items aligned with Level 1, Level 2, and Level 3 competency standards</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
            <Plus size={14} /> Add New Question Item
          </button>
        </div>

        {/* Filter Controls */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search Question Statements / Keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-control form-select"
            style={{ width: "200px" }}
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value)}
          >
            <option value="ALL">All Tracks (1-9)</option>
            <option value="1">Track 1: Applied MLOps</option>
            <option value="2">Track 2: Teaching Professionals</option>
            <option value="3">Track 3: Sectoral Professionals</option>
            <option value="4">Track 4: C-Level Executives</option>
            <option value="5">Track 5: Govt Public Servants</option>
            <option value="8">Track 8: Startup Founders</option>
          </select>
          <select
            className="form-control form-select"
            style={{ width: "160px" }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="ALL">All Item Types</option>
            <option value="MCQ">MCQ</option>
            <option value="CODE">CODE</option>
            <option value="SHORT_ANSWER">SHORT ANSWER</option>
          </select>
        </div>

        {/* Question Items Data Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item Prompt / Title</th>
                <th>Track Alignment</th>
                <th>Type</th>
                <th>Difficulty</th>
                <th>Points</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuestions.map(q => (
                <tr key={q.id}>
                  <td><strong>{q.title}</strong></td>
                  <td><span className="badge badge-neutral">Track {q.trackNumber}</span></td>
                  <td>
                    <span className={`badge ${q.type === 'CODE' ? 'badge-purple' : 'badge-primary'}`}>
                      {q.type}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${q.difficulty === 'HARD' ? 'badge-error' : q.difficulty === 'MEDIUM' ? 'badge-warning' : 'badge-success'}`}>
                      {q.difficulty}
                    </span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{q.points} pts</td>
                  <td><span className="badge badge-success">Approved</span></td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => setInspectQuestion(q)}>
                      <Eye size={13} /> Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD NEW QUESTION ITEM AUTHORING WIZARD */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="modal-backdrop" style={{ backdropFilter: "blur(6px)" }}>
          <div className="modal-card" style={{ maxWidth: "680px" }}>
            <div className="modal-header">
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <BookOpen size={22} style={{ color: "var(--primary)" }} />
                <div>
                  <h4 className="card-title">Author New Examination Item</h4>
                  <p className="card-subtitle">Audited assessment item creation aligned with MoITT taxonomy</p>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Target Audience Track *</label>
                    <select
                      className="form-control form-select"
                      required
                      value={form.trackNumber}
                      onChange={(e) => setForm({ ...form, trackNumber: Number(e.target.value) })}
                    >
                      <option value={1}>Track 1: Applied MLOps (Students)</option>
                      <option value={2}>Track 2: Teaching Professionals</option>
                      <option value={3}>Track 3: Sectoral Professionals</option>
                      <option value={4}>Track 4: Mid & C-Level Executives</option>
                      <option value={5}>Track 5: Govt Public Servants</option>
                      <option value={6}>Track 6: Secretarial Staff</option>
                      <option value={7}>Track 7: General Workforce</option>
                      <option value={8}>Track 8: Startup Founders</option>
                      <option value={9}>Track 9: Freelancers & Remote</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Question Item Type *</label>
                    <select
                      className="form-control form-select"
                      required
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                    >
                      <option value="MCQ">Multiple Choice Question (MCQ)</option>
                      <option value="CODE">Programming & Code Evaluation</option>
                      <option value="SHORT_ANSWER">Short Answer & Rubric Evaluation</option>
                    </select>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Difficulty Level *</label>
                    <select
                      className="form-control form-select"
                      required
                      value={form.difficulty}
                      onChange={(e) => setForm({
                        ...form,
                        difficulty: e.target.value,
                        points: e.target.value === 'HARD' ? 20 : e.target.value === 'MEDIUM' ? 10 : 5
                      })}
                    >
                      <option value="EASY">EASY (5 pts)</option>
                      <option value="MEDIUM">MEDIUM (10 pts)</option>
                      <option value="HARD">HARD (20 pts)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Difficulty Score Points *</label>
                    <input
                      type="number"
                      className="form-control"
                      required
                      value={form.points}
                      onChange={(e) => setForm({ ...form, points: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Question Item Statement / Prompt *</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="e.g. What is the primary benefit of Int8 model quantization in edge deployment?"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>

                {/* MCQ Options Authoring */}
                {form.type === 'MCQ' && (
                  <div style={{ background: "var(--surface-dim)", padding: "14px", borderRadius: "var(--radius-md)", marginBottom: "16px" }}>
                    <h5 style={{ fontSize: "12.5px", fontWeight: 700, marginBottom: "10px" }}>MCQ Choice Options & Correct Answer</h5>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Option A *</label>
                        <input type="text" className="form-control" required value={form.optionA} onChange={(e) => setForm({ ...form, optionA: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Option B *</label>
                        <input type="text" className="form-control" required value={form.optionB} onChange={(e) => setForm({ ...form, optionB: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Option C</label>
                        <input type="text" className="form-control" value={form.optionC} onChange={(e) => setForm({ ...form, optionC: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Option D</label>
                        <input type="text" className="form-control" value={form.optionD} onChange={(e) => setForm({ ...form, optionD: e.target.value })} />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Correct Answer Statement *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Paste the exact correct option text"
                        required
                        value={form.correctAnswer}
                        onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* Code / Short Answer Prompt */}
                {form.type === 'CODE' && (
                  <div className="form-group">
                    <label className="form-label">Starter Code / Test Case Reference *</label>
                    <textarea
                      className="form-control code-box"
                      rows={4}
                      placeholder="def clip_gradients(model):\n    # TODO: Implement gradient clipping\n    pass"
                      value={form.correctAnswer}
                      onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Pedagogical Rationale / Answer Explanation</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Explanation shown to trainees after assessment evaluation..."
                    value={form.explanation}
                    onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <CheckCircle size={16} /> Save Question to Repository
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ITEM INSPECTION MODAL */}
      {/* ========================================================================= */}
      {inspectQuestion && (
        <div className="modal-backdrop" style={{ backdropFilter: "blur(6px)" }}>
          <div className="modal-card" style={{ maxWidth: "620px" }}>
            <div className="modal-header">
              <div>
                <span className="badge badge-primary" style={{ marginBottom: "4px" }}>Track {inspectQuestion.trackNumber}</span>
                <h4 className="card-title">{inspectQuestion.title}</h4>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setInspectQuestion(null)}><X size={18} /></button>
            </div>

            <div className="modal-body">
              <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                <span className="badge badge-neutral">Type: {inspectQuestion.type}</span>
                <span className={`badge ${inspectQuestion.difficulty === 'HARD' ? 'badge-error' : 'badge-warning'}`}>
                  Difficulty: {inspectQuestion.difficulty}
                </span>
                <span className="badge badge-success">{inspectQuestion.points} Points</span>
              </div>

              {inspectQuestion.options && inspectQuestion.options.length > 0 && (
                <div style={{ background: "var(--surface-dim)", padding: "14px", borderRadius: "var(--radius-md)", marginBottom: "16px" }}>
                  <strong style={{ fontSize: "12px", color: "var(--text-subtle)" }}>Choice Options:</strong>
                  <ul style={{ marginTop: "8px", paddingLeft: "20px", fontSize: "13px" }}>
                    {inspectQuestion.options.map((opt, i) => (
                      <li key={i} style={{ fontWeight: opt === inspectQuestion.correctAnswer ? 700 : 400, color: opt === inspectQuestion.correctAnswer ? 'var(--success)' : 'var(--text-main)' }}>
                        {opt} {opt === inspectQuestion.correctAnswer && '✓ (Correct)'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {inspectQuestion.explanation && (
                <div style={{ background: "var(--primary-tint)", padding: "12px", borderRadius: "var(--radius-md)" }}>
                  <strong style={{ fontSize: "12px", color: "var(--primary)" }}>Pedagogical Rationale:</strong>
                  <p style={{ fontSize: "12px", color: "var(--text-main)", marginTop: "4px", margin: 0 }}>
                    {inspectQuestion.explanation}
                  </p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setInspectQuestion(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

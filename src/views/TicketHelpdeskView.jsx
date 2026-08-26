import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Ticket, 
  Plus, 
  Send, 
  Clock, 
  CheckCircle2, 
  MessageSquare, 
  Award, 
  BookOpen, 
  Settings,
  Building2,
  FileCode,
  ShieldCheck,
  User,
  Users,
  Search,
  Lock,
  AlertTriangle,
  Printer,
  Paperclip,
  Check,
  RefreshCw,
  Sparkles
} from 'lucide-react';

const CANNED_RESPONSES = [
  {
    category: "TECHNICAL",
    label: "🛠️ CDN Video Stream Cache Purge",
    text: "Our infrastructure team has re-encoded the video to 720p/480p adaptive bitrate on the local PTCL CDN edge. Please clear your browser cache and try again."
  },
  {
    category: "CERTIFICATE",
    label: "📜 NADRA CNIC Verification Passed",
    text: "Citizen record verified against NADRA database. Digital Certificate re-signed with Ed25519 root private key and updated in your portal."
  },
  {
    category: "COURSE_QUERY",
    label: "📚 XGBoost Imbalance Guideline",
    text: "For extreme class imbalance (e.g. 1:99 default ratio), configure `scale_pos_weight = count(negative)/count(positive)` in XGBoost and evaluate with PR-AUC rather than overall accuracy."
  },
  {
    category: "CONSORTIUM_OPS",
    label: "🏛️ Capacity Expansion Approved",
    text: "MoITT National AI Steering Committee has reviewed and approved your cohort capacity expansion. Additional Cloud GPU hours have been allocated to your partner quota."
  },
  {
    category: "CONTENT_REVIEW",
    label: "✨ Bloom Taxonomy Verification",
    text: "Curriculum assessment review completed. Questions aligned with Level 2 Applied Bloom Taxonomy standards. Module is cleared for production release."
  },
  {
    category: "GENERAL",
    label: "ℹ️ GitHub Repository Submission",
    text: "Please push your latest project commits to a public GitHub repository and reply to this ticket with the repository URL so the review team can evaluate your submission."
  }
];

const AVAILABLE_ASSIGNEES = [
  {
    id: "usr-admin-01",
    name: "Dr. Kamran Siddiqui",
    role: "SUPER_ADMIN",
    email: "director.naiai@moitt.gov.pk",
    desk: "MoITT Central Helpdesk & Infrastructure Desk"
  },
  {
    id: "usr-trainer-04",
    name: "Dr. Zeeshan Haider",
    role: "TRAINER",
    email: "z.haider@nust.edu.pk",
    desk: "Lead AI Trainer & Academic SME Desk"
  },
  {
    id: "usr-auditor-02",
    name: "Engr. Ayesha Malik",
    role: "MOITT_AUDITOR",
    email: "ayesha.malik@ain.gov.pk",
    desk: "AIN Credential Verification Desk"
  },
  {
    id: "usr-partner-03",
    name: "Prof. Tariq Hassan",
    role: "CONSORTIUM_ADMIN",
    email: "tariq.hassan@nust.edu.pk",
    desk: "Consortium Operations Liaison"
  },
  {
    id: "usr-reviewer-05",
    name: "Dr. Sara Ahmed",
    role: "CONTENT_REVIEWER",
    email: "sara.ahmed@naiai.gov.pk",
    desk: "Curriculum & Content Quality Desk"
  }
];

export const TicketHelpdeskView = () => {
  const { 
    tickets, 
    createTicket, 
    replyToTicket, 
    updateTicketStatus, 
    assignTicket, 
    updateTicketPriority,
    currentRole, 
    currentUser,
    tracks 
  } = useApp();

  const isStaff = ["SUPER_ADMIN", "MOITT_AUDITOR", "TRAINER", "CONSORTIUM_ADMIN", "CONTENT_REVIEWER"].includes(currentRole);

  // Active Navigation Tab
  const defaultTab = currentRole === "TRAINEE" ? "MY_TICKETS" : (currentRole === "TRAINER" ? "ASSIGNED_TO_ME" : "ALL");
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [filterRole, setFilterRole] = useState("ALL");

  // Selection
  const [selectedTicketId, setSelectedTicketId] = useState(tickets[0]?.id || null);

  // Form & Modals State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [resolutionInput, setResolutionInput] = useState("");

  // Reply Composer State
  const [replyText, setReplyText] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [attachmentInput, setAttachmentInput] = useState("");
  const [showAttachmentField, setShowAttachmentField] = useState(false);

  // New Ticket Form State
  const [newTicketForm, setNewTicketForm] = useState({
    title: "",
    category: currentRole === "TRAINER" ? "COURSE_QUERY" : "TECHNICAL",
    priority: "MEDIUM",
    related_course: "Track 1: Students & Fresh Graduates",
    related_cohort: "NUST-MLOps-Batch-04",
    description: "",
    attachment_url: ""
  });

  // Calculate High-Level Ticket KPIs
  const kpis = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === "OPEN").length;
    const inProgress = tickets.filter(t => t.status === "IN_PROGRESS" || t.status === "UNDER_REVIEW").length;
    const resolved = tickets.filter(t => t.status === "RESOLVED" || t.status === "CLOSED").length;
    const urgent = tickets.filter(t => (t.priority === "URGENT" || t.priority === "HIGH") && t.status !== "RESOLVED" && t.status !== "CLOSED").length;
    const rate = total > 0 ? Math.round((resolved / total) * 100) : 100;
    return { total, open, inProgress, resolved, urgent, rate };
  }, [tickets]);

  // Filter Tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      // Tab Filtering
      if (activeTab === "MY_TICKETS") {
        if (t.created_by?.id !== currentUser?.user_id && t.created_by?.role !== currentRole && t.created_by?.email !== currentUser?.email) {
          return false;
        }
      } else if (activeTab === "ASSIGNED_TO_ME") {
        if (t.assigned_to?.id !== currentUser?.user_id && t.assigned_to?.role !== currentRole) {
          return false;
        }
      } else if (activeTab === "URGENT_QUEUE") {
        if (t.priority !== "URGENT" && t.priority !== "HIGH") return false;
        if (t.status === "RESOLVED" || t.status === "CLOSED") return false;
      }

      // Dropdown Filters
      if (filterCategory !== "ALL" && t.category !== filterCategory) return false;
      if (filterStatus !== "ALL" && t.status !== filterStatus) return false;
      if (filterPriority !== "ALL" && t.priority !== filterPriority) return false;
      if (filterRole !== "ALL" && t.created_by?.role !== filterRole) return false;

      // Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = t.id?.toLowerCase().includes(q);
        const matchTitle = t.title?.toLowerCase().includes(q);
        const matchDesc = t.description?.toLowerCase().includes(q) || t.messages?.[0]?.text?.toLowerCase().includes(q);
        const matchUser = (t.created_by?.name || "Fatima Khan").toLowerCase().includes(q) || t.created_by?.email?.toLowerCase().includes(q);
        const matchCourse = t.related_course?.toLowerCase().includes(q);
        if (!matchId && !matchTitle && !matchDesc && !matchUser && !matchCourse) {
          return false;
        }
      }

      return true;
    });
  }, [tickets, activeTab, filterCategory, filterStatus, filterPriority, filterRole, searchQuery, currentUser, currentRole]);

  // Keep selected ticket valid
  const selectedTicket = tickets.find(t => t.id === selectedTicketId) || filteredTickets[0] || tickets[0];

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newTicketForm.title.trim() || !newTicketForm.description.trim()) return;

    const created = createTicket(newTicketForm);
    setSelectedTicketId(created.id);
    setShowCreateModal(false);
    setNewTicketForm({
      title: "",
      category: currentRole === "TRAINER" ? "COURSE_QUERY" : "TECHNICAL",
      priority: "MEDIUM",
      related_course: "Track 1: Students & Fresh Graduates",
      related_cohort: "NUST-MLOps-Batch-04",
      description: "",
      attachment_url: ""
    });
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    replyToTicket(selectedTicket.id, replyText, isInternalNote, attachmentInput);
    setReplyText("");
    setAttachmentInput("");
    setShowAttachmentField(false);
    setIsInternalNote(false);
  };

  const handleResolveSubmit = (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    updateTicketStatus(selectedTicket.id, "RESOLVED", resolutionInput || "Resolved by authorized support desk.");
    setShowResolveModal(false);
    setResolutionInput("");
  };

  const applyCannedResponse = (text) => {
    setReplyText(prev => prev ? `${prev}\n\n${text}` : text);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "TECHNICAL": return <Settings size={14} color="#3b82f6" />;
      case "COURSE_QUERY": return <BookOpen size={14} color="#f59e0b" />;
      case "CERTIFICATE": return <Award size={14} color="#10b981" />;
      case "CONSORTIUM_OPS": return <Building2 size={14} color="#8b5cf6" />;
      case "CONTENT_REVIEW": return <FileCode size={14} color="#ec4899" />;
      case "COMPLIANCE": return <ShieldCheck size={14} color="#06b6d4" />;
      default: return <MessageSquare size={14} color="#64748b" />;
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case "TECHNICAL": return "Technical / LMS";
      case "COURSE_QUERY": return "Course Academic";
      case "CERTIFICATE": return "Certificate Verification";
      case "CONSORTIUM_OPS": return "Consortium Operations";
      case "CONTENT_REVIEW": return "Content Review";
      case "COMPLIANCE": return "Compliance & Quotas";
      default: return "General Support";
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "URGENT": return <span className="badge badge-danger" style={{ fontWeight: 700, padding: "3px 8px" }}>⚡ URGENT</span>;
      case "HIGH": return <span className="badge badge-warning" style={{ fontWeight: 600, padding: "3px 8px" }}>HIGH</span>;
      case "MEDIUM": return <span className="badge badge-primary" style={{ fontWeight: 500, padding: "3px 8px" }}>MEDIUM</span>;
      default: return <span className="badge badge-neutral" style={{ padding: "3px 8px" }}>LOW</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "OPEN": return <span className="badge badge-warning" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><Clock size={11} /> OPEN</span>;
      case "IN_PROGRESS": return <span className="badge badge-primary" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><Clock size={11} /> IN PROGRESS</span>;
      case "UNDER_REVIEW": return <span className="badge badge-secondary" style={{ background: '#fdf2f8', color: '#9d174d' }}>UNDER REVIEW</span>;
      case "RESOLVED": return <span className="badge badge-success" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><CheckCircle2 size={11} /> RESOLVED</span>;
      case "CLOSED": return <span className="badge badge-neutral">CLOSED</span>;
      default: return <span className="badge badge-neutral">{status}</span>;
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "SUPER_ADMIN": return <span className="badge badge-danger" style={{ fontSize: '10px', fontWeight: 700 }}>SUPER ADMIN</span>;
      case "MOITT_AUDITOR": return <span className="badge badge-warning" style={{ fontSize: '10px', fontWeight: 700 }}>AUDITOR</span>;
      case "CONSORTIUM_ADMIN": return <span className="badge badge-primary" style={{ fontSize: '10px', fontWeight: 700 }}>CONSORTIUM</span>;
      case "TRAINER": return <span className="badge badge-success" style={{ fontSize: '10px', fontWeight: 700 }}>TRAINER SME</span>;
      case "CONTENT_REVIEWER": return <span className="badge badge-secondary" style={{ fontSize: '10px', background: '#fce7f3', color: '#be185d', fontWeight: 700 }}>CREATOR</span>;
      default: return <span className="badge badge-neutral" style={{ fontSize: '10px', fontWeight: 600 }}>TRAINEE</span>;
    }
  };

  const getRequesterName = (createdBy) => {
    if (createdBy && createdBy.name) return createdBy.name;
    if (createdBy && createdBy.role === "TRAINEE") return "Fatima Khan";
    if (createdBy && createdBy.role === "TRAINER") return "Dr. Zeeshan Haider";
    if (createdBy && createdBy.role === "SUPER_ADMIN") return "Dr. Kamran Siddiqui";
    return currentUser?.name || "Fatima Khan";
  };

  return (
    <div className="page-view" style={{ width: "100%", padding: "20px" }}>
      
      {/* Premium Header Banner */}
      <div className="card" style={{ marginBottom: "20px", padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "var(--primary-tint)", border: "1px solid var(--primary-border)", padding: "4px 12px", borderRadius: "9999px", fontSize: "12px", color: "var(--primary-dark)", fontWeight: 700, marginBottom: "8px" }}>
              <Ticket size={14} color="var(--primary)" /> MoITT Enterprise Resolution Desk
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-main)", fontFamily: "var(--font-headline)", margin: "0 0 4px 0" }}>
              Universal Support &amp; Helpdesk Portal
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-subtle)", margin: 0, maxWidth: "780px" }}>
              Intelligent multi-stakeholder dispatch center for technical assistance, academic SME queries, credential verifications, and consortium operations.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {selectedTicket && (
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setShowPrintModal(true)}
                title="Print Audit Report"
              >
                <Printer size={15} /> Export Audit Log
              </button>
            )}
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
              style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, padding: "9px 18px" }}
            >
              <Plus size={16} /> Open Support Ticket
            </button>
          </div>
        </div>

        {/* 4 Clean Metric Cards */}
        <div className="grid-12" style={{ gap: "14px", marginTop: "20px" }}>
          <div className="col-span-3" style={{ background: "var(--surface-dim)", padding: "14px 18px", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11.5px", color: "var(--text-subtle)", fontWeight: 700, textTransform: "uppercase" }}>Total Support Inquiries</span>
              <Ticket size={16} color="var(--primary)" />
            </div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-main)", marginTop: "6px", fontFamily: "var(--font-headline)" }}>{kpis.total}</div>
          </div>

          <div className="col-span-3" style={{ background: "#fffbeb", padding: "14px 18px", borderRadius: "12px", border: "1px solid #fde68a" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11.5px", color: "#92400e", fontWeight: 700, textTransform: "uppercase" }}>Open Queue</span>
              <Clock size={16} color="#d97706" />
            </div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "#b45309", marginTop: "6px", fontFamily: "var(--font-headline)" }}>{kpis.open}</div>
          </div>

          <div className="col-span-3" style={{ background: "var(--primary-tint)", padding: "14px 18px", borderRadius: "12px", border: "1px solid var(--primary-border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11.5px", color: "var(--primary-dark)", fontWeight: 700, textTransform: "uppercase" }}>In Progress</span>
              <RefreshCw size={16} color="var(--primary)" />
            </div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--primary)", marginTop: "6px", fontFamily: "var(--font-headline)" }}>{kpis.inProgress}</div>
          </div>

          <div className="col-span-3" style={{ background: kpis.urgent > 0 ? "#fef2f2" : "#f0fdf4", padding: "14px 18px", borderRadius: "12px", border: kpis.urgent > 0 ? "1px solid #fecaca" : "1px solid #bbf7d0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11.5px", color: kpis.urgent > 0 ? "#991b1b" : "#166534", fontWeight: 700, textTransform: "uppercase" }}>
                {kpis.urgent > 0 ? "Urgent SLA Escalations" : "Resolution Rate"}
              </span>
              {kpis.urgent > 0 ? <AlertTriangle size={16} color="#dc2626" /> : <CheckCircle2 size={16} color="#16a34a" />}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "6px" }}>
              <div style={{ fontSize: "24px", fontWeight: 800, color: kpis.urgent > 0 ? "#dc2626" : "#15803d", fontFamily: "var(--font-headline)" }}>
                {kpis.urgent > 0 ? `${kpis.urgent} Pending` : `${kpis.rate}%`}
              </div>
              <span className={`badge ${kpis.urgent > 0 ? "badge-danger" : "badge-success"}`} style={{ fontSize: "10.5px" }}>
                {kpis.urgent > 0 ? "⚠️ Action Required" : "SLA Compliant"}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Segment Controls */}
        <div style={{ display: "flex", gap: "8px", marginTop: "20px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px", overflowX: "auto" }}>
          {isStaff && (
            <button 
              className={`btn btn-sm ${activeTab === "ALL" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setActiveTab("ALL")}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <Users size={14} /> All Tickets <span className="badge badge-neutral" style={{ marginLeft: "4px" }}>{tickets.length}</span>
            </button>
          )}

          {isStaff && (
            <button 
              className={`btn btn-sm ${activeTab === "ASSIGNED_TO_ME" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setActiveTab("ASSIGNED_TO_ME")}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <User size={14} /> Assigned to Desk <span className="badge badge-neutral" style={{ marginLeft: "4px" }}>{tickets.filter(t => t.assigned_to?.role === currentRole || t.assigned_to?.id === currentUser?.user_id).length}</span>
            </button>
          )}

          <button 
            className={`btn btn-sm ${activeTab === "MY_TICKETS" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTab("MY_TICKETS")}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Ticket size={14} /> My Raised Tickets <span className="badge badge-neutral" style={{ marginLeft: "4px" }}>{tickets.filter(t => t.created_by?.role === currentRole || t.created_by?.id === currentUser?.user_id).length}</span>
          </button>

          <button 
            className={`btn btn-sm ${activeTab === "URGENT_QUEUE" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTab("URGENT_QUEUE")}
            style={{ display: "flex", alignItems: "center", gap: "6px", color: activeTab === "URGENT_QUEUE" ? "#ffffff" : "#dc2626" }}
          >
            <AlertTriangle size={14} /> Urgent Escalations <span className="badge badge-danger" style={{ marginLeft: "4px" }}>{kpis.urgent}</span>
          </button>
        </div>

        {/* Clean Filter Toolbar */}
        <div style={{ display: "flex", gap: "10px", marginTop: "14px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
            <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)" }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: "36px", fontSize: "12.5px" }}
              placeholder="Search by Ticket ID (#TKT-...), title, student name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select 
            className="form-control form-select" 
            style={{ fontSize: "12px", width: "auto", minWidth: "150px" }}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            <option value="TECHNICAL">🛠️ Technical / LMS</option>
            <option value="COURSE_QUERY">📚 Academic / SME</option>
            <option value="CERTIFICATE">📜 Certificate Verification</option>
            <option value="CONSORTIUM_OPS">🏛️ Consortium Operations</option>
            <option value="CONTENT_REVIEW">✨ Content Quality</option>
            <option value="GENERAL">ℹ️ General Inquiry</option>
          </select>

          <select 
            className="form-control form-select" 
            style={{ fontSize: "12px", width: "auto", minWidth: "130px" }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select 
            className="form-control form-select" 
            style={{ fontSize: "12px", width: "auto", minWidth: "130px" }}
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">⚡ Urgent (4h SLA)</option>
            <option value="HIGH">High (12h SLA)</option>
            <option value="MEDIUM">Medium (24h SLA)</option>
            <option value="LOW">Low (48h SLA)</option>
          </select>

          {(searchQuery || filterCategory !== "ALL" || filterStatus !== "ALL" || filterPriority !== "ALL" || filterRole !== "ALL") && (
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSearchQuery("");
                setFilterCategory("ALL");
                setFilterStatus("ALL");
                setFilterPriority("ALL");
                setFilterRole("ALL");
              }}
              title="Reset all filters"
            >
              <RefreshCw size={13} /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace (Split View) */}
      <div className="grid-12" style={{ gap: "20px", alignItems: "flex-start" }}>
        
        {/* Left Column: Ticket Roster */}
        <div className="col-span-5">
          <div className="card" style={{ padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", paddingBottom: "10px", borderBottom: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-main)", textTransform: "uppercase" }}>
                Ticket Queue ({filteredTickets.length})
              </span>
              <span style={{ fontSize: "11px", color: "var(--text-subtle)" }}>
                Sorted by latest activity
              </span>
            </div>

            {filteredTickets.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-subtle)" }}>
                <Ticket size={36} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
                <p style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-main)" }}>No tickets found</p>
                <p style={{ fontSize: "12px", marginTop: "4px" }}>Try clearing your filters or click 'Open Support Ticket'.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "680px", overflowY: "auto", paddingRight: "4px" }}>
                {filteredTickets.map(t => {
                  const isSelected = selectedTicket?.id === t.id;
                  const messageCount = t.messages?.length || 1;
                  const hasInternalNote = t.messages?.some(m => m.is_internal_note || m.isInternalNote);
                  const requesterName = getRequesterName(t.created_by);

                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicketId(t.id)}
                      style={{
                        padding: "14px 16px",
                        borderRadius: "10px",
                        border: isSelected ? "2px solid #2563eb" : "1px solid var(--border-subtle)",
                        background: isSelected ? "rgba(37, 99, 235, 0.04)" : "var(--surface-card)",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        boxShadow: isSelected ? "0 2px 8px rgba(37, 99, 235, 0.12)" : "none"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 800, color: "var(--primary)" }}>
                            {t.id}
                          </span>
                          {getRoleBadge(t.created_by?.role)}
                        </div>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                          {getPriorityBadge(t.priority)}
                          {getStatusBadge(t.status)}
                        </div>
                      </div>

                      <h4 style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--text-main)", marginBottom: "6px", lineHeight: "1.4" }}>
                        {t.title}
                      </h4>

                      <div style={{ fontSize: "12px", color: "var(--text-subtle)", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                        <strong style={{ color: "var(--text-main)" }}>{requesterName}</strong>
                        <span>•</span>
                        <span style={{ fontSize: "11px" }}>{t.related_course || "National Initiative Track"}</span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11.5px", color: "var(--text-subtle)", borderTop: "1px solid var(--border-subtle)", paddingTop: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                          {getCategoryIcon(t.category)}
                          <span>{getCategoryLabel(t.category)}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {hasInternalNote && isStaff && (
                            <span title="Contains private staff notes" style={{ color: "#d97706", display: "flex", alignItems: "center", gap: "2px", fontSize: "11px" }}>
                              <Lock size={11} /> Note
                            </span>
                          )}
                          <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                            <MessageSquare size={11} /> {messageCount}
                          </span>
                          <span>{t.updated_at ? t.updated_at.slice(5) : (t.created_at ? t.created_at.slice(5) : "Just now")}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Ticket Workspace & Conversation */}
        <div className="col-span-7">
          {selectedTicket ? (
            <div className="card" style={{ padding: "24px" }}>
              
              {/* Header Details */}
              <div style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "18px", marginBottom: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px", flexWrap: "wrap" }}>
                      <span className="badge badge-primary" style={{ fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 800 }}>{selectedTicket.id}</span>
                      {getPriorityBadge(selectedTicket.priority)}
                      {getStatusBadge(selectedTicket.status)}
                      <span className="badge badge-neutral" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        {getCategoryIcon(selectedTicket.category)} {getCategoryLabel(selectedTicket.category)}
                      </span>
                    </div>
                    <h3 style={{ fontSize: "19px", fontWeight: 800, color: "var(--text-main)", margin: "4px 0", fontFamily: "var(--font-headline)" }}>
                      {selectedTicket.title}
                    </h3>
                  </div>

                  {/* Staff Management Action Controls */}
                  {isStaff ? (
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                      {selectedTicket.status !== "RESOLVED" && selectedTicket.status !== "CLOSED" ? (
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => setShowResolveModal(true)}
                          style={{ background: "#10b981", borderColor: "#10b981", fontWeight: 700 }}
                        >
                          <CheckCircle2 size={14} /> Resolve Ticket
                        </button>
                      ) : (
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => updateTicketStatus(selectedTicket.id, "OPEN", "")}
                        >
                          <RefreshCw size={14} /> Reopen Ticket
                        </button>
                      )}

                      <select
                        className="form-control form-select"
                        style={{ fontSize: "11.5px", padding: "5px 8px", width: "auto" }}
                        value={selectedTicket.priority}
                        onChange={(e) => updateTicketPriority(selectedTicket.id, e.target.value)}
                        title="Change Ticket Priority & SLA"
                      >
                        <option value="LOW">Priority: Low</option>
                        <option value="MEDIUM">Priority: Medium</option>
                        <option value="HIGH">Priority: High</option>
                        <option value="URGENT">Priority: Urgent</option>
                      </select>
                    </div>
                  ) : (
                    selectedTicket.status !== "RESOLVED" && selectedTicket.status !== "CLOSED" && (
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => updateTicketStatus(selectedTicket.id, "RESOLVED", "Marked resolved by trainee student.")}
                      >
                        <Check size={14} /> Mark Resolved
                      </button>
                    )
                  )}
                </div>

                {/* Responsive Stakeholder Metadata Box */}
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", 
                  gap: "14px", 
                  fontSize: "12px", 
                  background: "var(--surface-dim)", 
                  padding: "14px 16px", 
                  borderRadius: "10px", 
                  border: "1px solid var(--border-subtle)" 
                }}>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ color: "var(--text-subtle)", fontWeight: 600 }}>Raised By: </span>
                    <strong style={{ color: "var(--text-main)" }}>{getRequesterName(selectedTicket.created_by)}</strong> ({selectedTicket.created_by?.role || "TRAINEE"})
                    <div style={{ fontSize: "11px", color: "var(--text-subtle)", marginTop: "3px", wordBreak: "break-word" }}>
                      CNIC: {selectedTicket.created_by?.cnic || "35201-1234567-8"} | Email: {selectedTicket.created_by?.email || "trainee@moitt.gov.pk"}
                    </div>
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px", marginBottom: "3px", flexWrap: "wrap" }}>
                      <span style={{ color: "var(--text-subtle)", fontWeight: 600 }}>Assigned Desk:</span>
                      {isStaff && (
                        <select
                          className="form-control form-select"
                          style={{ fontSize: "11px", padding: "2px 6px", width: "auto" }}
                          value={selectedTicket.assigned_to?.id || ""}
                          onChange={(e) => {
                            const found = AVAILABLE_ASSIGNEES.find(a => a.id === e.target.value);
                            if (found) assignTicket(selectedTicket.id, found);
                          }}
                        >
                          {AVAILABLE_ASSIGNEES.map(a => (
                            <option key={a.id} value={a.id}>{a.name} ({a.role})</option>
                          ))}
                        </select>
                      )}
                    </div>
                    <strong style={{ color: "var(--primary)" }}>{selectedTicket.assigned_to?.name || "MoITT Central Helpdesk"}</strong>
                    <div style={{ fontSize: "11px", color: "var(--text-subtle)", marginTop: "2px" }}>{selectedTicket.assigned_to?.desk || selectedTicket.assigned_to?.role || "Central Support Desk"}</div>
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <span style={{ color: "var(--text-subtle)", fontWeight: 600 }}>Related Track / Cohort: </span>
                    <div style={{ fontWeight: 600, color: "var(--text-main)", marginTop: "2px" }}>{selectedTicket.related_course || "National Initiative Track"}</div>
                    {selectedTicket.related_cohort && <div style={{ fontSize: "11px", color: "var(--text-subtle)", marginTop: "2px" }}>Cohort: {selectedTicket.related_cohort}</div>}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                      <span style={{ color: "var(--text-subtle)", fontWeight: 600 }}>SLA Target: </span>
                      <span style={{ fontWeight: 700, color: selectedTicket.priority === "URGENT" ? "#dc2626" : "var(--primary)" }}>
                        {selectedTicket.sla_deadline || (selectedTicket.priority === "URGENT" ? "4 Hours" : "24 Hours")}
                      </span>
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-subtle)", marginTop: "3px" }}>
                      Created: {selectedTicket.created_at || "2026-08-22"} | Updated: {selectedTicket.updated_at || selectedTicket.created_at || "2026-08-22"}
                    </div>
                  </div>
                </div>

                {/* Resolution Summary Banner if Resolved */}
                {selectedTicket.resolution_note && (
                  <div style={{ marginTop: "14px", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "12px 16px", borderRadius: "10px", fontSize: "12.5px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#166534", fontWeight: 700, marginBottom: "4px" }}>
                      <CheckCircle2 size={16} /> Official Resolution Note:
                    </div>
                    <p style={{ color: "#14532d", lineHeight: "1.5", margin: 0 }}>{selectedTicket.resolution_note}</p>
                    {selectedTicket.resolved_at && (
                      <div style={{ fontSize: "11px", color: "#15803d", marginTop: "6px" }}>
                        Resolved on {selectedTicket.resolved_at}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Threaded Conversation Stream */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "400px", overflowY: "auto", paddingRight: "8px", marginBottom: "18px" }}>
                {selectedTicket.messages?.map((msg, idx) => {
                  const isCurrent = msg.role === currentRole;
                  const isInternal = msg.is_internal_note || msg.isInternalNote;

                  // Hide internal notes from Trainees
                  if (isInternal && currentRole === "TRAINEE") {
                    return null;
                  }

                  return (
                    <div 
                      key={msg.id || idx} 
                      style={{ 
                        display: "flex", 
                        flexDirection: "column",
                        alignSelf: isInternal ? "center" : (isCurrent ? "flex-end" : "flex-start"),
                        width: isInternal ? "100%" : "auto",
                        maxWidth: isInternal ? "100%" : "85%"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px", fontSize: "11px", color: "var(--text-subtle)", alignSelf: isCurrent && !isInternal ? "flex-end" : "flex-start" }}>
                        {isInternal && <Lock size={12} color="#d97706" />}
                        <strong style={{ color: "var(--text-main)" }}>{msg.sender || "Support Agent"}</strong>
                        {getRoleBadge(msg.role)}
                        <span>• {msg.timestamp || "Just now"}</span>
                      </div>

                      <div 
                        style={{ 
                          padding: "14px 18px", 
                          borderRadius: "12px", 
                          background: isInternal 
                            ? "#fffbeb" 
                            : (isCurrent ? "#2563eb" : "var(--surface-dim)"),
                          border: isInternal ? "1px dashed #f59e0b" : (isCurrent ? "none" : "1px solid var(--border-subtle)"),
                          color: isInternal 
                            ? "#78350f" 
                            : (isCurrent ? "#ffffff" : "var(--text-main)"),
                          fontSize: "13.5px",
                          lineHeight: "1.5",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                        }}
                      >
                        {isInternal && (
                          <div style={{ fontSize: "11px", fontWeight: 800, color: "#b45309", textTransform: "uppercase", marginBottom: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                            <Lock size={11} /> Private Staff Internal Note (Hidden from Student)
                          </div>
                        )}

                        <div style={{ whiteSpace: "pre-wrap" }}>{msg.text}</div>

                        {msg.attachment_url && (
                          <div style={{ marginTop: "10px", paddingTop: "8px", borderTop: isCurrent ? "1px solid rgba(255,255,255,0.2)" : "1px solid var(--border-subtle)", fontSize: "12px" }}>
                            <a 
                              href={msg.attachment_url} 
                              target="_blank" 
                              rel="noreferrer"
                              style={{ color: isCurrent ? "#bfdbfe" : "var(--primary)", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600 }}
                            >
                              <Paperclip size={13} /> Attachment: {msg.attachment_url}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 1-Click Canned Responses Helper for Staff */}
              {isStaff && (
                <div style={{ marginBottom: "12px", background: "var(--surface-dim)", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "11.5px", fontWeight: 700, color: "var(--text-subtle)", display: "flex", alignItems: "center", gap: "5px", marginBottom: "8px" }}>
                    <Sparkles size={13} color="var(--primary)" /> 1-Click Quick Canned Responses:
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {CANNED_RESPONSES.map((cr, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => applyCannedResponse(cr.text)}
                        style={{ fontSize: "11px", padding: "4px 10px" }}
                      >
                        {cr.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Responsive Reply Form */}
              <form onSubmit={handleSendReply}>
                {isStaff && (
                  <div style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "center", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className={`btn btn-sm ${!isInternalNote ? "btn-primary" : "btn-secondary"}`}
                      onClick={() => setIsInternalNote(false)}
                      style={{ fontSize: "11.5px" }}
                    >
                      <MessageSquare size={13} /> Public Reply to Requester
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${isInternalNote ? "btn-primary" : "btn-secondary"}`}
                      onClick={() => setIsInternalNote(true)}
                      style={{ fontSize: "11.5px", background: isInternalNote ? "#d97706" : "", borderColor: isInternalNote ? "#d97706" : "" }}
                    >
                      <Lock size={13} /> Staff Internal Note
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setShowAttachmentField(!showAttachmentField)}
                      style={{ marginLeft: "auto", fontSize: "11.5px" }}
                    >
                      <Paperclip size={13} /> {showAttachmentField ? "Hide Attachment" : "Attach Link / File"}
                    </button>
                  </div>
                )}

                {showAttachmentField && (
                  <div style={{ marginBottom: "10px" }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Paste attachment / screenshot / cloud notebook URL..."
                      value={attachmentInput}
                      onChange={(e) => setAttachmentInput(e.target.value)}
                      style={{ fontSize: "12px" }}
                    />
                  </div>
                )}

                {/* Clean Stacked Reply Box */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder={
                      isInternalNote
                        ? "Write confidential internal note visible only to admins, auditors, and trainers..."
                        : `Reply to ticket as ${currentUser?.name || "Support"}...`
                    }
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    style={{ 
                      width: "100%", 
                      fontSize: "13px", 
                      border: isInternalNote ? "1.5px solid #f59e0b" : "1px solid var(--border-subtle)",
                      background: isInternalNote ? "#fffbeb" : "var(--surface-card)"
                    }}
                  ></textarea>

                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      style={{ 
                        background: isInternalNote ? "#d97706" : "#2563eb",
                        borderColor: isInternalNote ? "#d97706" : "#2563eb",
                        fontWeight: 700,
                        padding: "9px 22px"
                      }}
                    >
                      <Send size={15} /> {isInternalNote ? "Post Internal Note" : "Send Reply"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <div className="card" style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-muted)" }}>
              <MessageSquare size={42} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
              <p style={{ fontWeight: 700, fontSize: "16px", color: "var(--text-main)" }}>Select a support ticket</p>
              <p style={{ fontSize: "13px", marginTop: "4px" }}>Click any ticket in the left roster to view thread history and submit responses.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Open New Support Ticket */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: "640px" }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Ticket size={20} color="var(--primary)" /> Open New Support Ticket
              </h3>
              <button className="btn-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              {/* Stakeholder Identity Banner */}
              <div style={{ background: "var(--surface-dim)", padding: "12px 16px", borderRadius: "8px", marginBottom: "18px", fontSize: "12.5px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ color: "var(--text-subtle)" }}>Raising ticket as: </span>
                    <strong style={{ color: "var(--text-main)" }}>{currentUser?.name || "Fatima Khan"}</strong>
                  </div>
                  {getRoleBadge(currentRole)}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "14px" }}>
                <label className="form-label">Subject / Issue Summary *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Video player freezing on lesson 4, or Question on XGBoost capstone"
                  required
                  value={newTicketForm.title}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, title: e.target.value })}
                />
              </div>

              <div className="grid-2" style={{ marginBottom: "14px" }}>
                <div className="form-group">
                  <label className="form-label">Category (Auto-Routing) *</label>
                  <select 
                    className="form-control form-select"
                    value={newTicketForm.category}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value })}
                  >
                    <option value="TECHNICAL">🛠️ Technical / LMS / Video Player</option>
                    <option value="COURSE_QUERY">📚 Course / Academic (To Lead Trainer)</option>
                    <option value="CERTIFICATE">📜 Certificate / Name Correction (To Auditor)</option>
                    <option value="CONSORTIUM_OPS">🏛️ Consortium / Cohort Operations</option>
                    <option value="CONTENT_REVIEW">✨ Curriculum / Content Quality</option>
                    <option value="GENERAL">ℹ️ General Support / Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Priority Level *</label>
                  <select 
                    className="form-control form-select"
                    value={newTicketForm.priority}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, priority: e.target.value })}
                  >
                    <option value="LOW">Low (48h Resolution Target)</option>
                    <option value="MEDIUM">Medium (24h Resolution Target)</option>
                    <option value="HIGH">High (12h Resolution Target)</option>
                    <option value="URGENT">⚡ Urgent (4h SLA Escalation)</option>
                  </select>
                </div>
              </div>

              <div className="grid-2" style={{ marginBottom: "14px" }}>
                <div className="form-group">
                  <label className="form-label">Related Track / Curriculum</label>
                  <select 
                    className="form-control form-select"
                    value={newTicketForm.related_course}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, related_course: e.target.value })}
                  >
                    {tracks?.map(tr => (
                      <option key={tr.id} value={`Track ${tr.number}: ${tr.title}`}>
                        Track {tr.number}: {tr.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Cohort Identifier</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. NUST-MLOps-Batch-04"
                    value={newTicketForm.related_cohort}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, related_cohort: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "14px" }}>
                <label className="form-label">Detailed Description *</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Describe your issue with exact steps to reproduce, error message, or specific course question..."
                  required
                  value={newTicketForm.description}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, description: e.target.value })}
                ></textarea>
              </div>

              <div className="form-group" style={{ marginBottom: "18px" }}>
                <label className="form-label">Optional Attachment / Screenshot / Repo URL</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="https://github.com/... or cloud image link"
                  value={newTicketForm.attachment_url}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, attachment_url: e.target.value })}
                />
              </div>

              {/* Dynamic Smart-Routing Notice */}
              <div style={{ background: "var(--primary-tint)", border: "1px solid var(--primary-border)", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", fontSize: "12.5px", color: "var(--primary-dark)" }}>
                ⚡ <strong>Smart Auto-Routing: </strong> 
                {newTicketForm.category === "COURSE_QUERY" && "This ticket will be dispatched directly to your Lead AI Trainer & SME Desk."}
                {newTicketForm.category === "CERTIFICATE" && "This ticket will be routed to the MoITT Credential Verification Desk."}
                {newTicketForm.category === "CONSORTIUM_OPS" && "This ticket will be sent to the Consortium Operations Desk."}
                {newTicketForm.category === "CONTENT_REVIEW" && "This ticket will be sent to the Curriculum Quality & Review Desk."}
                {(newTicketForm.category === "TECHNICAL" || newTicketForm.category === "GENERAL") && "This ticket will be dispatched to the MoITT Central Infrastructure Helpdesk."}
              </div>

              <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: "10px 20px" }}>
                  <Send size={15} /> Submit Support Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Resolve Ticket Dialog */}
      {showResolveModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: "520px" }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} color="#10b981" /> Mark Ticket as Resolved
              </h3>
              <button className="btn-close" onClick={() => setShowResolveModal(false)}>×</button>
            </div>

            <form onSubmit={handleResolveSubmit}>
              <p style={{ fontSize: "13.5px", color: "var(--text-muted)", marginBottom: "16px", lineHeight: "1.5" }}>
                Provide a formal resolution summary note for <strong>{selectedTicket?.id}</strong>. This note will be recorded in the audit log and visible to the requester.
              </p>

              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label className="form-label">Resolution Summary Note *</label>
                <textarea
                  className="form-control"
                  rows="3"
                  required
                  placeholder="e.g. Issue investigated, CDN edge node cache revalidated, user confirmed video playing smoothly."
                  value={resolutionInput}
                  onChange={(e) => setResolutionInput(e.target.value)}
                ></textarea>
              </div>

              <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowResolveModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ background: "#10b981", borderColor: "#10b981", padding: "10px 20px" }}>
                  <CheckCircle2 size={15} /> Confirm &amp; Mark Resolved
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Export / Printable Audit Summary */}
      {showPrintModal && selectedTicket && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: "720px" }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Printer size={20} color="var(--primary)" /> MoITT Formal Ticket Audit Record
              </h3>
              <button className="btn-close" onClick={() => setShowPrintModal(false)}>×</button>
            </div>

            <div style={{ background: "var(--surface-dim)", padding: "18px", borderRadius: "10px", fontSize: "13px", marginBottom: "18px", border: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px", marginBottom: "10px" }}>
                <strong style={{ fontSize: "14px", color: "var(--primary)" }}>Ticket Reference: {selectedTicket.id}</strong>
                <span>Status: <strong>{selectedTicket.status}</strong></span>
              </div>
              <div style={{ marginBottom: "4px" }}><strong>Subject:</strong> {selectedTicket.title}</div>
              <div style={{ marginBottom: "4px" }}><strong>Requester:</strong> {getRequesterName(selectedTicket.created_by)} ({selectedTicket.created_by?.email || "trainee@moitt.gov.pk"})</div>
              <div style={{ marginBottom: "4px" }}><strong>Assigned Desk:</strong> {selectedTicket.assigned_to?.name || "MoITT Helpdesk"} ({selectedTicket.assigned_to?.desk || "Infrastructure Desk"})</div>
              <div style={{ marginBottom: "4px" }}><strong>Track:</strong> {selectedTicket.related_course}</div>
              <div><strong>Timestamp:</strong> Created: {selectedTicket.created_at || "2026-08-22"} | Updated: {selectedTicket.updated_at || "2026-08-22"}</div>
              {selectedTicket.resolution_note && (
                <div style={{ marginTop: "10px", color: "#166534", background: "#f0fdf4", padding: "10px", borderRadius: "6px" }}>
                  <strong>Resolution Note:</strong> {selectedTicket.resolution_note}
                </div>
              )}
            </div>

            <div style={{ maxHeight: "320px", overflowY: "auto", marginBottom: "20px", border: "1px solid var(--border-subtle)", borderRadius: "10px", padding: "14px" }}>
              <h5 style={{ marginBottom: "10px", fontSize: "12px", color: "var(--text-subtle)", textTransform: "uppercase", fontWeight: 700 }}>Audit Message Chronology</h5>
              {selectedTicket.messages?.map((m, i) => (
                <div key={i} style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px", marginBottom: "10px", fontSize: "13px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-subtle)", fontSize: "11.5px", marginBottom: "4px" }}>
                    <strong>{m.sender} ({m.role}) {m.is_internal_note && "— [INTERNAL NOTE]"}</strong>
                    <span>{m.timestamp}</span>
                  </div>
                  <div style={{ color: "var(--text-main)" }}>{m.text}</div>
                </div>
              ))}
            </div>

            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowPrintModal(false)}>Close</button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => window.print()}
                style={{ padding: "10px 20px" }}
              >
                <Printer size={15} /> Print Audit Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

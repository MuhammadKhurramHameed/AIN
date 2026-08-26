import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_DATA } from '../data/initialData';
import { apiService } from '../services/api';
import { exportStructuredReportPDF } from '../utils/pdfExport';

const AppContext = createContext();

export const ROLE_CONFIGS = {
  SUPER_ADMIN: {
    label: "Super Admin",
    code: "SUPER_ADMIN",
    defaultView: "admin-oversight",
    title: "Executive Oversight Dashboard",
    subtitle: "National AI Advancement Initiative — Telemetry & Quota Control",
    menu: [
      { id: "admin-oversight", label: "National Oversight", icon: "LayoutDashboard" },
      { id: "user-management", label: "User Directory", icon: "Users" },
      { id: "trainer-approval", label: "Trainer Accreditation", icon: "UserCheck" },
      { id: "course-gatekeeper", label: "Course Gatekeeper", icon: "ShieldCheck" },
      { id: "ai-control", label: "AI Control Center", icon: "Cpu" },
      { id: "admin-partners", label: "Consortium Partners", icon: "Building2" },
      { id: "curriculum-builder", label: "Track Architecture", icon: "Layers" },
      { id: "curriculum-kanban", label: "Curriculum Kanban", icon: "Kanban" },
      { id: "question-bank", label: "Question Bank", icon: "BookOpen" },
      { id: "python-lab", label: "Python AI Code Lab", icon: "Code" },
      { id: "tickets", label: "Helpdesk Tickets", icon: "LifeBuoy" },
      { id: "integrations", label: "System Integrations", icon: "Network" },
      { id: "security", label: "Security & Keys", icon: "Lock" },
      { id: "admin-audit", label: "Compliance & Audit Logs", icon: "ShieldCheck" },
      { id: "public-intake", label: "Public Intake Portal", icon: "UserPlus" },
      { id: "authenticator", label: "Credential Authenticator", icon: "QrCode" }
    ]
  },
  MOITT_AUDITOR: {
    label: "AIN Auditor",
    code: "MOITT_AUDITOR",
    defaultView: "admin-oversight",
    title: "AIN Compliance & Analytics",
    subtitle: "Read-Only Compliance & Live Telemetry Inspector",
    menu: [
      { id: "admin-oversight", label: "National Analytics", icon: "LayoutDashboard" },
      { id: "user-management", label: "User Directory", icon: "Users" },
      { id: "trainer-approval", label: "Trainer Audit Index", icon: "UserCheck" },
      { id: "course-gatekeeper", label: "Course Release Audit", icon: "ShieldCheck" },
      { id: "ai-control", label: "AI Usage Logs", icon: "Cpu" },
      { id: "tickets", label: "Helpdesk Audit", icon: "LifeBuoy" },
      { id: "integrations", label: "System Integrations", icon: "Network" },
      { id: "security", label: "Security Audit", icon: "Lock" },
      { id: "admin-audit", label: "Audit Logs", icon: "ShieldCheck" },
      { id: "authenticator", label: "Credential Verification", icon: "QrCode" }
    ]
  },
  CONSORTIUM_ADMIN: {
    label: "Consortium Admin",
    code: "CONSORTIUM_ADMIN",
    defaultView: "consortium-dashboard",
    title: "Consortium Partner Workspace",
    subtitle: "NUST Partner Portal — Cohorts & Batch Approvals",
    menu: [
      { id: "consortium-dashboard", label: "Partner Overview", icon: "Building2" },
      { id: "curriculum-kanban", label: "Curriculum Kanban", icon: "Kanban" },
      { id: "question-bank", label: "Question Bank", icon: "BookOpen" },
      { id: "trainer-hub", label: "Cohort Operations", icon: "Users" },
      { id: "tickets", label: "Partner Support", icon: "LifeBuoy" },
      { id: "authenticator", label: "Certificate Lookup", icon: "QrCode" }
    ]
  },
  TRAINER: {
    label: "Trainer",
    code: "TRAINER",
    defaultView: "trainer-hub",
    title: "Trainer Operations Hub",
    subtitle: "Cohort Delivery, Attendance & Evaluation Workspace",
    menu: [
      { id: "trainer-hub", label: "Trainer Dashboard", icon: "Users" },
      { id: "trainer-proposals", label: "Course Proposals", icon: "Lightbulb" },
      { id: "trainee-classroom", label: "Live Classroom", icon: "Video" },
      { id: "python-lab", label: "Python AI Lab", icon: "Code" },
      { id: "trainer-grading", label: "Grading & Feedback", icon: "FileText" },
      { id: "question-bank", label: "Question Authoring", icon: "BookOpen" },
      { id: "tickets", label: "Trainer Helpdesk", icon: "LifeBuoy" },
      { id: "authenticator", label: "Credential Lookup", icon: "QrCode" }
    ]
  },
  CONTENT_REVIEWER: {
    label: "Content Reviewer",
    code: "CONTENT_REVIEWER",
    defaultView: "curriculum-kanban",
    title: "Curriculum Quality Assurance",
    subtitle: "Pedagogical Standards & Coursework Validation",
    menu: [
      { id: "curriculum-kanban", label: "Curriculum Review", icon: "Kanban" },
      { id: "course-studio", label: "Course Design Studio", icon: "FileCode" },
      { id: "question-bank", label: "Item Bank Quality", icon: "BookOpen" },
      { id: "curriculum-builder", label: "Track Standards", icon: "Layers" }
    ]
  },
  TRAINEE: {
    label: "Trainee Student",
    code: "TRAINEE",
    defaultView: "trainee-dashboard",
    title: "Trainee Learning Portal",
    subtitle: "Track 1: Students & Fresh Graduates (Applied ML)",
    menu: [
      { id: "trainee-dashboard", label: "My Dashboard", icon: "LayoutDashboard" },
      { id: "onboarding", label: "Orientation Walkthrough", icon: "Sparkles" },
      { id: "trainee-classroom", label: "Live Classroom", icon: "Video" },
      { id: "python-lab", label: "Python AI Code Lab", icon: "Code" },
      { id: "trainee-assessment", label: "Online Assessment", icon: "FileText" },
      { id: "trainee-certificate", label: "My Certificate", icon: "Award" },
      { id: "tickets", label: "Support & Helpdesk", icon: "LifeBuoy" },
      { id: "authenticator", label: "Verify Credential", icon: "QrCode" }
    ]
  }
};

export const AppProvider = ({ children }) => {
  const [currentRole, setCurrentRole] = useState("SUPER_ADMIN");
  const [currentView, setCurrentView] = useState("landing-page");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [showDemoBar, setShowDemoBar] = useState(false);

  const [programme, setProgramme] = useState(INITIAL_DATA.programme);
  const [tracks, setTracks] = useState(INITIAL_DATA.tracks);
  const [partners, setPartners] = useState(INITIAL_DATA.consortium_partners);
  const [provincialStats, setProvincialStats] = useState(INITIAL_DATA.provincial_stats);
  const [auditLogs, setAuditLogs] = useState(INITIAL_DATA.audit_logs);
  const [certificates, setCertificates] = useState(INITIAL_DATA.certificates);
  const [assessment] = useState(INITIAL_DATA.assessment);

  const [trainers, setTrainers] = useState([
    { id: "tr-1", fullName: "Dr. Zeeshan Haider", email: "zeeshan.haider@nust.edu.pk", cnic: "35202-3344556-4", consortiumPartner: "National University of Sciences & Technology (NUST)", specialization: "Applied MLOps & Computer Vision", assignedCohorts: ["NUST-MLOps-Batch-04"], status: "ACTIVE" },
    { id: "tr-2", fullName: "Engr. Saad Farooq", email: "saad.farooq@nu.edu.pk", cnic: "37405-9988776-5", consortiumPartner: "FAST National University", specialization: "LLM Fine-Tuning & Prompt Engineering", assignedCohorts: ["FAST-LLM-Batch-02"], status: "ACTIVE" }
  ]);
  
  const [traineeHours, setTraineeHours] = useState(21.5);
  const [heartbeatPing, setHeartbeatPing] = useState(118);
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [capstoneScore, setCapstoneScore] = useState(92.5);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Course Proposals Pipeline State
  const [courseProposals, setCourseProposals] = useState([
    {
      id: "prop-101",
      title: "LLM Fine-Tuning & Quantization Techniques",
      track_id: "track-1",
      track_title: "Track 1: Applied MLOps & Generative AI",
      level_code: "LEVEL_2_APPLIED",
      target_hours: 24,
      status: "PROPOSED",
      proposed_by: { name: "Dr. Zeeshan Haider", role: "TRAINER" },
      proposed_at: "2026-08-25 14:30",
      syllabus_outline: ["Module 1: LoRA & QLoRA Fundamentals", "Module 2: Unsloth & Transformers Fine-Tuning", "Module 3: Int4 Quantization & vLLM Serving", "Module 4: Benchmark Evaluation & MLOps"],
      reference_material: "github.com/naiai-pakistan/llm-finetuning",
      suggested_quiz_concepts: "LoRA rank selection, memory calculation for 7B models"
    },
    {
      id: "prop-102",
      title: "Autonomous Agent Systems with LangGraph",
      track_id: "track-1",
      track_title: "Track 1: Applied MLOps & Generative AI",
      level_code: "LEVEL_2_APPLIED",
      target_hours: 20,
      status: "PENDING_ADMIN_APPROVAL",
      proposed_by: { name: "Engr. Saad Farooq", role: "TRAINER" },
      proposed_at: "2026-08-24 09:15",
      syllabus_outline: ["Module 1: ReAct Pattern & Tool Binding", "Module 2: State Graphs & Memory Checkpoints", "Module 3: Multi-Agent Orchestration", "Module 4: Production Evaluation"],
      reference_material: "github.com/naiai-pakistan/langgraph-agents",
      suggested_quiz_concepts: "State mutation, recursion limits",
      built_assets: {
        builder_name: "Instructional Design Team",
        video_url: "https://www.youtube.com/watch?v=aircAruvnKk",
        video_duration_minutes: 210,
        lesson_count: 8,
        quiz_count: 2,
        lab_notebook_url: "https://github.com/naiai-pakistan/hands-on-lab.git"
      }
    }
  ]);

  // Trainer Application Intake State
  const [pendingTrainers, setPendingTrainers] = useState([
    {
      id: "TR-APP-8821",
      full_name: "Dr. Hammad Mustafa",
      email: "hammad.mustafa@fast.edu.pk",
      cnic: "35201-1234567-1",
      institution: "FAST NUST Joint AI Lab",
      education: "PhD in Artificial Intelligence — 20 Years",
      experience_years: 7,
      assigned_track: "Track 1: Applied MLOps",
      specializations: ["Machine Learning", "Deep Learning", "MLOps & Deployment"],
      portfolio_url: "https://github.com/hammad-mustafa",
      status: "PENDING_APPROVAL"
    },
    {
      id: "TR-APP-7740",
      full_name: "Dr. Mariam Farooq",
      email: "mariam.farooq@lums.edu.pk",
      cnic: "42101-9988776-3",
      institution: "LUMS School of Science & Engineering",
      education: "PhD in Computer Vision — 19 Years",
      experience_years: 10,
      assigned_track: "Track 3: Sectoral AI",
      specializations: ["Computer Vision", "AI Ethics & Governance"],
      portfolio_url: "https://scholar.google.com",
      status: "APPROVED"
    }
  ]);

  // Helpdesk Tickets State
  const [tickets, setTickets] = useState([
    {
      id: "TICK-9041",
      subject: "CNIC Verification Error during Public Intake",
      category: "Identity & NADRA Verification",
      priority: "HIGH",
      status: "OPEN",
      submittedBy: "Fatima Khan",
      role: "TRAINEE",
      createdAt: "2026-08-25 11:20",
      assignedTo: "Super Admin Desk",
      description: "My CNIC 35201-1234567-8 showed non-verified status during intake.",
      replies: [
        { id: "r1", author: "AIN Helpdesk", role: "SUPER_ADMIN", text: "We have re-triggered NADRA API lookup. Please verify now.", timestamp: "2026-08-25 12:00" }
      ]
    },
    {
      id: "TICK-8812",
      subject: "Lab Environment GPU Memory Limit Exceeded",
      category: "Python AI Lab Environment",
      priority: "MEDIUM",
      status: "IN_PROGRESS",
      submittedBy: "Dr. Zeeshan Haider",
      role: "TRAINER",
      createdAt: "2026-08-24 16:45",
      assignedTo: "Infrastructure Ops",
      description: "Students in Batch-04 reporting CUDA Out of Memory on PyTorch model train.",
      replies: []
    }
  ]);

  // Report Automation & Scheduler State
  const [reportSchedules, setReportSchedules] = useState([
    {
      _id: "sched-default-1",
      title: "Daily National Executive Briefing",
      reportType: "FULL_EXECUTIVE",
      frequency: "DAILY",
      scheduledTime: "18:00",
      actionType: "BOTH",
      recipientEmails: ["dg.ai@moitt.gov.pk", "auditor.lead@ain.gov.pk"],
      emailSubject: "MoITT National AI Capacity Initiative — Daily Executive KPI Briefing",
      notes: "Automated EOD KPI brief with provincial capacity distribution and affirmative female ratios.",
      isActive: true,
      lastDispatchedAt: "2026-08-25 18:00"
    }
  ]);

  const [reportDispatchHistory, setReportDispatchHistory] = useState([
    {
      id: "disp-901",
      dispatchedAt: "2026-08-25 18:00",
      reportTitle: "National Executive Briefing",
      reportType: "FULL_EXECUTIVE",
      actionType: "BOTH",
      recipients: ["dg.ai@moitt.gov.pk", "auditor.lead@ain.gov.pk"],
      status: "SUCCESS",
      message: "Delivered to 2 recipients & PDF downloaded locally"
    }
  ]);

  const [activeSchedulerToast, setActiveSchedulerToast] = useState(null);
  const [lastTriggeredMinute, setLastTriggeredMinute] = useState("");

  // Initial Fetch from Backend Server
  useEffect(() => {
    async function loadBackendData() {
      const health = await apiService.getHealth();
      if (health && health.status === 'HEALTHY') {
        setIsBackendConnected(true);

        const progRes = await apiService.getProgrammeSummary();
        if (progRes && progRes.success) {
          setProgramme({
            registered_count: progRes.data.registeredCount,
            female_registered_count: progRes.data.femaleRegisteredCount,
            target_participants: progRes.data.targetParticipants,
            target_female_ratio: progRes.data.targetFemaleRatio,
            verified_hours_total: progRes.data.verifiedHoursTotal,
            certificates_issued: progRes.data.certificatesIssued
          });
        }

        const partnerRes = await apiService.getPartners();
        if (partnerRes && partnerRes.success && partnerRes.data.length > 0) {
          setPartners(partnerRes.data.map(p => ({
            id: p._id,
            name: p.name,
            email: p.email,
            mou_ref: p.mouRef,
            allocated_capacity: p.allocatedCapacity,
            enrolled: p.enrolled,
            active_cohorts: p.activeCohorts,
            status: p.status
          })));
        }

        const trainerRes = await apiService.getTrainers();
        if (trainerRes && trainerRes.success && trainerRes.data.length > 0) {
          setTrainers(trainerRes.data.map(t => ({
            id: t._id,
            fullName: t.fullName,
            email: t.email,
            cnic: t.cnic,
            consortiumPartner: t.consortiumPartner,
            specialization: t.specialization,
            assignedCohorts: t.assignedCohorts,
            status: t.status
          })));
        }

        const schedRes = await apiService.getReportSchedules();
        if (schedRes && schedRes.success && schedRes.data.length > 0) {
          setReportSchedules(schedRes.data);
        }
      }
    }
    loadBackendData();
  }, []);

  const switchRole = (roleCode) => {
    if (ROLE_CONFIGS[roleCode]) {
      setCurrentRole(roleCode);
      const config = ROLE_CONFIGS[roleCode];
      if (isAuthenticated) {
        setCurrentView(config.defaultView);
      }
    }
  };

  const login = (roleCode = currentRole) => {
    setIsAuthenticated(true);
    setCurrentRole(roleCode);
    setAuthUser({
      name: INITIAL_DATA.roles[roleCode]?.name || "Authenticated User",
      role: roleCode,
      email: INITIAL_DATA.roles[roleCode]?.email || "user@ain.gov.pk"
    });
    const config = ROLE_CONFIGS[roleCode] || ROLE_CONFIGS.SUPER_ADMIN;
    setCurrentView(config.defaultView);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAuthUser(null);
    setCurrentView("landing-page");
  };

  const navigateTo = (viewId) => {
    const publicViews = ["landing-page", "sign-in", "sign-up", "2fa-verify", "public-intake", "authenticator", "trainer-register", "onboarding"];
    if (publicViews.includes(viewId)) {
      setCurrentView(viewId);
      return;
    }
    if (!isAuthenticated) {
      setCurrentView("sign-in");
      return;
    }
    const config = ROLE_CONFIGS[currentRole];
    const isAllowed = config.menu?.some(m => m.id === viewId) || publicViews.includes(viewId);
    if (isAllowed) {
      setCurrentView(viewId);
    } else {
      setCurrentView(config.defaultView);
    }
  };

  // Course Proposal Handlers
  const proposeCourse = (proposalData) => {
    const newProp = {
      id: `prop-${Math.floor(Math.random() * 900 + 100)}`,
      ...proposalData,
      status: "PROPOSED",
      proposed_by: { name: authUser?.name || "Dr. Zeeshan Haider", role: currentRole },
      proposed_at: new Date().toISOString().replace("T", " ").substring(0, 16)
    };
    setCourseProposals(prev => [newProp, ...prev]);
    return newProp;
  };

  const startBuildingProposal = (proposalId) => {
    setCourseProposals(prev => prev.map(p => p.id === proposalId ? { ...p, status: "IN_PRODUCTION" } : p));
  };

  const submitCourseForApproval = (proposalId, builderData) => {
    setCourseProposals(prev => prev.map(p => p.id === proposalId ? {
      ...p,
      status: "PENDING_ADMIN_APPROVAL",
      built_assets: {
        builder_name: authUser?.name || "Instructional Designer",
        ...builderData
      }
    } : p));
  };

  const approveAndPublishCourse = (proposalId) => {
    setCourseProposals(prev => prev.map(p => p.id === proposalId ? { ...p, status: "PUBLISHED_LIVE" } : p));
  };

  const rejectCoursePush = (proposalId, reason) => {
    setCourseProposals(prev => prev.map(p => p.id === proposalId ? { ...p, status: "PROPOSED", revision_notes: reason } : p));
  };

  // Trainer Application Handlers
  const registerTrainer = (formData) => {
    const newTrainer = {
      id: `TR-APP-${Math.floor(Math.random() * 9000 + 1000)}`,
      ...formData,
      status: "PENDING_APPROVAL"
    };
    setPendingTrainers(prev => [newTrainer, ...prev]);
    return newTrainer;
  };

  const approveTrainer = (trainerId) => {
    setPendingTrainers(prev => prev.map(t => t.id === trainerId ? { ...t, status: "APPROVED" } : t));
  };

  const rejectTrainer = (trainerId, reason) => {
    setPendingTrainers(prev => prev.map(t => t.id === trainerId ? { ...t, status: "REJECTED", rejection_reason: reason } : t));
  };

  // Ticket Helpdesk Handlers
  const createTicket = (ticketData) => {
    const newTicket = {
      id: `TICK-${Math.floor(Math.random() * 9000 + 1000)}`,
      ...ticketData,
      status: "OPEN",
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      replies: []
    };
    setTickets(prev => [newTicket, ...prev]);
    return newTicket;
  };

  const replyToTicket = (ticketId, text) => {
    const newReply = {
      id: `r-${Date.now()}`,
      author: authUser?.name || "Support Officer",
      role: currentRole,
      text,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16)
    };
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, replies: [...t.replies, newReply] } : t));
  };

  const updateTicketStatus = (ticketId, status) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t));
  };

  const assignTicket = (ticketId, assignee) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, assignedTo: assignee } : t));
  };

  const updateTicketPriority = (ticketId, priority) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, priority } : t));
  };

  const toggleSidebar = () => setIsSidebarCollapsed(prev => !prev);
  const toggleDemoBar = () => setShowDemoBar(prev => !prev);

  // Live Telemetry Simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setHeartbeatPing(prev => prev + 1);
      setTraineeHours(prev => Math.min(24.0, prev + (1 / 60)));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Register Single Trainee
  const registerTrainee = async (formData) => {
    const res = await apiService.registerTrainee(formData);
    
    setProgramme(prev => {
      const regCount = prev.registered_count + 1;
      const femaleCount = formData.gender === "FEMALE" ? prev.female_registered_count + 1 : prev.female_registered_count;
      return {
        ...prev,
        registered_count: regCount,
        female_registered_count: femaleCount
      };
    });

    const newLog = {
      id: res && res.success ? res.user.id : `log-${Math.floor(Math.random() * 90000 + 10000)}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      actor: "Public Registration Intake Engine",
      action: "TRAINEE_REGISTERED",
      entity: `Trainee: ${formData.fullName} (${formData.gender}, ${formData.province})`,
      ip: "182.180.92.14",
      payload: { gender: formData.gender, province: formData.province, quota_satisfied: true }
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Bulk Register Trainees
  const bulkRegisterTrainees = async (traineesList, partnerName) => {
    const res = await apiService.bulkRegisterTrainees(traineesList, partnerName);
    
    let addedCount = res && res.success ? res.addedCount : traineesList.length;
    let femaleAdded = res && res.success ? res.femaleAddedCount : traineesList.filter(t => t.gender === 'FEMALE').length;

    setProgramme(prev => ({
      ...prev,
      registered_count: prev.registered_count + addedCount,
      female_registered_count: prev.female_registered_count + femaleAdded
    }));

    const newLog = {
      id: `log-${Math.floor(Math.random() * 90000 + 10000)}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      actor: `${partnerName || 'Consortium Admin'} (Bulk Engine)`,
      action: "BULK_TRAINEE_INTAKE_SUCCESS",
      entity: `Batch of ${addedCount} Trainees (${femaleAdded} Female)`,
      ip: "127.0.0.1",
      payload: { total_added: addedCount, female_added: femaleAdded, partner: partnerName }
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Add Trainer
  const addTrainer = async (trainerData) => {
    const res = await apiService.addTrainer(trainerData);

    const newTrainer = {
      id: res && res.success ? res.data._id : `tr-${trainers.length + 1}`,
      fullName: trainerData.fullName,
      email: trainerData.email,
      phone: trainerData.phone || "+92 300 1122334",
      cnic: trainerData.cnic || "35201-9988776-9",
      consortiumPartner: trainerData.consortiumPartner || "National University of Sciences & Technology (NUST)",
      specialization: trainerData.specialization || "Applied MLOps & Computer Vision",
      assignedCohorts: ["NUST-MLOps-Batch-05"],
      status: "ACTIVE"
    };
    setTrainers(prev => [...prev, newTrainer]);
  };

  // Add Consortium Partner
  const addPartner = async (partnerData) => {
    const res = await apiService.addPartner(partnerData);

    const newPartner = {
      id: res && res.success ? res.data._id : `cons-${partners.length + 1}`,
      name: partnerData.name,
      email: partnerData.email,
      mou_ref: partnerData.mou_ref || `MOU-AIN-2026-00${partners.length + 1}`,
      allocated_capacity: parseInt(partnerData.allocated_capacity) || 2000,
      enrolled: 0,
      active_cohorts: 0,
      status: "ACTIVE"
    };
    setPartners(prev => [...prev, newPartner]);
  };

  // Report Dispatcher (Both Automated & Manual Test)
  const triggerReportDispatch = async (scheduleData, isManualTest = false) => {
    const reportType = scheduleData.reportType || "FULL_EXECUTIVE";
    const reportTitle = scheduleData.title || "Executive Briefing Report";
    const actionType = scheduleData.actionType || "BOTH";
    const recipients = scheduleData.recipientEmails || [];
    const timestampStr = new Date().toISOString().replace("T", " ").substring(0, 16);

    let downloadSuccess = true;
    let emailSuccess = true;

    // 1. Auto-Download PDF to Disk
    if (actionType === "DOWNLOAD_ONLY" || actionType === "BOTH") {
      downloadSuccess = await exportStructuredReportPDF({
        reportType,
        programme,
        tracks,
        partners,
        provincialStats,
        filename: `${reportTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`
      });
    }

    // 2. Auto-Email Snapshot to Stakeholders
    if (actionType === "EMAIL_ONLY" || actionType === "BOTH") {
      const emailPayload = {
        scheduleId: scheduleData._id,
        reportType,
        reportTitle,
        recipients,
        subject: scheduleData.emailSubject || `MoITT National AI Executive Report — ${reportTitle}`,
        notes: scheduleData.notes || "Automated scheduled dispatch from Synapse LMS Control Plane.",
        metricsSnapshot: {
          registered_count: programme.registered_count,
          target_participants: programme.target_participants,
          female_registered_count: programme.female_registered_count,
          femalePct: ((programme.female_registered_count / programme.registered_count) * 100).toFixed(1),
          verified_hours_total: programme.verified_hours_total,
          certificates_issued: programme.certificates_issued
        },
        actor: isManualTest ? `${authUser?.name || 'Super Admin'} (Manual Test)` : "Automated Report Cron Worker"
      };

      const emailRes = await apiService.sendReportEmail(emailPayload);
      if (!emailRes || !emailRes.success) {
        emailSuccess = false;
      }
    }

    // Record in local dispatch history
    const historyItem = {
      id: `disp-${Date.now()}`,
      dispatchedAt: timestampStr,
      reportTitle,
      reportType,
      actionType,
      recipients,
      status: downloadSuccess && emailSuccess ? "SUCCESS" : "PARTIAL",
      message: `${isManualTest ? "[Manual Test] " : ""}${
        actionType === "BOTH"
          ? `Delivered to ${recipients.length} recipients & downloaded PDF locally.`
          : actionType === "EMAIL_ONLY"
          ? `Delivered email snapshot to ${recipients.length} recipients.`
          : "Downloaded PDF report to device."
      }`
    };

    setReportDispatchHistory(prev => [historyItem, ...prev]);

    // Update schedule lastDispatchedAt
    if (scheduleData._id) {
      setReportSchedules(prev => prev.map(s => s._id === scheduleData._id ? { ...s, lastDispatchedAt: timestampStr } : s));
    }

    // Append to Compliance Audit Trail
    const auditRecord = {
      id: `log-${Math.floor(Math.random() * 90000 + 10000)}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      actor: isManualTest ? (authUser?.name || "Super Admin") : "Executive Scheduler Daemon",
      action: isManualTest ? "REPORT_MANUAL_DISPATCH_TRIGGERED" : "REPORT_SCHEDULED_AUTO_DISPATCH",
      entity: `Report: ${reportTitle} (${reportType})`,
      ip: "127.0.0.1",
      payload: { actionType, recipients, downloadSuccess, emailSuccess }
    };
    setAuditLogs(prev => [auditRecord, ...prev]);

    // Show top notification toast
    setActiveSchedulerToast({
      title: isManualTest ? "Instant Dispatch Completed" : "Automated Report Executed",
      message: `${reportTitle} — ${
        actionType === "BOTH"
          ? `downloaded & emailed to ${recipients.join(", ")}`
          : actionType === "EMAIL_ONLY"
          ? `emailed to ${recipients.join(", ")}`
          : "downloaded to local disk"
      }`,
      time: timestampStr
    });

    setTimeout(() => {
      setActiveSchedulerToast(null);
    }, 7000);

    return { downloadSuccess, emailSuccess, historyItem };
  };

  // Save / Update Schedule
  const saveReportSchedule = async (scheduleData) => {
    const res = await apiService.saveReportSchedule(scheduleData);
    if (res && res.success && res.data) {
      setReportSchedules(prev => {
        const existingIdx = prev.findIndex(s => s._id === res.data._id);
        if (existingIdx !== -1) {
          const updated = [...prev];
          updated[existingIdx] = res.data;
          return updated;
        }
        return [res.data, ...prev];
      });
      return res.data;
    } else {
      // Local fallback
      const fallbackSched = {
        _id: scheduleData._id || `sched-${Date.now()}`,
        ...scheduleData,
        lastDispatchedAt: scheduleData.lastDispatchedAt || null
      };
      setReportSchedules(prev => {
        const existingIdx = prev.findIndex(s => s._id === fallbackSched._id);
        if (existingIdx !== -1) {
          const updated = [...prev];
          updated[existingIdx] = fallbackSched;
          return updated;
        }
        return [fallbackSched, ...prev];
      });
      return fallbackSched;
    }
  };

  // Delete Schedule
  const deleteReportSchedule = async (scheduleId) => {
    await apiService.deleteReportSchedule(scheduleId);
    setReportSchedules(prev => prev.filter(s => s._id !== scheduleId));
  };

  const dismissSchedulerToast = () => setActiveSchedulerToast(null);

  // Background Auto-Scheduler Loop (Ticks every 10 seconds)
  useEffect(() => {
    const schedulerTimer = setInterval(async () => {
      const now = new Date();
      const currentHH = String(now.getHours()).padStart(2, '0');
      const currentMM = String(now.getMinutes()).padStart(2, '0');
      const currentMinuteStr = `${currentHH}:${currentMM}`;

      if (lastTriggeredMinute === currentMinuteStr) return;

      for (const sched of reportSchedules) {
        if (!sched.isActive) continue;

        let shouldTrigger = false;
        if (sched.frequency === 'DAILY' || sched.frequency === 'CUSTOM_TIME') {
          shouldTrigger = sched.scheduledTime === currentMinuteStr;
        } else if (sched.frequency === 'EVERY_6_HOURS') {
          shouldTrigger = (now.getHours() % 6 === 0) && (now.getMinutes() === 0);
        } else if (sched.frequency === 'EVERY_12_HOURS') {
          shouldTrigger = (now.getHours() % 12 === 0) && (now.getMinutes() === 0);
        } else if (sched.frequency === 'EVERY_24_HOURS') {
          shouldTrigger = (now.getHours() === 0) && (now.getMinutes() === 0);
        }

        if (shouldTrigger) {
          setLastTriggeredMinute(currentMinuteStr);
          await triggerReportDispatch(sched, false);
        }
      }
    }, 10000);

    return () => clearInterval(schedulerTimer);
  }, [reportSchedules, lastTriggeredMinute, programme, tracks, partners, provincialStats]);

  return (
    <AppContext.Provider value={{
      currentRole,
      currentView,
      currentUser: authUser || INITIAL_DATA.roles[currentRole],
      roleConfig: ROLE_CONFIGS[currentRole],
      isAuthenticated,
      authUser,
      showDemoBar,
      login,
      logout,
      toggleDemoBar,
      programme,
      tracks,
      partners,
      trainers,
      provincialStats,
      auditLogs,
      certificates,
      assessment,
      traineeHours,
      heartbeatPing,
      activeModal,
      modalData,
      capstoneScore,
      isBackendConnected,
      isSidebarCollapsed,
      courseProposals,
      pendingTrainers,
      tickets,
      reportSchedules,
      reportDispatchHistory,
      activeSchedulerToast,
      saveReportSchedule,
      deleteReportSchedule,
      triggerReportDispatch,
      dismissSchedulerToast,
      proposeCourse,
      startBuildingProposal,
      submitCourseForApproval,
      approveAndPublishCourse,
      rejectCoursePush,
      registerTrainer,
      approveTrainer,
      rejectTrainer,
      createTicket,
      replyToTicket,
      updateTicketStatus,
      assignTicket,
      updateTicketPriority,
      toggleSidebar,
      setCapstoneScore,
      switchRole,
      navigateTo,
      registerTrainee,
      bulkRegisterTrainees,
      addTrainer,
      addPartner,
      setActiveModal,
      setModalData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

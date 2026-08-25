import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_DATA } from '../data/initialData';
import { apiService } from '../services/api';

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
      { id: "ai-control", label: "AI Control Center", icon: "Cpu" },
      { id: "admin-partners", label: "Consortium Partners", icon: "Building2" },
      { id: "curriculum-builder", label: "Track Architecture", icon: "Layers" },
      { id: "curriculum-kanban", label: "Curriculum Kanban", icon: "Kanban" },
      { id: "question-bank", label: "Question Bank", icon: "BookOpen" },
      { id: "integrations", label: "System Integrations", icon: "Network" },
      { id: "security", label: "Security & Keys", icon: "Lock" },
      { id: "admin-audit", label: "Compliance & Audit Logs", icon: "ShieldCheck" },
      { id: "public-intake", label: "Public Intake Portal", icon: "UserPlus" },
      { id: "authenticator", label: "Credential Authenticator", icon: "QrCode" }
    ]
  },
  MOITT_AUDITOR: {
    label: "MoITT Auditor",
    code: "MOITT_AUDITOR",
    defaultView: "admin-oversight",
    title: "Ministry Verification & Analytics",
    subtitle: "Read-Only Compliance & Live Telemetry Inspector",
    menu: [
      { id: "admin-oversight", label: "National Analytics", icon: "LayoutDashboard" },
      { id: "user-management", label: "User Directory", icon: "Users" },
      { id: "ai-control", label: "AI Usage Logs", icon: "Cpu" },
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
      { id: "authenticator", label: "Certificate Lookup", icon: "QrCode" }
    ]
  },
  TRAINER: {
    label: "Trainer",
    code: "TRAINER",
    defaultView: "trainer-hub",
    title: "Trainer Hub & Live Operations",
    subtitle: "Cohort NUST-MLOps-Batch-04 Management",
    menu: [
      { id: "trainer-hub", label: "Live Classroom", icon: "Users" },
      { id: "question-bank", label: "Question Bank", icon: "BookOpen" },
      { id: "trainer-grading", label: "Grading Workspace", icon: "CheckSquare" },
      { id: "trainee-classroom", label: "Webinar View", icon: "Video" }
    ]
  },
  CONTENT_REVIEWER: {
    label: "Content Reviewer",
    code: "CONTENT_REVIEWER",
    defaultView: "curriculum-builder",
    title: "Curriculum Quality & Pedagogy",
    subtitle: "Auditing Level 1, Level 2, and Level 3 Taxonomies",
    menu: [
      { id: "curriculum-kanban", label: "Curriculum Kanban", icon: "Kanban" },
      { id: "question-bank", label: "Question Bank", icon: "BookOpen" },
      { id: "curriculum-builder", label: "Track Architecture", icon: "Layers" },
      { id: "admin-audit", label: "Curriculum Logs", icon: "ShieldCheck" }
    ]
  },
  TRAINEE: {
    label: "Trainee Student",
    code: "TRAINEE",
    defaultView: "trainee-dashboard",
    title: "Trainee Student Portal",
    subtitle: "Track 1: Students & Fresh Graduates (Applied ML)",
    menu: [
      { id: "trainee-dashboard", label: "My Dashboard", icon: "LayoutDashboard" },
      { id: "trainee-classroom", label: "Live Classroom", icon: "Video" },
      { id: "trainee-assessment", label: "Online Assessment", icon: "FileText" },
      { id: "trainee-certificate", label: "My Certificate", icon: "Award" },
      { id: "authenticator", label: "Verify Credential", icon: "QrCode" }
    ]
  }
};

export const AppProvider = ({ children }) => {
  const [currentRole, setCurrentRole] = useState("SUPER_ADMIN");
  const [currentView, setCurrentView] = useState("admin-oversight");
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
            phone: t.phone,
            cnic: t.cnic,
            consortiumPartner: t.consortiumPartner,
            specialization: t.specialization,
            assignedCohorts: t.assignedCohorts,
            status: t.status
          })));
        }

        const logRes = await apiService.getAuditLogs();
        if (logRes && logRes.success && logRes.data.length > 0) {
          setAuditLogs(logRes.data.map(l => ({
            id: l._id,
            timestamp: l.timestamp,
            actor: l.actor,
            action: l.action,
            entity: l.entity,
            ip: l.ip,
            payload: l.payload
          })));
        }
      }
    }
    loadBackendData();
  }, []);

  // Switch Role
  const switchRole = (roleCode) => {
    if (!ROLE_CONFIGS[roleCode]) return;
    setCurrentRole(roleCode);
    setCurrentView(ROLE_CONFIGS[roleCode].defaultView);
  };

  // Navigate To View
  const navigateTo = (viewId) => {
    setCurrentView(viewId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  // Bulk Register Trainees (Consortium / Admin)
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

  // Add Trainer (Admin or Consortium)
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
      mou_ref: partnerData.mou_ref || `MOU-MoITT-2026-00${partners.length + 1}`,
      allocated_capacity: parseInt(partnerData.allocated_capacity) || 2000,
      enrolled: 0,
      active_cohorts: 0,
      status: "ACTIVE"
    };
    setPartners(prev => [...prev, newPartner]);
  };

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const toggleSidebar = () => setIsSidebarCollapsed(prev => !prev);

  return (
    <AppContext.Provider value={{
      currentRole,
      currentView,
      currentUser: INITIAL_DATA.roles[currentRole],
      roleConfig: ROLE_CONFIGS[currentRole],
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

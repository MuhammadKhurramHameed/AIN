import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_DATA } from '../data/initialData';

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
      { id: "admin-partners", label: "Consortium Partners", icon: "Building2" },
      { id: "admin-audit", label: "Compliance & Audit Logs", icon: "ShieldCheck" },
      { id: "curriculum-builder", label: "Track Architecture", icon: "Layers" },
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
  
  const [traineeHours, setTraineeHours] = useState(21.5);
  const [heartbeatPing, setHeartbeatPing] = useState(118);
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [capstoneScore, setCapstoneScore] = useState(92.5);

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

  // Live WebSocket Heartbeat Simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setHeartbeatPing(prev => prev + 1);
      setTraineeHours(prev => Math.min(24.0, prev + (1 / 60)));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Register New Trainee Intake
  const registerTrainee = (formData) => {
    setProgramme(prev => {
      const regCount = prev.registered_count + 1;
      const femaleCount = formData.gender === "FEMALE" ? prev.female_registered_count + 1 : prev.female_registered_count;
      return {
        ...prev,
        registered_count: regCount,
        female_registered_count: femaleCount
      };
    });

    // Add Audit Log
    const newLog = {
      id: `log-${Math.floor(Math.random() * 90000 + 10000)}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      actor: "Public Registration Intake Engine",
      action: "TRAINEE_REGISTERED",
      entity: `Trainee: ${formData.fullName} (${formData.gender}, ${formData.province})`,
      ip: "182.180.92.14",
      payload: { gender: formData.gender, province: formData.province, quota_satisfied: true }
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Add Consortium Partner
  const addPartner = (partnerData) => {
    const newPartner = {
      id: `cons-${partners.length + 1}`,
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

  return (
    <AppContext.Provider value={{
      currentRole,
      currentView,
      currentUser: INITIAL_DATA.roles[currentRole],
      roleConfig: ROLE_CONFIGS[currentRole],
      programme,
      tracks,
      partners,
      provincialStats,
      auditLogs,
      certificates,
      assessment,
      traineeHours,
      heartbeatPing,
      activeModal,
      modalData,
      capstoneScore,
      setCapstoneScore,
      switchRole,
      navigateTo,
      registerTrainee,
      addPartner,
      setActiveModal,
      setModalData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

/* Synapse LMS Control Plane v1.0 — Initial Application Data Store */

export const INITIAL_DATA = {
  programme: {
    id: "prog-naiai-2026",
    code: "NAIAI-2026-PAK",
    name: "National Artificial Intelligence Advancement Initiative",
    target_participants: 20000,
    target_female_ratio: 0.30,
    registered_count: 14850,
    female_registered_count: 5120, // 34.4% female participation
    verified_hours_total: 284500,
    certificates_issued: 8420,
    start_date: "2026-01-15",
    end_date: "2026-12-31"
  },

  // 9 National Curriculum Tracks
  tracks: [
    {
      id: "track-1",
      number: 1,
      title: "Students & Fresh Graduates",
      category: "Level 2: Applied",
      level_code: "LEVEL_2_APPLIED",
      hours: 24,
      modules: ["Python for AI & Math", "Machine Learning Foundations", "Computer Vision Basics", "NLP & LLM Prompting", "End-to-End MLOps Pipeline"],
      capstone: "End-to-End ML Pipeline Project",
      enrolled: 4200,
      active_cohorts: 14
    },
    {
      id: "track-2",
      number: 2,
      title: "Teaching Professionals",
      category: "Level 1: Literacy",
      level_code: "LEVEL_1_LITERACY",
      hours: 18,
      modules: ["AI in Modern Pedagogy", "Automated Assessment & Quiz Generation", "AI Ethics & Academic Integrity", "Interactive EdTech Tools"],
      capstone: "Interactive Lesson Plan System",
      enrolled: 2100,
      active_cohorts: 8
    },
    {
      id: "track-3",
      number: 3,
      title: "Sectoral Professionals",
      category: "Level 2: Applied",
      level_code: "LEVEL_2_APPLIED",
      hours: 24,
      modules: ["Healthcare AI Diagnostics", "AgTech Crop Intelligence", "FinTech Credit & Risk Modeling", "Enterprise Data Pipeline Architecture"],
      capstone: "Sectoral Decision Model",
      enrolled: 1850,
      active_cohorts: 6
    },
    {
      id: "track-4",
      number: 4,
      title: "Mid to C-Level Executives",
      category: "Level 3: Governance",
      level_code: "LEVEL_3_PROFESSIONAL",
      hours: 18,
      modules: ["AI Business Strategy & ROI", "Corporate AI Governance", "Cybersecurity & Data Privacy Compliance", "Vendor & Tech Stack Evaluation"],
      capstone: "Enterprise AI Roadmap",
      enrolled: 820,
      active_cohorts: 4
    },
    {
      id: "track-5",
      number: 5,
      title: "Govt Officials & Public Servants",
      category: "Level 1: Literacy",
      level_code: "LEVEL_1_LITERACY",
      hours: 18,
      modules: ["Responsible AI in Governance", "e-Governance Interoperability", "Public Sector SOP Automation", "Data Sovereign Policy"],
      capstone: "SOP Automation Proposal",
      enrolled: 1400,
      active_cohorts: 5
    },
    {
      id: "track-6",
      number: 6,
      title: "Secretarial & Administrative Staff",
      category: "Level 1: Literacy",
      level_code: "LEVEL_1_LITERACY",
      hours: 18,
      modules: ["AI Office Productivity Suite", "Executive Summarization Tools", "Document Intelligence & OCR", "Automated Email & Calendar Workflows"],
      capstone: "Office Workflow Automation",
      enrolled: 1200,
      active_cohorts: 4
    },
    {
      id: "track-7",
      number: 7,
      title: "General Workforce & Job Seekers",
      category: "Level 1: Literacy",
      level_code: "LEVEL_1_LITERACY",
      hours: 18,
      modules: ["Generative AI Productivity", "AI-Powered Resume & Portfolio", "Workplace Automation Basics", "Digital Workplace Communication"],
      capstone: "Productivity Portfolio",
      enrolled: 1650,
      active_cohorts: 6
    },
    {
      id: "track-8",
      number: 8,
      title: "Startup Founders & Tech Entrepreneurs",
      category: "Level 3: Advanced",
      level_code: "LEVEL_3_PROFESSIONAL",
      hours: 24,
      modules: ["LLM System Architecture", "Agentic Workflows & Multi-Agent Swarms", "AI Venture Financing & Pitching", "Scalable Inference Infrastructure"],
      capstone: "AI MVP Pitch Deck & Prototype",
      enrolled: 680,
      active_cohorts: 3
    },
    {
      id: "track-9",
      number: 9,
      title: "Freelancers & Remote Workers",
      category: "Level 2: Applied",
      level_code: "LEVEL_2_APPLIED",
      hours: 24,
      modules: ["n8n & Zapier Automation Workflows", "LangChain & LlamaIndex Integrations", "Voice AI & Conversational Agents", "Client Proposal & Delivery Package"],
      capstone: "Client Delivery Package",
      enrolled: 950,
      active_cohorts: 4
    }
  ],

  // Consortium Partners
  consortium_partners: [
    {
      id: "cons-1",
      name: "National University of Sciences & Technology (NUST)",
      email: "ai.office@nust.edu.pk",
      mou_ref: "MOU-MoITT-2026-001",
      allocated_capacity: 5000,
      enrolled: 4120,
      active_cohorts: 12,
      status: "ACTIVE"
    },
    {
      id: "cons-2",
      name: "FAST National University of Computer & Emerging Sciences",
      email: "naiai@nu.edu.pk",
      mou_ref: "MOU-MoITT-2026-002",
      allocated_capacity: 4500,
      enrolled: 3890,
      active_cohorts: 10,
      status: "ACTIVE"
    },
    {
      id: "cons-3",
      name: "COMSATS University Islamabad",
      email: "lms@comsats.edu.pk",
      mou_ref: "MOU-MoITT-2026-003",
      allocated_capacity: 3500,
      enrolled: 2940,
      active_cohorts: 8,
      status: "ACTIVE"
    },
    {
      id: "cons-4",
      name: "Lahore University of Management Sciences (LUMS)",
      email: "ai.initiative@lums.edu.pk",
      mou_ref: "MOU-MoITT-2026-004",
      allocated_capacity: 2500,
      enrolled: 1980,
      active_cohorts: 6,
      status: "ACTIVE"
    },
    {
      id: "cons-5",
      name: "GIKI Institute of Engineering Sciences",
      email: "naiai@giki.edu.pk",
      mou_ref: "MOU-MoITT-2026-005",
      allocated_capacity: 2000,
      enrolled: 1450,
      active_cohorts: 4,
      status: "ACTIVE"
    }
  ],

  // Provincial Capacity Breakdown
  provincial_stats: [
    { province: "Punjab", capacity: 8000, enrolled: 6150, female_pct: 35.2 },
    { province: "Sindh", capacity: 4600, enrolled: 3420, female_pct: 33.8 },
    { province: "Khyber Pakhtunkhwa", capacity: 3400, enrolled: 2580, female_pct: 31.5 },
    { province: "Balochistan", capacity: 2000, enrolled: 1340, female_pct: 30.8 },
    { province: "Islamabad Capital Territory", capacity: 1200, enrolled: 980, female_pct: 42.1 },
    { province: "Gilgit-Baltistan", capacity: 500, enrolled: 240, female_pct: 36.5 },
    { province: "Azad Jammu & Kashmir", capacity: 300, enrolled: 140, female_pct: 34.0 }
  ],

  // Demo Active User Profiles per Role
  roles: {
    SUPER_ADMIN: {
      user_id: "usr-admin-01",
      name: "Dr. Kamran Siddiqui",
      title: "National Director — AIN / NAIAI",
      role_code: "SUPER_ADMIN",
      email: "director@ain.gov.pk",
      cnic: "61101-1234567-1",
      avatar_initials: "KS"
    },
    MOITT_AUDITOR: {
      user_id: "usr-auditor-02",
      name: "Ayesha Malik",
      title: "Senior Compliance Auditor — AIN Platform",
      role_code: "MOITT_AUDITOR",
      email: "ayesha.malik@ain.gov.pk",
      cnic: "35202-9876543-2",
      avatar_initials: "AM"
    },
    CONSORTIUM_ADMIN: {
      user_id: "usr-partner-03",
      name: "Prof. Tariq Hassan",
      title: "NUST Consortium Program Director",
      role_code: "CONSORTIUM_ADMIN",
      email: "tariq.hassan@nust.edu.pk",
      cnic: "37405-5554443-3",
      avatar_initials: "TH"
    },
    TRAINER: {
      user_id: "usr-trainer-04",
      name: "Dr. Zeeshan Haider",
      title: "Lead AI Trainer & Cohort Facilitator",
      role_code: "TRAINER",
      email: "z.haider@nust.edu.pk",
      cnic: "42101-7778889-4",
      avatar_initials: "ZH"
    },
    CONTENT_REVIEWER: {
      user_id: "usr-reviewer-05",
      name: "Dr. Sara Ahmed",
      title: "Curriculum Quality & Pedagogy Auditor",
      role_code: "CONTENT_REVIEWER",
      email: "sara.ahmed@naiai.gov.pk",
      cnic: "17301-3332221-5",
      avatar_initials: "SA"
    },
    TRAINEE: {
      user_id: "usr-trainee-06",
      name: "Fatima Khan",
      title: "AI Trainee — Track 1: Applied ML",
      role_code: "TRAINEE",
      email: "fatima.khan@gmail.com",
      cnic: "35201-1122334-6",
      avatar_initials: "FK",
      verified_hours: 21.5,
      required_hours: 24,
      enrolled_track: "Students & Fresh Graduates",
      cohort: "NUST-MLOps-Batch-04",
      assessment_score: 92.5
    }
  },

  // Audit Logs
  audit_logs: [
    {
      id: "log-99482",
      timestamp: "2026-08-25 10:45:12",
      actor: "Dr. Kamran Siddiqui (SUPER_ADMIN)",
      action: "CERTIFICATE_ROOT_KEY_SIGN",
      entity: "Batch-NUST-04-Certs",
      ip: "111.68.102.14",
      payload: { batch_size: 480, algorithm: "Ed25519", hash: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" }
    },
    {
      id: "log-99481",
      timestamp: "2026-08-25 10:41:05",
      actor: "Dr. Zeeshan Haider (TRAINER)",
      action: "TELEMETRY_SESSION_CLOSED",
      entity: "Session #14 (MLOps Architecture)",
      ip: "39.40.182.90",
      payload: { active_trainees: 472, verified_pings: 28320, avg_duration_mins: 118 }
    },
    {
      id: "log-99480",
      timestamp: "2026-08-25 10:30:00",
      actor: "System Quota Balancer",
      action: "TRAINEE_INTAKE_APPROVAL",
      entity: "User: fatima.khan@gmail.com",
      ip: "10.0.4.12",
      payload: { gender: "FEMALE", province: "Punjab", quota_satisfied: true, female_ratio_now: "34.4%" }
    },
    {
      id: "log-99479",
      timestamp: "2026-08-25 09:15:33",
      actor: "Prof. Tariq Hassan (CONSORTIUM_ADMIN)",
      action: "COHORT_CREATE",
      entity: "Cohort: NUST-MLOps-Batch-05",
      ip: "111.68.102.20",
      payload: { track_id: "track-1", capacity: 500, trainer_id: "usr-trainer-04" }
    }
  ],

  // Sample Verified Certificates
  certificates: [
    {
      certificate_number: "NAIAI-2026-884920",
      trainee_name: "Fatima Khan",
      cnic: "35201-1122334-6",
      track_title: "Students & Fresh Graduates (Level 2: Applied)",
      hours_completed: 24.0,
      final_score: 92.5,
      issue_date: "2026-08-20",
      consortium_partner: "National University of Sciences & Technology (NUST)",
      digital_signature: "SIG_ED25519_8f9a2c3b4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b",
      qr_url: "https://synapse-lms.gov.pk/verify?id=NAIAI-2026-884920"
    },
    {
      certificate_number: "NAIAI-2026-773819",
      trainee_name: "Muhammad Ali Raza",
      cnic: "42101-5544332-1",
      track_title: "Startup Founders & Tech Entrepreneurs (Level 3)",
      hours_completed: 24.0,
      final_score: 96.0,
      issue_date: "2026-08-18",
      consortium_partner: "FAST National University",
      digital_signature: "SIG_ED25519_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
      qr_url: "https://synapse-lms.gov.pk/verify?id=NAIAI-2026-773819"
    }
  ],

  // Online Assessment Questions
  assessment: {
    title: "Timed Qualification Assessment — Applied MLOps & Machine Learning",
    duration_minutes: 30,
    total_questions: 5,
    questions: [
      {
        id: 1,
        text: "Which model evaluation metric should be prioritized when detecting rare anomalies in healthcare diagnostic datasets with severe class imbalance?",
        options: [
          "Overall Accuracy",
          "Precision-Recall AUC (PR-AUC)",
          "Mean Squared Error (MSE)",
          "Cosine Similarity"
        ],
        correct: 1
      },
      {
        id: 2,
        text: "In distributed LLM training, what primary optimization technique reduces GPU memory footprint by partitioning optimizer states, gradients, and parameters across data-parallel ranks?",
        options: [
          "LoRA (Low-Rank Adaptation)",
          "Zero Redundancy Optimizer (ZeRO / DeepSpeed)",
          "Quantized Int8 Activation",
          "Softmax Temperature Scaling"
        ],
        correct: 1
      },
      {
        id: 3,
        text: "Under MoITT Telemetry Guidelines, how frequently must a connected client send heartbeat pings during live classroom webinars to verify active presence?",
        options: [
          "Every 10 seconds",
          "Every 60 seconds",
          "Every 15 minutes",
          "Only at end of webinar"
        ],
        correct: 1
      },
      {
        id: 4,
        text: "Which mechanism in Transformer architectures allows the model to dynamically focus on different parts of an input sequence regardless of positional distance?",
        options: [
          "Scaled Dot-Product Self-Attention",
          "Batch Normalization",
          "Max Pooling",
          "Gradient Clipping"
        ],
        correct: 0
      },
      {
        id: 5,
        text: "Which architectural pattern is recommended for multi-agent LLM systems requiring sequential task delegation and tool invocation?",
        options: [
          "Monolithic Prompt String",
          "Agentic Workflow (LangGraph / Swarm)",
          "Static Rule-Based If-Else Grid",
          "Random Forest Classifier"
        ],
        correct: 1
      }
    ]
  }
};

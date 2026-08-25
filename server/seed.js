import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db.js';
import { Programme } from './models/Programme.js';
import { User } from './models/User.js';
import { Track } from './models/Track.js';
import { ConsortiumPartner } from './models/ConsortiumPartner.js';
import { Certificate } from './models/Certificate.js';
import { AuditLog } from './models/AuditLog.js';

dotenv.config();

const initialTracks = [
  {
    number: 1,
    title: "Students & Fresh Graduates",
    category: "Academic / Entry",
    levelCode: "Level 2: Applied",
    hours: 24,
    modules: ["Python for AI & Data Science", "Machine Learning & CV Foundations", "NLP & Prompt Engineering", "Applied MLOps & Capstone"],
    capstone: "End-to-End Image Classification & Model Deployment",
    enrolled: 4200,
    activeCohorts: 14
  },
  {
    number: 2,
    title: "Teaching Professionals",
    category: "Pedagogy / Academia",
    levelCode: "Level 1: Literacy",
    hours: 18,
    modules: ["AI-Assisted Lesson Planning", "Ethical AI in Classrooms", "Automated Assessment Tools"],
    capstone: "AI-Augmented Course Curriculum Design",
    enrolled: 2100,
    activeCohorts: 8
  },
  {
    number: 3,
    title: "Sectoral Professionals",
    category: "Industry Practitioner",
    levelCode: "Level 2: Applied",
    hours: 24,
    modules: ["Domain-Specific AI Tools", "Data Processing Pipelines", "Predictive Analytics Workflow"],
    capstone: "Sectoral Machine Learning Automation Solution",
    enrolled: 1850,
    activeCohorts: 6
  },
  {
    number: 4,
    title: "Mid to C-Level Executives",
    category: "Executive Governance",
    levelCode: "Level 3: Governance",
    hours: 18,
    modules: ["Strategic AI Roadmap Formulation", "AI Risk Management & Compliance", "ROIC Computation for AI Investments"],
    capstone: "Enterprise AI Adoption Strategy Blueprint",
    enrolled: 820,
    activeCohorts: 4
  },
  {
    number: 5,
    title: "Govt Officials & Public Servants",
    category: "Public Sector",
    levelCode: "Level 1: Literacy",
    hours: 18,
    modules: ["Public Sector AI Applications", "National AI Policy Framework", "Data Privacy & Governance"],
    capstone: "Civic Service AI Implementation Proposal",
    enrolled: 1400,
    activeCohorts: 5
  },
  {
    number: 6,
    title: "Secretarial & Administrative Staff",
    category: "Operations",
    levelCode: "Level 1: Literacy",
    hours: 18,
    modules: ["Automated Document Processing", "Smart Email Management", "AI Office Tools"],
    capstone: "Workflow Automation SOP Development",
    enrolled: 1200,
    activeCohorts: 4
  },
  {
    number: 7,
    title: "General Workforce & Job Seekers",
    category: "Workforce Enablement",
    levelCode: "Level 1: Literacy",
    hours: 18,
    modules: ["Digital AI Literacy Basics", "Generative AI Tools", "Modern Workspace Skills"],
    capstone: "Personal Digital Portfolio & AI Workflow",
    enrolled: 1650,
    activeCohorts: 6
  },
  {
    number: 8,
    title: "Startup Founders & Tech Entrepreneurs",
    category: "Entrepreneurship",
    levelCode: "Level 3: Advanced",
    hours: 24,
    modules: ["Building AI-Native Products", "LLM Fine-Tuning & RAG", "Scalable Cloud AI Deployment"],
    capstone: "Production-Ready SaaS MVP Launch",
    enrolled: 680,
    activeCohorts: 3
  },
  {
    number: 9,
    title: "Freelancers & Remote Workers",
    category: "Gig Economy",
    levelCode: "Level 2: Applied",
    hours: 24,
    modules: ["AI Content & Media Generation", "Code Copilots & Automation", "Global Freelancing Strategy"],
    capstone: "AI-Powered Gig Agency Portfolio",
    enrolled: 950,
    activeCohorts: 4
  }
];

const initialPartners = [
  { name: "National University of Sciences & Technology (NUST)", email: "lms-admin@nust.edu.pk", mouRef: "MOU-MoITT-2026-001", allocatedCapacity: 5000, enrolled: 4120, activeCohorts: 12 },
  { name: "FAST National University of Computer & Emerging Sciences", email: "lms-admin@nu.edu.pk", mouRef: "MOU-MoITT-2026-002", allocatedCapacity: 4500, enrolled: 3890, activeCohorts: 10 },
  { name: "COMSATS University Islamabad", email: "lms-admin@comsats.edu.pk", mouRef: "MOU-MoITT-2026-003", allocatedCapacity: 3500, enrolled: 2940, activeCohorts: 8 },
  { name: "Lahore University of Management Sciences (LUMS)", email: "lms-admin@lums.edu.pk", mouRef: "MOU-MoITT-2026-004", allocatedCapacity: 2500, enrolled: 1980, activeCohorts: 6 },
  { name: "Ghulam Ishaq Khan Institute (GIKI)", email: "lms-admin@giki.edu.pk", mouRef: "MOU-MoITT-2026-005", allocatedCapacity: 2000, enrolled: 1420, activeCohorts: 5 }
];

const seedData = async () => {
  try {
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await Programme.deleteMany();
    await User.deleteMany();
    await Track.deleteMany();
    await ConsortiumPartner.deleteMany();
    await Certificate.deleteMany();
    await AuditLog.deleteMany();

    console.log('[Seed] Inserting National Programme...');
    await Programme.create({
      code: 'NAIAI-2026',
      name: 'National Artificial Intelligence Advancement Initiative',
      targetParticipants: 20000,
      targetFemaleRatio: 0.30,
      registeredCount: 14850,
      femaleRegisteredCount: 5120,
      verifiedHoursTotal: 284500,
      certificatesIssued: 8420
    });

    console.log('[Seed] Inserting Curriculum Tracks...');
    await Track.insertMany(initialTracks);

    console.log('[Seed] Inserting Consortium Partners...');
    await ConsortiumPartner.insertMany(initialPartners);

    console.log('[Seed] Inserting Initial Demo Users...');
    const defaultPassword = await bcrypt.hash('Password@2026', 10);
    await User.create([
      { cnic: '35201-9988776-1', fullName: 'Dr. Kamran Siddiqui', email: 'director.naiai@moitt.gov.pk', passwordHash: defaultPassword, gender: 'MALE', province: 'Islamabad Capital Territory', district: 'Islamabad', role: 'SUPER_ADMIN', avatarInitials: 'KS' },
      { cnic: '37405-1122334-2', fullName: 'Engr. Ayesha Malik', email: 'auditor.ai@moitt.gov.pk', passwordHash: defaultPassword, gender: 'FEMALE', province: 'Punjab', district: 'Rawalpindi', role: 'MOITT_AUDITOR', avatarInitials: 'AM' },
      { cnic: '61101-4455667-3', fullName: 'Prof. Tariq Hassan', email: 'dean.computing@nust.edu.pk', passwordHash: defaultPassword, gender: 'MALE', province: 'Islamabad Capital Territory', district: 'Islamabad', role: 'CONSORTIUM_ADMIN', avatarInitials: 'TH' },
      { cnic: '35202-3344556-4', fullName: 'Dr. Zeeshan Haider', email: 'zeeshan.haider@nust.edu.pk', passwordHash: defaultPassword, gender: 'MALE', province: 'Punjab', district: 'Lahore', role: 'TRAINER', avatarInitials: 'ZH' },
      { cnic: '42101-5566778-5', fullName: 'Dr. Saima Riaz', email: 'reviewer.curriculum@moitt.gov.pk', passwordHash: defaultPassword, gender: 'FEMALE', province: 'Sindh', district: 'Karachi Central', role: 'CONTENT_REVIEWER', avatarInitials: 'SR' },
      { cnic: '35201-1122334-6', fullName: 'Fatima Khan', email: 'fatima.khan@gmail.com', passwordHash: defaultPassword, gender: 'FEMALE', province: 'Punjab', district: 'Lahore', role: 'TRAINEE', avatarInitials: 'FK', verifiedHours: 18.0, requiredHours: 24.0 }
    ]);

    console.log('[Seed] Inserting Initial Verified Certificate...');
    await Certificate.create({
      certificateNumber: 'NAIAI-2026-884920',
      traineeName: 'Fatima Khan',
      cnic: '35201-1122334-6',
      trackTitle: 'Track 1: Students & Fresh Graduates (Level 2: Applied)',
      hoursCompleted: 24.0,
      finalScore: 92.5,
      issueDate: '2026-08-20',
      consortiumPartner: 'National University of Sciences & Technology (NUST)',
      digitalSignature: 'SIG_ED25519_8f9a2c3b4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b',
      qrUrl: 'http://localhost:5173/?cert=NAIAI-2026-884920'
    });

    console.log('[Seed] Inserting Initial Audit Trail Logs...');
    await AuditLog.create([
      { timestamp: '2026-08-25 10:14:02', actor: 'System Automation', action: 'QUOTA_CHECK_PASSED', entity: 'Programme Engine (Female Ratio: 34.5%)', ip: '127.0.0.1', payload: { female_ratio: 0.345, status: "COMPLIANT" } },
      { timestamp: '2026-08-25 09:30:15', actor: 'Dr. Kamran Siddiqui', action: 'PARTNER_ALLOCATION_UPDATED', entity: 'NUST Allocation: 5,000 Capacity', ip: '182.180.92.14', payload: { partner_id: "p1", allocated: 5000 } },
      { timestamp: '2026-08-25 08:45:20', actor: 'Dr. Zeeshan Haider', action: 'SESSION_TELEMETRY_COMMITTED', entity: 'NUST-MLOps-Batch-04 (480 Trainees)', ip: '111.68.102.5', payload: { contact_hours: 2.0, active_trainees: 480 } },
      { timestamp: '2026-08-24 16:20:00', actor: 'Root Key Vault', action: 'CERTIFICATE_ISSUED', entity: 'Certificate NAIAI-2026-884920 (Fatima Khan)', ip: '10.0.0.1', payload: { cert_no: "NAIAI-2026-884920", score: 92.5 } }
    ]);

    console.log('[Seed] MongoDB Atlas database successfully populated!');
    process.exit(0);
  } catch (error) {
    console.error(`[Seed] Failure: ${error.message}`);
    process.exit(1);
  }
};

seedData();

import bcrypt from "bcryptjs";
import { connectDb } from "./config/db";
import { env } from "./config/env";
import { DEFAULT_TRACKS } from "./config/roles";
import { pickWeightedRegion } from "./config/regions";
import { User } from "./models/User";
import { Programme } from "./models/Programme";
import { Track } from "./models/Track";
import { ConsortiumPartner } from "./models/ConsortiumPartner";
import { Course } from "./models/Course";
import { Lesson } from "./models/Lesson";
import { Enrollment } from "./models/Enrollment";
import { KanbanBoard } from "./models/KanbanBoard";
import { KanbanCard } from "./models/KanbanCard";
import { Certificate } from "./models/Certificate";
import { Report } from "./models/Report";

const DEFAULT_PASSWORD = "Password123!";
const TOTAL_TRAINEES = 20_000;
const TOTAL_TUTORS = 52;
const PROGRAMME_START_DAYS_AGO = 120;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const loginRoster: { role: string; name: string; email: string; password: string; org?: string }[] = [];

async function hash(pw: string) {
  return bcrypt.hash(pw, 10);
}

/**
 * Realistic historical timestamps for enrollments, so "active today" / "new this week"
 * dashboard metrics show a plausible slice of the cohort instead of literally everyone
 * (which is what happens if every seeded record just gets today's date).
 */
function randomEnrollmentDates(isComplete: boolean): { createdAt: Date; updatedAt: Date; completedAt?: Date } {
  const now = Date.now();
  // Skewed toward recent — the programme is presented as ramping up, not flat.
  const daysAgo = PROGRAMME_START_DAYS_AGO * Math.random() ** 1.8;
  const createdAt = new Date(now - daysAgo * ONE_DAY_MS);

  let updatedAt: Date;
  if (Math.random() < 0.12) {
    // A currently-active slice, so "active today" reads as a real (not 0, not 100%) number.
    updatedAt = new Date(now - Math.random() * 2 * ONE_DAY_MS);
  } else {
    updatedAt = new Date(createdAt.getTime() + Math.random() * (now - createdAt.getTime()));
  }

  return { createdAt, updatedAt, completedAt: isComplete ? updatedAt : undefined };
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Finds a user by email, or creates it. Pass a precomputed passwordHash to avoid re-hashing at scale. */
async function ensureUser(
  email: string,
  fields: {
    name: string;
    role: string;
    passwordHash: string;
    organizationId?: string;
    trackId?: string;
    gender?: "female" | "male";
    region?: string;
    permissions?: string[];
    createdBy?: string;
  }
) {
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      email,
      name: fields.name,
      role: fields.role,
      passwordHash: fields.passwordHash,
      organizationId: fields.organizationId,
      trackId: fields.trackId,
      gender: fields.gender,
      region: fields.region,
      permissions: fields.permissions ?? [],
      createdBy: fields.createdBy,
    });
  }
  return user;
}

const MALE_FIRST_NAMES = [
  "Ahmed", "Usman", "Bilal", "Kamran", "Faisal", "Adeel", "Danish", "Junaid", "Waqas", "Tariq",
  "Hamza", "Asad", "Shahid", "Rashid", "Saad", "Imran", "Kashif", "Omar", "Zeeshan", "Nabeel",
  "Fahad", "Arslan", "Talha", "Hassan", "Hussain", "Rizwan", "Salman", "Yasir", "Naveed", "Sohail",
];
const FEMALE_FIRST_NAMES = [
  "Sara", "Fatima", "Hina", "Bushra", "Mahnoor", "Sidra", "Rimsha", "Iqra", "Alishba", "Mehak",
  "Ayesha", "Zainab", "Sobia", "Mariam", "Farah", "Noreen", "Amina", "Sadia", "Rabia", "Sana",
  "Nadia", "Uzma", "Saba", "Komal", "Anum", "Warda", "Maria", "Kiran", "Sumaira", "Tania",
];
const LAST_NAMES = [
  "Khan", "Raza", "Noor", "Tariq", "Aslam", "Anjum", "Baig", "Nawaz", "Aftab", "Shah",
  "Habib", "Karim", "Rauf", "Aziz", "Riaz", "Sheikh", "Rana", "Farooq", "Siddiqui", "Mehmood",
  "Anwar", "Latif", "Naeem", "Deeba", "Jamil", "Sultan", "Yousaf", "Rehman", "Bashir", "Chaudhry",
  "Malik", "Iqbal", "Ahmed", "Hussain", "Qureshi",
];

interface CourseDef {
  title: string;
  level: "level_1" | "level_2" | "level_3";
  description: string;
}
interface TrackCourseDef {
  l1: CourseDef;
  l2: CourseDef;
  l3?: CourseDef;
}

async function run() {
  await connectDb();
  console.log("[seed] connected, seeding...");

  const defaultHash = await hash(DEFAULT_PASSWORD);

  // --- Super admin ---
  const superAdmin = await ensureUser(env.seedSuperAdminEmail, {
    name: "Synapse Super Admin",
    role: "super_admin",
    passwordHash: await hash(env.seedSuperAdminPassword),
  });
  loginRoster.push({ role: "Super Admin", name: superAdmin.name, email: superAdmin.email, password: env.seedSuperAdminPassword });

  // --- The default programme (the platform can host others — see Programme admin UI) ---
  let programme = await Programme.findOne({ slug: "national-ai-capacity-building" });
  if (!programme) {
    programme = await Programme.create({
      name: "National AI Capacity Building Programme",
      slug: "national-ai-capacity-building",
      description: "MoITT's nationwide AI literacy and applied-AI training programme across all 9 participant categories.",
      targetParticipants: TOTAL_TRAINEES,
      genderTargetPct: 30,
      createdBy: superAdmin.id,
    });
  }
  console.log(`[seed] programme ready: ${programme.name}`);

  // --- Tracks (the 9 MoITT participant categories, scoped to the programme above) ---
  const tracks: InstanceType<typeof Track>[] = [];
  for (let i = 0; i < DEFAULT_TRACKS.length; i++) {
    const name = DEFAULT_TRACKS[i];
    let track = await Track.findOne({ programmeId: programme.id, name });
    if (!track) {
      // Backfill: a track with this name might already exist from before programmes existed.
      const legacy = await Track.findOne({ name, programmeId: { $exists: false } });
      if (legacy) {
        legacy.programmeId = programme._id;
        legacy.order = i;
        await legacy.save();
        track = legacy;
      } else {
        track = await Track.create({ programmeId: programme.id, name, order: i, description: `Track ${i + 1}: ${name}` });
      }
    }
    tracks.push(track);
  }
  console.log(`[seed] ${tracks.length} tracks ready`);

  // --- MoITT staff (multiple roles within MoITT) ---
  const moittStaffDefs = [
    { name: "Imran Qureshi", title: "MoITT Program Director", email: "imran.qureshi@moitt.gov.pk", permissions: ["manage_content", "review_reports"] },
    { name: "Sana Malik", title: "MoITT M&E Officer", email: "sana.malik@moitt.gov.pk", permissions: ["review_reports"] },
    { name: "Bilal Chaudhry", title: "MoITT Compliance Officer", email: "bilal.chaudhry@moitt.gov.pk", permissions: ["review_reports"] },
  ];
  for (const def of moittStaffDefs) {
    const user = await ensureUser(def.email, { name: def.name, role: "moitt_staff", passwordHash: defaultHash, permissions: def.permissions, createdBy: superAdmin.id });
    loginRoster.push({ role: `MoITT Staff — ${def.title}`, name: user.name, email: user.email, password: DEFAULT_PASSWORD });
  }

  // --- Consortium partners: 6 named delivery partners, each with an admin + staff ---
  const partnerDefs = [
    { name: "Roots Associates", admin: "Hamza Farooq", staff: "Zainab Siddiqui", slug: "roots" },
    { name: "Irab Technology", admin: "Tariq Mehmood", staff: "Sobia Aslam", slug: "irab" },
    { name: "Encoders", admin: "Waleed Anwar", staff: "Mariam Latif", slug: "encoders" },
    { name: "NCBMS", admin: "Shahid Naeem", staff: "Farah Deeba", slug: "ncbms" },
    { name: "SkillShareHub", admin: "Asad Jamil", staff: "Noreen Fatima", slug: "skillsharehub" },
    { name: "Air University", admin: "Rashid Latif", staff: "Amina Sultan", slug: "airuniversity" },
  ];

  const partnerRecords: { partner: InstanceType<typeof ConsortiumPartner>; adminUser: InstanceType<typeof User> }[] = [];

  for (const def of partnerDefs) {
    let partner = await ConsortiumPartner.findOne({ name: def.name });
    if (!partner) {
      partner = await ConsortiumPartner.create({ name: def.name, contactEmail: `ops@${def.slug}.example`, createdBy: superAdmin.id });
    }

    const adminUser = await ensureUser(`${def.slug}.admin@partners.synapse.local`, {
      name: def.admin,
      role: "consortium_partner_admin",
      passwordHash: defaultHash,
      organizationId: partner.id,
      createdBy: superAdmin.id,
    });
    loginRoster.push({ role: "Consortium Partner Admin", name: adminUser.name, email: adminUser.email, password: DEFAULT_PASSWORD, org: def.name });

    const staffUser = await ensureUser(`${def.slug}.staff@partners.synapse.local`, {
      name: def.staff,
      role: "consortium_partner_staff",
      passwordHash: defaultHash,
      organizationId: partner.id,
      createdBy: adminUser.id,
    });
    loginRoster.push({ role: "Consortium Partner Staff", name: staffUser.name, email: staffUser.email, password: DEFAULT_PASSWORD, org: def.name });

    partnerRecords.push({ partner, adminUser });
  }

  // --- Content administrators (2) ---
  const contentAdmin = await ensureUser("content.admin@synapse.local", { name: "Ayesha Content Admin", role: "content_admin", passwordHash: defaultHash, createdBy: superAdmin.id });
  loginRoster.push({ role: "Content Administrator", name: contentAdmin.name, email: contentAdmin.email, password: DEFAULT_PASSWORD });

  const contentAdmin2 = await ensureUser("farhan.contentadmin@synapse.local", { name: "Farhan Content Admin", role: "content_admin", passwordHash: defaultHash, createdBy: superAdmin.id });
  loginRoster.push({ role: "Content Administrator", name: contentAdmin2.name, email: contentAdmin2.email, password: DEFAULT_PASSWORD });

  // --- Content reviewers / auditors (2) ---
  const reviewerDefs = [
    { name: "Sadia Reviewer", email: "sadia.reviewer@synapse.local" },
    { name: "Omar Auditor", email: "omar.auditor@synapse.local" },
  ];
  for (const def of reviewerDefs) {
    const user = await ensureUser(def.email, { name: def.name, role: "content_reviewer", passwordHash: defaultHash, createdBy: superAdmin.id });
    loginRoster.push({ role: "Content Reviewer / Auditor", name: user.name, email: user.email, password: DEFAULT_PASSWORD });
  }

  // --- Tutors / instructors: 5 named specialists, scaled up to 50+ total ---
  const namedTutorDefs = [
    { name: "Bilal Tutor", email: "tutor@synapse.local", specialty: "AI Literacy" },
    { name: "Hina Rehman", email: "hina.tutor@synapse.local", specialty: "Python & ML" },
    { name: "Kamran Sheikh", email: "kamran.tutor@synapse.local", specialty: "Data Analytics" },
    { name: "Rabia Yousaf", email: "rabia.tutor@synapse.local", specialty: "NLP & Computer Vision" },
    { name: "Saad Bashir", email: "saad.tutor@synapse.local", specialty: "MLOps & AI Governance" },
  ];
  const namedTutors: Record<string, InstanceType<typeof User>> = {};
  const tutorPool: InstanceType<typeof User>[] = [];
  for (const def of namedTutorDefs) {
    const user = await ensureUser(def.email, { name: def.name, role: "tutor", passwordHash: defaultHash, createdBy: superAdmin.id });
    namedTutors[def.specialty] = user;
    tutorPool.push(user);
    loginRoster.push({ role: `Tutor — ${def.specialty}`, name: user.name, email: user.email, password: DEFAULT_PASSWORD });
  }

  const extraTutorCount = TOTAL_TUTORS - namedTutorDefs.length;
  const lastTutorEmail = `tutor${String(extraTutorCount).padStart(3, "0")}@synapse.local`;
  const tutorsAlreadySeeded = await User.exists({ email: lastTutorEmail });
  if (tutorsAlreadySeeded) {
    const existing = await User.find({ role: "tutor" });
    tutorPool.length = 0;
    tutorPool.push(...existing);
  } else {
    for (let i = 1; i <= extraTutorCount; i++) {
      const gender = Math.random() < 0.4 ? "female" : "male";
      const firstName = pick(gender === "female" ? FEMALE_FIRST_NAMES : MALE_FIRST_NAMES);
      const lastName = pick(LAST_NAMES);
      const email = `tutor${String(i).padStart(3, "0")}@synapse.local`;
      const user = await User.create({
        name: `${firstName} ${lastName}`,
        email,
        passwordHash: defaultHash,
        role: "tutor",
        createdBy: superAdmin.id,
      });
      tutorPool.push(user);
    }
  }
  console.log(`[seed] ${tutorPool.length} tutors ready`);
  loginRoster.push({ role: `Tutor (+${tutorPool.length - namedTutorDefs.length} more)`, name: "tutor001…tutor047", email: "tutor001@synapse.local … tutor047@synapse.local", password: DEFAULT_PASSWORD });

  let tutorCursor = 0;
  function nextTutors(count: number): InstanceType<typeof User>[] {
    const picked: InstanceType<typeof User>[] = [];
    for (let i = 0; i < count; i++) {
      picked.push(tutorPool[tutorCursor % tutorPool.length]);
      tutorCursor++;
    }
    return picked;
  }

  // --- Courses: every track gets a Level 1 + Level 2 course, several get Level 3 ---
  async function ensureCourse(def: CourseDef, trackIdx: number, owner: InstanceType<typeof User>, courseTutors: InstanceType<typeof User>[]) {
    let course = await Course.findOne({ title: def.title });
    if (!course) {
      course = await Course.create({
        title: def.title,
        description: def.description,
        trackId: tracks[trackIdx].id,
        level: def.level,
        contentAdminId: owner.id,
        tutors: courseTutors.map((t) => t.id),
        status: "published",
      });
      await Lesson.create([
        { courseId: course.id, title: `Introduction to ${def.title}`, type: "document", content: `Welcome to ${def.title}.`, order: 0 },
        { courseId: course.id, title: `${def.title}: Applied Session`, type: "video", url: "https://example.com/video", order: 1 },
      ]);
    }
    return course;
  }

  const trackCourseDefs: TrackCourseDef[] = [
    {
      l1: { title: "AI Literacy Foundations", level: "level_1", description: "Level 1 introduction to AI concepts for all participant categories." },
      l2: { title: "Applied Python for AI", level: "level_2", description: "Level 2 hands-on Python and machine learning fundamentals." },
    },
    {
      l1: { title: "AI Literacy for Teaching Professionals", level: "level_1", description: "Level 1 AI foundations for educators and trainers." },
      l2: { title: "Applied AI for Educators", level: "level_2", description: "Level 2 classroom and curriculum applications of AI." },
    },
    {
      l1: { title: "AI Literacy for Sectoral Professionals", level: "level_1", description: "Level 1 AI foundations for health, agriculture, and fintech professionals." },
      l2: { title: "Applied AI for Health, Agriculture & Fintech", level: "level_2", description: "Level 2 sector-specific AI applications." },
      l3: { title: "Advanced Deep Learning & LLMs", level: "level_3", description: "Level 3 advanced deep learning and large language models." },
    },
    {
      l1: { title: "AI Literacy for Private Sector Leaders", level: "level_1", description: "Level 1 AI foundations for mid to C-level executives." },
      l2: { title: "Applied AI for Business Leaders", level: "level_2", description: "Level 2 AI strategy and adoption for private sector leadership." },
      l3: { title: "AI Product Leadership & Strategy", level: "level_3", description: "Level 3 advanced track on leading AI-driven products and teams." },
    },
    {
      l1: { title: "AI Literacy for Government Officials", level: "level_1", description: "Level 1 AI foundations for public servants." },
      l2: { title: "Data Analytics for the Public Sector", level: "level_2", description: "Level 2 applied data analytics for government and sectoral professionals." },
      l3: { title: "AI Governance & Ethics", level: "level_3", description: "Level 3 advanced track on responsible AI, governance, and security." },
    },
    {
      l1: { title: "AI Literacy for Public Sector Staff", level: "level_1", description: "Level 1 AI foundations for secretarial and administrative staff." },
      l2: { title: "Applied AI for Public Sector Operations", level: "level_2", description: "Level 2 AI-assisted office and administrative workflows." },
    },
    {
      l1: { title: "AI Literacy for the General Workforce", level: "level_1", description: "Level 1 AI foundations for the general workforce." },
      l2: { title: "Applied AI for the Modern Workplace", level: "level_2", description: "Level 2 practical AI tools for everyday work." },
      l3: { title: "AI Security & Risk Management", level: "level_3", description: "Level 3 advanced track on AI security and risk management." },
    },
    {
      l1: { title: "AI Literacy for Entrepreneurs & Founders", level: "level_1", description: "Level 1 AI foundations for startup founders." },
      l2: { title: "NLP & Computer Vision Applications", level: "level_2", description: "Level 2 applied track for freelancers and entrepreneurs building AI products." },
    },
    {
      l1: { title: "AI Literacy for Freelancers & Remote Workers", level: "level_1", description: "Level 1 AI foundations for freelancers and remote workers." },
      l2: { title: "Applied AI for Freelance & Remote Work", level: "level_2", description: "Level 2 AI tools for independent and remote professionals." },
    },
  ];

  const trackCourses: { l1: InstanceType<typeof Course>; l2: InstanceType<typeof Course>; l3?: InstanceType<typeof Course> }[] = [];
  for (let i = 0; i < trackCourseDefs.length; i++) {
    const def = trackCourseDefs[i];
    const owner = i % 2 === 0 ? contentAdmin : contentAdmin2;
    const l1 = await ensureCourse(def.l1, i, owner, nextTutors(2));
    const l2 = await ensureCourse(def.l2, i, owner, nextTutors(2));
    const l3 = def.l3 ? await ensureCourse(def.l3, i, owner, nextTutors(2)) : undefined;
    trackCourses.push({ l1, l2, l3 });
  }
  console.log(`[seed] ${trackCourses.reduce((n, c) => n + 2 + (c.l3 ? 1 : 0), 0)} courses ready across ${trackCourses.length} tracks`);

  // --- Named trainees (kept small and readable, useful for interactive demo logins) ---
  const traineeSeed: { name: string; gender: "female" | "male"; trackIdx: number }[] = [
    { name: "Sara Khan", gender: "female", trackIdx: 0 },
    { name: "Ahmed Raza", gender: "male", trackIdx: 0 },
    { name: "Fatima Noor", gender: "female", trackIdx: 1 },
    { name: "Bushra Yousaf", gender: "female", trackIdx: 1 },
    { name: "Usman Tariq", gender: "male", trackIdx: 2 },
    { name: "Kashif Rana", gender: "male", trackIdx: 2 },
    { name: "Hina Aslam", gender: "female", trackIdx: 3 },
    { name: "Mahnoor Sheikh", gender: "female", trackIdx: 3 },
    { name: "Waqas Anjum", gender: "male", trackIdx: 4 },
    { name: "Sidra Baig", gender: "female", trackIdx: 4 },
    { name: "Faisal Nawaz", gender: "male", trackIdx: 5 },
    { name: "Rimsha Aftab", gender: "female", trackIdx: 5 },
    { name: "Adeel Shah", gender: "male", trackIdx: 6 },
    { name: "Iqra Habib", gender: "female", trackIdx: 6 },
    { name: "Danish Karim", gender: "male", trackIdx: 7 },
    { name: "Alishba Rauf", gender: "female", trackIdx: 7 },
    { name: "Junaid Aziz", gender: "male", trackIdx: 8 },
    { name: "Mehak Riaz", gender: "female", trackIdx: 8 },
  ];

  // If trainees already exist from a run before regional data was added, wipe and
  // regenerate them (and their enrollments/certificates) rather than leaving 20,000
  // records permanently missing a region.
  const bulkCount = TOTAL_TRAINEES - traineeSeed.length;
  const sentinelEmail = `trainee${String(bulkCount).padStart(5, "0")}@trainee.synapse.local`;
  const sentinel = await User.findOne({ email: sentinelEmail }).select("region _id").lean();
  let timestampsRealistic = false;
  if (sentinel) {
    const sentinelEnrollment = await Enrollment.findOne({ userId: sentinel._id }).select("createdAt").lean();
    timestampsRealistic = !!sentinelEnrollment && sentinelEnrollment.createdAt.getTime() < Date.now() - ONE_DAY_MS;
  }
  const regionDataComplete = !!sentinel?.region && timestampsRealistic;

  if (sentinel && !regionDataComplete) {
    console.log("[seed] existing trainee pool predates regional data or has unrealistic timestamps — clearing and regenerating trainees...");
    const oldTraineeIds = (await User.find({ role: "trainee" }).select("_id").lean()).map((u) => u._id);
    await Promise.all([
      User.deleteMany({ role: "trainee" }),
      Enrollment.deleteMany({ userId: { $in: oldTraineeIds } }),
      Certificate.deleteMany({ userId: { $in: oldTraineeIds } }),
    ]);
  }

  async function ensureEnrollment(traineeId: string, courseId: string) {
    const isComplete = Math.random() > 0.5;
    const dates = randomEnrollmentDates(isComplete);
    await Enrollment.findOneAndUpdate(
      { userId: traineeId, courseId },
      {
        userId: traineeId,
        courseId,
        progress: isComplete ? 100 : Math.floor(Math.random() * 60) + 10,
        status: isComplete ? "completed" : "active",
        ...dates,
      },
      { upsert: true, setDefaultsOnInsert: true, timestamps: false }
    );
    if (isComplete) {
      await Certificate.findOneAndUpdate({ userId: traineeId, courseId }, { userId: traineeId, courseId }, { upsert: true, setDefaultsOnInsert: true });
    }
  }

  if (regionDataComplete) {
    console.log(`[seed] trainee pool already at full strength (${TOTAL_TRAINEES}) with regional data, skipping regeneration.`);
    for (const t of traineeSeed) {
      loginRoster.push({
        role: `Trainee — ${DEFAULT_TRACKS[t.trackIdx]}`,
        name: t.name,
        email: `${t.name.toLowerCase().replace(/\s+/g, ".")}@trainee.synapse.local`,
        password: DEFAULT_PASSWORD,
      });
    }
  } else {
    for (const t of traineeSeed) {
      const email = `${t.name.toLowerCase().replace(/\s+/g, ".")}@trainee.synapse.local`;
      const trainee = await ensureUser(email, {
        name: t.name,
        role: "trainee",
        passwordHash: defaultHash,
        gender: t.gender,
        region: pickWeightedRegion(),
        trackId: tracks[t.trackIdx].id,
        createdBy: superAdmin.id,
      });
      const tc = trackCourses[t.trackIdx];
      await ensureEnrollment(trainee.id, tc.l1.id);
      await ensureEnrollment(trainee.id, tc.l2.id);
      loginRoster.push({ role: `Trainee — ${DEFAULT_TRACKS[t.trackIdx]}`, name: trainee.name, email: trainee.email, password: DEFAULT_PASSWORD });
    }

    // --- Bulk trainees: scale the cohort up to full programme strength (20,000) ---
    console.log(`[seed] generating ${bulkCount} more trainees to reach ${TOTAL_TRAINEES} total (this takes a little while)...`);
    const BATCH = 2000;
    let created = 0;

    for (let start = 0; start < bulkCount; start += BATCH) {
      const end = Math.min(start + BATCH, bulkCount);
      const batchDocs = [];
      for (let i = start; i < end; i++) {
        const trackIdx = i % 9;
        const gender: "female" | "male" = Math.random() < 0.55 ? "female" : "male";
        const firstName = pick(gender === "female" ? FEMALE_FIRST_NAMES : MALE_FIRST_NAMES);
        const lastName = pick(LAST_NAMES);
        const registeredAt = new Date(Date.now() - PROGRAMME_START_DAYS_AGO * Math.random() ** 1.8 * ONE_DAY_MS);
        batchDocs.push({
          name: `${firstName} ${lastName}`,
          email: `trainee${String(i + 1).padStart(5, "0")}@trainee.synapse.local`,
          passwordHash: defaultHash,
          role: "trainee",
          gender,
          region: pickWeightedRegion(),
          trackId: tracks[trackIdx].id,
          createdBy: superAdmin.id,
          createdAt: registeredAt,
          updatedAt: registeredAt,
        });
      }

      // `timestamps: false` is a supported Mongoose runtime option not reflected in this
      // version's InsertManyOptions type, and its presence throws off overload resolution
      // — cast the whole call to bypass the type gap, not the behavior.
      const inserted = (await (User.insertMany as any)(batchDocs, { ordered: false, timestamps: false })) as InstanceType<typeof User>[];

      const enrollmentDocs: Record<string, unknown>[] = [];
      for (let idx = 0; idx < inserted.length; idx++) {
        const trackIdx = (start + idx) % 9;
        const tc = trackCourses[trackIdx];
        const makeEnrollment = (courseId: string) => {
          const isComplete = Math.random() < 0.4;
          const dates = randomEnrollmentDates(isComplete);
          return {
            userId: inserted[idx]._id,
            courseId,
            progress: isComplete ? 100 : Math.floor(Math.random() * 70) + 5,
            status: isComplete ? "completed" : "active",
            ...dates,
          };
        };
        enrollmentDocs.push(makeEnrollment(tc.l1.id));
        if (Math.random() < 0.3) enrollmentDocs.push(makeEnrollment(tc.l2.id));
        if (tc.l3 && Math.random() < 0.08) enrollmentDocs.push(makeEnrollment(tc.l3.id));
      }

      const insertedEnrollments = (await (Enrollment.insertMany as any)(enrollmentDocs, {
        ordered: false,
        timestamps: false,
      })) as InstanceType<typeof Enrollment>[];
      const certDocs = insertedEnrollments
        .filter((e) => e.status === "completed")
        .map((e) => ({ userId: e.userId, courseId: e.courseId }));
      if (certDocs.length) await Certificate.insertMany(certDocs, { ordered: false });

      created += inserted.length;
      console.log(`[seed]   ...${created}/${bulkCount} trainees (+${insertedEnrollments.length} enrollments, +${certDocs.length} certificates)`);
    }
  }

  // --- Reports: one per consortium partner ---
  for (const { partner, adminUser } of partnerRecords) {
    const enrolled = Math.floor(Math.random() * 400) + 300;
    const completed = Math.floor(enrolled * (0.3 + Math.random() * 0.4));
    await Report.findOneAndUpdate(
      { partnerId: partner.id, period: "2026-08" },
      {
        partnerId: partner.id,
        period: "2026-08",
        metrics: { enrolled, completed, femalePct: Math.floor(Math.random() * 30) + 35, dropouts: Math.floor(Math.random() * 20) },
        narrative: `${partner.name} cohort update for August 2026 across assigned tracks.`,
        status: "submitted",
        submittedBy: adminUser.id,
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }

  // --- Sample kanban board ---
  let board = await KanbanBoard.findOne({ name: "Content Production" });
  if (!board) {
    board = await KanbanBoard.create({ name: "Content Production", scope: "content", ownerId: superAdmin.id });
    await KanbanCard.create([
      { boardId: board.id, columnId: "backlog", title: "Draft Level 2 Python syllabus", createdBy: superAdmin.id, assigneeId: contentAdmin.id, order: 0 },
      { boardId: board.id, columnId: "in_progress", title: "Record AI Literacy intro video", createdBy: superAdmin.id, assigneeId: namedTutors["AI Literacy"].id, order: 0 },
      { boardId: board.id, columnId: "review", title: "Review Urdu translation batch 1", createdBy: superAdmin.id, order: 0 },
      { boardId: board.id, columnId: "done", title: "Publish AI Literacy Foundations course", createdBy: superAdmin.id, order: 0 },
    ]);
  }

  // --- Print the full login roster ---
  console.log("\n[seed] ==================== LOGIN ROSTER ====================");
  for (const entry of loginRoster) {
    console.log(`[seed] ${entry.role.padEnd(38)} ${entry.email.padEnd(38)} ${entry.password}${entry.org ? `  (${entry.org})` : ""}`);
  }
  console.log("[seed] ======================================================\n");

  const [totalUsers, totalTrainees, totalTutors, totalCourses] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ role: "trainee" }),
    User.countDocuments({ role: "tutor" }),
    Course.countDocuments({}),
  ]);
  console.log(`[seed] done. ${totalUsers} users total — ${totalTrainees} trainees, ${totalTutors} tutors, ${totalCourses} courses across ${tracks.length} tracks.`);
  process.exit(0);
}

run().catch((err) => {
  console.error("[seed] failed", err);
  process.exit(1);
});

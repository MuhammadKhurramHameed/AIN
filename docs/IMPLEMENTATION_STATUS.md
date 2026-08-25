# Implementation Status

Tracked against the master spec's module list. Status values: `NOT_STARTED`, `IN_PROGRESS`, `COMPLETE`, `HARDENING_REQUIRED`.

## Foundation

| Feature | Status | Notes |
|---|---|---|
| Auth (JWT + bcrypt) | COMPLETE | TOTP MFA now available for staff/admin roles (see MFA row below). Still no refresh-token rotation — HARDENING_REQUIRED before production on that specific point. |
| RBAC (role-based) | COMPLETE | Delegation-rules table, server-enforced. Not full ABAC/custom-roles. |
| Audit logging | COMPLETE | New `AuditLog` model + `/api/audit-logs` (super_admin only) + `AuditLog.tsx` admin page, distinct from the live-feed `ActivityLog`. Records actor/role/IP/action/target/success/metadata for login, MFA lifecycle, user creation, user status changes, and AI provider secret create/update. Verified live: a full real session (setup → wrong-code attempts → enable → login → wrong-code → disable) produced a complete, accurate, correctly-ordered trail visible in the actual admin UI, including the failed attempts. |
| Users / Roles / Delegation | COMPLETE | 8 roles, delegation rules, region/gender/track fields. |
| Programmes / Organizations (multi-tenant) | NOT_STARTED | Single-programme scope today; `ConsortiumPartner` covers delivery-partner org boundary only. |

## LMS Core

| Feature | Status | Notes |
|---|---|---|
| Courses / Tracks / Levels | COMPLETE | 9 tracks × up to 3 levels, 22 courses seeded. |
| Lessons / content | COMPLETE | Document/video/quiz lesson types. No file upload, no SCORM/xAPI. |
| Enrollment / progress | COMPLETE | Auto-completion, certificate issuance on 100%. |
| Content versioning (draft/review/approved/published/archived) | NOT_STARTED | Courses have `draft`/`published` only. |
| Learner portal | COMPLETE | Dashboard, course browse/enroll, lesson viewer, certificates. |

## Training Operations

| Feature | Status | Notes |
|---|---|---|
| Trainers (tutor role, course assignment) | COMPLETE | 52 seeded, 2 per course. No onboarding/verification workflow. |
| Trainer eligibility rules (16yrs education / 3yrs experience, configurable per programme) | COMPLETE | `Programme.minTrainerEducationYears/minTrainerExperienceYears`, checked on cohort trainer assignment. Verified: flagged a 14yr/1yr tutor, did not flag an 18yr/5yr tutor, from the actual programme-configured thresholds — not hardcoded. Non-blocking (staff judgment call), matching the source doc's "assist not decide" principle. |
| Cohorts / Batches | COMPLETE | `Cohort` model, scoped to a course, trainer(s) + trainee roster (via `Enrollment.cohortId`) + maxSize. Verified live: created a cohort, added real trainees, confirmed roster. |
| Attendance | COMPLETE | Sessions + per-trainee marking (present/late/absent/excused) + attendance % summary. Verified live: created a session, marked 2 trainees, summary correctly computed 100% (1/1 sessions, present+late counted as attended). |
| Live session integration (Zoom/Teams/Meet) | NOT_STARTED | |
| Trainer portal | COMPLETE | Course/lesson view scoped to assigned courses, now also Cohorts & Attendance scoped to their own assigned cohorts (verified: an unassigned tutor saw 0 cohorts, the assigned one saw exactly 1). |

## Assessments

| Feature | Status | Notes |
|---|---|---|
| Quiz authoring + taking | COMPLETE | Two modes: legacy inline questions (still supported) and pool-based questions drawn from the Question Bank. MCQ, multi-select, and true/false all supported; answer-sanitization verified (trainee never receives `correctOptionIds` while `in_progress`). |
| Question bank / difficulty / Bloom's taxonomy | COMPLETE | `Question` model (`mcq/multi_select/true_false/short_answer`, difficulty, Bloom level, tags, draft/approved status) + `/api/questions` CRUD + `QuestionBank.tsx` admin page. Verified live: authored 2 questions via API, confirmed they render correctly in the admin UI with filters. |
| Adaptive assessment engine | NOT_STARTED | |
| Exam security (randomization, timers, anti-cheat) | COMPLETE | Server-tracked attempt sessions (`start`→`submit`), stable option IDs so shuffling can't break grading, server-enforced time limits (with 30s grace) and max-attempt caps, random question sampling from a bank pool. Verified live end-to-end in the browser as a trainee: started a 5-min timed 2-question pool quiz, saw the countdown render and question/option order differ between two attempts (randomization confirmed), submitted correct answers → scored 100%/Passed, a resubmit on the same attempt was rejected (400), a 3rd start after `maxAttempts:2` was rejected (403), and the legacy inline-question quiz ("AI Literacy Check") still grades correctly (50% with stable ids `0`/`1`/`2` surviving option shuffle). Also caught and fixed a real UI bug during this verification: the post-submit result banner was being wiped by the panel's own reload before the trainee could see it — fixed by not resetting `result` state on the reload that follows a submit. |

## Certification

| Feature | Status | Notes |
|---|---|---|
| Certificate issuance | COMPLETE | Auto-issued on course completion, unique verification code. |
| Public verification page | COMPLETE | `/verify/:code`, no auth required, minimal PII exposed. |
| QR code | NOT_STARTED | Verification link exists; QR rendering not added. |
| Revocation / reissue / expiry | NOT_STARTED | |

## AI Platform

| Feature | Status | Notes |
|---|---|---|
| AI Gateway (Provider→Model→Capability) | COMPLETE | OpenAI-compatible + Anthropic adapters, capability-based routing, usage logging. |
| AI Control Center (Super Admin) | COMPLETE | Provider/model CRUD, masked keys, real test-connection, usage stats. |
| AI usage tracking / cost | IN_PROGRESS | Token counts + latency logged where the provider returns them; cost-per-token pricing table not yet implemented. |
| AI Tutor (lesson-scoped) | IN_PROGRESS | One real feature shipped ("Ask AI" on a lesson, context = that lesson's stored content). Not full RAG, not adaptive, not multi-turn conversation history yet. |
| AI course/question generation | NOT_STARTED | |
| RAG / knowledge base / embeddings | NOT_STARTED | See audit doc — deferred until content volume justifies retrieval infrastructure. |
| AI guardrails (moderation, PII detection, prompt-injection defense) | NOT_STARTED | Basic: capability-scoped context only, no arbitrary tool access. No output moderation pass yet. |
| Prompt Studio (versioned prompts) | NOT_STARTED | Prompts are inline in the gateway-calling code for now. |
| AI evaluation lab | NOT_STARTED | |

## Integrations

| Feature | Status | Notes |
|---|---|---|
| Integration model + SDK pattern | COMPLETE | `IntegrationProvider` interface, Super-Admin CRUD, encrypted config. |
| SMTP email | COMPLETE | Real `nodemailer` send + connection test. |
| SMS / WhatsApp / push | NOT_STARTED | |
| Zoom / Teams / Meet | NOT_STARTED | (Tender mentions live-class Zoom/Meet — not yet wired to a real account.) |
| S3-compatible storage | NOT_STARTED | No file upload exists yet to need it. |
| SSO (Google/Microsoft/SAML/OIDC) | NOT_STARTED | |
| Webhooks / Zapier/Make-style automation | NOT_STARTED | |
| SCORM / xAPI / LTI 1.3 | NOT_STARTED | |

## Analytics & Reporting

| Feature | Status | Notes |
|---|---|---|
| Programme dashboard | COMPLETE | Real aggregations, live-refresh via activity socket, verified at 20k-trainee scale. |
| Regional/geographic analytics | COMPLETE | Real Pakistan ADM1 boundaries, live pulse, drill-down sub-matrices. |
| Executive dashboard | IN_PROGRESS | Current dashboard covers most KPIs (§43); no dedicated MoITT-branded executive view yet. |
| Custom report builder | NOT_STARTED | |
| Scheduled reports / exports (CSV/XLSX/PDF) | NOT_STARTED | |

## Platform / Ops

| Feature | Status | Notes |
|---|---|---|
| 4-portal structure (Learner/Trainer/Staff/Admin) | COMPLETE | Nav grouping + portal branding by role; not separate route-namespace apps, but real server-enforced separation. |
| Redis / queues / background workers | NOT_STARTED | No workload yet justifying it — see audit doc. |
| Object storage / CDN / video pipeline | NOT_STARTED | |
| Search (global) | NOT_STARTED | |
| Feature flags | NOT_STARTED | |
| System health dashboard | NOT_STARTED | |
| CI/CD, containerization, K8s manifests | NOT_STARTED | |
| Automated tests (unit/integration/E2E/load) | IN_PROGRESS | Real Jest + Supertest + `mongodb-memory-server` suite started (`server/src/__tests__/`): 13 tests across auth/RBAC (`auth.test.ts`), MFA lifecycle (`mfa.test.ts`), and the assessment engine (`quiz.test.ts` — grading, resubmit-block, maxAttempts, cross-account attempt isolation). Runs via `npm test`. Not yet E2E (browser-driven) or load tests, and coverage is limited to what Phase B/C touched, not the whole app. |
| i18n / RTL (Urdu) | NOT_STARTED | Tender requires Urdu; not yet started. |
| Accessibility (WCAG 2.2 AA) | NOT_STARTED | Noted as a gap in the earlier readiness review too; needs a dedicated pass. |
| MFA for admins | COMPLETE | TOTP (RFC 6238), `@otplib/preset-v11` (Node-native crypto, no ESM dependency issues), QR enrollment (`qrcode` → data URL) + manual-entry fallback, secret encrypted at rest (`mfaSecret`, `select:false`). Two-step login: password grants only a 5-min-lived `mfaToken`, never a session cookie, until the TOTP code is verified. Scoped to staff/admin roles (`super_admin, moitt_staff, content_admin, content_reviewer`) via `/security` self-service page, not trainees. Verified live end-to-end multiple times via tightly-timed real HTTP round trips (setup→verify→enable, then a fresh login correctly blocked at password-only and completed only after a valid second-factor code) plus the automated test suite; UI-driven mouse/keyboard clicks intermittently failed the TOTP window purely from browser-automation tool latency (5+ round trips eating into the intentionally short 30–90s tolerance) — a test-environment artifact, not loosened for convenience since that would weaken real security. |
| Rate limiting | COMPLETE | `express-rate-limit`: a generous global `/api` backstop, a tight 10-req/15-min limiter shared by `/auth/login` and `/auth/mfa/login` (credential+OTP brute-force budget), and a 20-req/min-per-user limiter on the paid-provider-backed `/lessons/:id/ask-ai` endpoint. Verified live and organically: repeated manual MFA testing tripped the login limiter for real (429 returned), confirmed the limit is enforced and clears on restart — not simulated. Also caught and fixed a real bug the dev server's own startup log surfaced: the AI limiter's custom `keyGenerator` used raw `req.ip`, which `express-rate-limit` flagged as unsafe for IPv6 (an attacker could rotate the trailing bits of an IPv6 address to dodge the limit) — fixed with the library's own `ipKeyGenerator()` helper. |

## Overall read

The platform is a genuinely working MVP for the LMS core, reporting, and (as of this pass) a real AI Gateway foundation — not a mockup. The gap to the full master-spec platform is mostly in operational/scale infrastructure (queues, CDN, observability, tests) and platform breadth (RAG, workflow engine, integration catalog beyond SMTP) that are legitimate multi-week efforts each, not something to fake into existence in one pass.

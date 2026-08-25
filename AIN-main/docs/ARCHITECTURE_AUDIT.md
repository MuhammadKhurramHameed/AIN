# Architecture Audit

Audited against the "Master Claude Code Implementation Prompt — National AI Capacity Building LMS" (128-section enterprise spec). This document is deliberately honest about the gap between that spec and what exists — the spec describes a multi-quarter enterprise platform; what's built so far is a working, lightweight MVP covering the core LMS + Kanban + reporting + regional-analytics slice.

## 1. Current architecture (as of this audit)

**Stack**: Express + TypeScript + Mongoose (MongoDB) + Socket.io, single monolithic API process. Vite + React + TypeScript + Tailwind SPA. `mongodb-memory-server` for local dev (no Docker/WSL available in this environment); production should point `MONGO_URI` at a real MongoDB.

**Auth**: JWT in httpOnly cookie, bcrypt password hashing. No MFA, no refresh-token rotation, no SSO/OIDC/SAML.

**Roles implemented**: `super_admin`, `moitt_staff`, `consortium_partner_admin`, `consortium_partner_staff`, `content_admin`, `content_reviewer`, `tutor`, `trainee` — a flat role enum with a delegation-rules table (who may create whom), not full RBAC/ABAC with custom roles or resource-scoped permissions. `permissions: string[]` exists on `User` but is not yet enforced anywhere (`requirePermission` middleware exists, unused).

**Domain modules present**: Users, ConsortiumPartner, Track, Course, Lesson, Enrollment, Quiz/QuizAttempt, Certificate, KanbanBoard/KanbanCard, Report, ActivityLog (live feed).

**Modules the spec calls for that do not exist yet**: Organizations (multi-tenant), Programmes (as a distinct entity above Tracks), Cohorts, Attendance, ContentBlocks/content versioning, AIConversations, AIUsage, Integrations, Workflows, Documents/embeddings, AuditLogs (a dedicated immutable collection — activity feed is not audit-grade), analyticsSnapshots.

**Dashboard/analytics**: Real MongoDB aggregations (no synthetic numbers), computed live, with a lookup-free pattern specifically engineered to stay fast at 20k+ trainee scale (a `$lookup`-based version measured 6.8s; the fixed version measures ~150ms — documented in this session's history, not restated here). Regional density map uses real Pakistan ADM1 boundaries (geoBoundaries, CC-BY 4.0), not a placeholder.

**Real-time**: Socket.io, two namespaces (`/kanban`, `/activity`), each scoped by role/org via room membership — not a generic pub/sub, but genuinely live (verified end-to-end, not decorative).

**AI**: none. Zero AI/LLM code existed before this pass.

**Integrations**: none. Zero external-service connectors existed before this pass.

**Infrastructure**: no Redis, no queues, no CDN, no object storage abstraction (file uploads aren't implemented at all yet — no lesson attachments beyond a URL field), no Kubernetes manifests, no CI/CD pipeline, no OpenTelemetry, no load tests, no automated test suite of any kind.

**Frontend structure**: one route tree with role-based nav visibility (`NAV_BY_ROLE`) and server-side `requireRole` enforcement on every mutating endpoint — authorization is real (verified: a trainee login was blocked from `GET /api/reports` with 403 during this session), not merely hidden UI. Not yet organized into the spec's `/learner /trainer /staff /admin` portal structure.

## 2. What this pass adds

Per the user's explicit architectural priority — the Provider → Model → Capability abstraction, and treating AI/integrations as an admin-only control plane rather than scattering direct provider calls through business logic — this pass adds:

- **AI Gateway**: `AIProvider` → `AIModel` → capability routing → adapter → usage log. Real OpenAI-compatible adapter (covers OpenAI, Azure OpenAI via `baseUrl` override, Ollama, vLLM, any compatible endpoint) and a real Anthropic adapter, both using `fetch` directly (no SDK dependency — keeps the gateway inspectable and light). No business module calls a provider SDK directly; everything routes through `services/ai/gateway.ts`.
- **AI Control Center**: Super-Admin-only provider/model CRUD, masked API keys (AES-256-GCM at rest, never returned to the client), a real "test connection" action (actually calls the provider), and a usage log with real aggregated stats.
- **One real AI-consuming feature** — a lesson-scoped "Ask AI" assistant, context-limited to that lesson's actual stored content (not fabricated retrieval, not a fake chatbot). If no provider is configured, it returns a clear "AI isn't configured yet" response rather than a fake answer.
- **Integration model** (structural pattern) with one real implementation — SMTP email via `nodemailer`, with a genuine connection-test (`transporter.verify()`), proving the `IntegrationProvider` interface pattern end-to-end rather than shipping placeholder buttons for a dozen unconfigured connectors.
- **4-portal information architecture** — Learner / Trainer / Programme & Staff / Super Admin — reflected in navigation grouping and portal branding per role, with `Administration → AI & Integrations` reachable only from the Super Admin portal.

## 3. Explicitly deferred (not built this pass, and why)

Building these now, without a real workload behind them, would mean either weeks of speculative infrastructure or exactly the "fake integration/mock feature" anti-pattern the source spec itself prohibits (§102–103). Each is a reasonable next increment once there's real usage to justify it:

| Area | Why deferred |
|---|---|
| Redis / BullMQ queues | No workload yet that needs async processing at the volume that would justify it (current bulk operations — 20k-record seeding — already complete in seconds via batched `insertMany`). |
| Video transcoding / CDN / object storage | No video upload feature exists yet; building the pipeline before the feature would be speculative. |
| RAG / embeddings / vector search | The "Ask AI" feature uses direct lesson-content context instead — honest for the current content volume (dozens of lessons, not thousands of documents where retrieval becomes necessary). |
| Multi-tenant Organizations/Programmes hierarchy | Current single-programme (MoITT) scope doesn't yet need it; the data model doesn't preclude adding it later. |
| MFA / WebAuthn / SSO | No admin credential-compromise incident or compliance deadline driving this yet; flagged as a pre-production hardening item. |
| OpenTelemetry / full observability stack | No production deployment yet to observe. |
| Automated test suite (unit/integration/E2E/load) | Everything shipped this session was manually verified end-to-end in-browser against real data; a real test suite is a legitimate gap for production-readiness, tracked in `IMPLEMENTATION_STATUS.md`. |
| Workflow Engine (configurable automation) | The few workflows that exist (enrollment → completion → certificate, report submit → review) are still simple enough to be direct code paths; a generic engine would be premature abstraction at this scale. |
| Attendance, Cohorts, live-session integration (Zoom/Teams) | Not yet requested; Course/Batch model would need to grow into this. |

## 4. Immediate risk/debt notes

- **API keys**: now encrypted at rest (AES-256-GCM, server-side `ENCRYPTION_KEY`). That key itself is a plain env var, not yet backed by a secrets manager (KMS/Vault) — acceptable for this stage, called out for production hardening.
- **No rate limiting** on the new AI-consuming endpoint yet — a single trainee could hammer `/lessons/:id/ask-ai` and run up provider cost. Flagged in `IMPLEMENTATION_STATUS.md` as a near-term follow-up (Redis-backed rate limiting is the natural fix, tied to the "defer Redis until there's a workload" note above — this is the first real workload that would justify introducing it).
- **`permissions: string[]` on MoITT staff** is still descriptive metadata, not enforced. The AI Control Center is gated by `role === 'super_admin'` only for now (not delegated to permission-holding `moitt_staff`) — simplest correct thing until granular permission enforcement is built.

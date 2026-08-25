# MASTER CLAUDE CODE IMPLEMENTATION PROMPT

## Role

You are acting as a **Principal Full-Stack Architect, Staff Software Engineer, AI Platform Architect, DevSecOps Engineer, LMS Architect, and Technical Lead**.

You are taking over an **already-started MERN + TypeScript LMS implementation**.

Your job is NOT to create a prototype, mockup, proof of concept, or collection of disconnected screens.

Your job is to **inspect the existing repository, understand what has already been implemented, preserve useful work, refactor weak areas, and complete the platform into a production-grade National AI Capacity Building LMS**.

The platform must initially support approximately **20,000 trainees** and must be architected to scale to **200,000+ trainees**, thousands of concurrent users, hundreds/thousands of courses, large assessment volumes, AI workloads, video delivery, certification, reporting, and nationwide operations.

Do not blindly rewrite the existing application.

First understand it.

Then improve it systematically.

---

# 1. PROJECT CONTEXT

The platform is being developed for a national AI capacity-building initiative in Pakistan.

The programme requires:

- 20,000 initial participants
- Nationwide coverage
- All provinces and regions
- Minimum 30% female participation
- 18–24 hours training per participant/category
- 6–12 month programme duration
- Online LMS/portal delivery
- Training, tracking, assessment and reporting
- Qualified trainers
- Certification
- Monitoring and evaluation
- International certification guidance where applicable
- Comprehensive reporting to MoITT
- Accessibility including PWD accessibility
- AI-enabled training and learner support

The target participant categories are:

1. Students / Undergraduates / Fresh Graduates
2. Teaching Professionals
3. Sectoral Professionals
   - Healthcare
   - Agriculture
   - FinTech
   - etc.
4. Mid-level to C-level Private Sector Professionals
5. Government Officials / Public Servants
6. Public Sector / Secretariat Staff
7. General Workforce
8. Entrepreneurs / Startup Founders
9. Freelancers / Remote Workers

---

# 2. COURSE LEVELS

The platform must support at least three major learning levels.

## Level 1 — AI Literacy

Indicative courses:

- Generative AI
- AI Fundamentals
- Prompt Engineering
- AI Productivity
- Responsible AI
- AI for Office / Business

## Level 2 — Applied AI

Indicative courses:

- Python for AI
- Machine Learning
- Data Analytics
- Computer Vision
- NLP
- AI for Healthcare
- AI for Agriculture
- AI for FinTech

## Level 3 — Advanced / Professional

Indicative courses:

- Deep Learning
- Advanced Machine Learning
- LLMs
- MLOps
- AI Engineering
- AI Security
- Responsible AI
- AI Governance

The architecture must allow administrators to create unlimited additional levels, categories, courses, tracks and programmes without code changes.

---

# 3. FIRST ACTION — AUDIT THE EXISTING REPOSITORY

Before changing code:

1. Inspect the complete repository.
2. Identify:
   - frontend architecture
   - backend architecture
   - database models
   - authentication
   - authorization
   - API structure
   - existing LMS modules
   - existing dashboards
   - existing AI functionality
   - existing integrations
   - file handling
   - assessment system
   - reporting
   - deployment configuration
   - tests
3. Identify incomplete features.
4. Identify duplicated code.
5. Identify architectural weaknesses.
6. Identify security vulnerabilities.
7. Identify scalability bottlenecks.
8. Identify missing database indexes.
9. Identify missing error handling.
10. Identify technical debt.
11. Identify mock/demo data.
12. Identify fake APIs or placeholder functionality.

Create:

`/docs/ARCHITECTURE_AUDIT.md`

containing:

- Current architecture
- Existing functionality
- Missing functionality
- Critical defects
- Security issues
- Scalability issues
- Recommended refactoring
- Implementation priority
- Risk assessment

Do NOT delete working functionality simply because you prefer a different implementation.

---

# 4. TECHNOLOGY PRINCIPLES

Remain compatible with the existing MERN + TypeScript direction unless there is a compelling architectural reason to change something.

Preferred stack:

## Frontend

- React
- TypeScript
- Modern routing
- TanStack Query
- Zustand or equivalent lightweight state management
- React Hook Form
- Zod
- Tailwind CSS
- Accessible component system
- Responsive design
- PWA capability
- Internationalization-ready architecture

## Backend

- Node.js
- TypeScript
- Express/Fastify depending on existing architecture
- REST API
- WebSocket/SSE where required
- Zod validation
- Structured logging
- Centralized error handling
- RBAC/ABAC authorization

## Database

- MongoDB
- Mongoose or existing ODM
- Proper compound indexes
- Pagination
- Aggregation pipelines
- Query optimization
- Data lifecycle strategy

## Infrastructure

Design for:

- Docker
- Kubernetes-ready deployment
- Redis
- background workers
- object storage
- CDN
- managed MongoDB
- observability
- horizontal scaling

The application must remain deployable without Kubernetes initially, but must not be architecturally coupled to a single server.

---

# 5. ARCHITECTURAL PRINCIPLE

Build the platform as a **modular monolith with clear domain boundaries first**, while keeping services independently extractable later.

Do NOT prematurely create 30 microservices.

Use clear modules such as:

- Identity
- Organizations
- Programmes
- Learners
- Trainers
- Courses
- Content
- Enrolment
- Learning
- Assessments
- Certifications
- Attendance
- Notifications
- AI
- Integrations
- Analytics
- Reporting
- Gamification
- Support
- Audit
- Administration

Use domain boundaries so high-load components can later be extracted into services.

---

# 6. CORE USER ROLES

Implement granular RBAC.

At minimum:

## Platform

### Super Administrator

Full platform authority.

Can manage:

- organizations
- programmes
- staff
- roles
- permissions
- AI providers
- AI models
- integrations
- system configuration
- feature flags
- security policies
- analytics
- reporting
- audit logs
- billing if introduced
- global content
- certification policies
- system health

### Super Admin Staff

Staff members operating under the Super Admin organization.

Permissions must be granular.

Example:

- Programme Manager
- Operations Manager
- AI Administrator
- Integration Administrator
- Content Administrator
- Assessment Administrator
- Certification Officer
- Monitoring & Evaluation Officer
- Reporting Officer
- Trainer Manager
- Support Officer
- Compliance Officer
- Technical Administrator

Super Admin must be able to create custom roles and permissions.

---

# 7. IMPORTANT AI/INTEGRATION PERMISSION MODEL

This is critical.

AI provider configuration and external integrations MUST NOT be exposed to normal learners, trainers or ordinary programme staff unless explicitly authorized.

Only:

- Super Admin
- authorized Super Admin Staff

may access:

`Administration → AI & Integrations`

This area must contain:

### AI Providers

- OpenAI
- Anthropic
- Google Gemini
- Azure OpenAI
- compatible OpenAI API endpoints
- self-hosted models
- Ollama
- vLLM
- other future providers

### AI Services

Allow administrators to configure different models for different workloads:

- General chatbot
- Course generation
- Question generation
- Summarization
- Translation
- Speech-to-text
- Text-to-speech
- Embeddings
- RAG
- Document extraction
- Vision
- Evaluation
- Recommendation
- Content moderation
- Analytics
- Coding assistance

Never hard-code a single AI vendor.

Implement an abstraction:

`AIProvider → AIModel → AICapability → AIWorkflow`

Example:

```text
AI Provider
   ↓
Model
   ↓
Capability
   ↓
Prompt Template
   ↓
Workflow
   ↓
Application Feature
```

---

# 8. AI PROVIDER GATEWAY

Create an internal AI Gateway.

Example conceptual interface:

```typescript
interface AIProvider {
  generateText(...)
  generateStructuredOutput(...)
  generateEmbedding(...)
  transcribe(...)
  synthesizeSpeech(...)
  analyzeImage(...)
  moderate(...)
}
```

The application should never call OpenAI/Anthropic/Gemini directly from business modules.

Instead:

```text
Course Generator
      ↓
AI Orchestrator
      ↓
AI Gateway
      ↓
Provider Adapter
      ↓
Selected Model
```

This allows the Super Admin to switch models without modifying application code.

---

# 9. AI MODEL ROUTING

Implement configurable model routing.

Example:

```text
Course Generation → Claude
Fast Chat → Gemini Flash
Complex Reasoning → Claude/OpenAI
Embeddings → configured embedding model
Speech → configured STT provider
Voice → configured TTS provider
Translation → configured translation/LLM provider
```

Allow:

- primary model
- fallback model
- maximum tokens
- temperature
- timeout
- retry count
- rate limit
- daily usage limit
- monthly usage limit
- cost tracking

Store AI usage telemetry.

Track:

- provider
- model
- user
- feature
- tokens
- latency
- estimated cost
- success/failure
- request type
- timestamp

---

# 10. AI CONTROL CENTER

Build a dedicated:

`Super Admin → AI Control Center`

Dashboard.

Display:

- total AI requests
- requests today
- token consumption
- estimated cost
- model usage
- provider usage
- failure rate
- latency
- top AI features
- top users/workflows
- quota usage
- errors
- fallback events

Charts must be filterable by:

- date
- provider
- model
- programme
- course
- feature
- organization
- user category

---

# 11. AI FEATURES — LEARNER

The learner must receive AI assistance throughout the learning journey.

## AI Learning Assistant

Context-aware chatbot.

It should understand:

- current programme
- current course
- current module
- current lesson
- learner level
- learner progress
- assessment history
- approved course materials

The AI must answer using authorized course knowledge.

Use RAG rather than blindly allowing the model to hallucinate course-specific information.

Provide:

- Ask AI
- Explain this
- Simplify this
- Give example
- Quiz me
- Give hint
- Summarize
- Translate
- Create flashcards
- Generate practice questions
- Explain my mistake

---

# 12. AI TUTOR

Create an AI tutor for every course.

Features:

- contextual conversation
- Socratic questioning
- adaptive difficulty
- hints
- examples
- misconceptions
- personalized explanations
- multilingual assistance
- learner-level adaptation
- source citations to course material

The AI tutor must NOT directly reveal answers to active graded assessments unless policy explicitly allows it.

---

# 13. AI COURSE GENERATOR

Super Admin/authorized content staff should be able to enter:

- course title
- target audience
- learning objectives
- duration
- difficulty
- level
- subject
- reference documents
- curriculum framework

AI generates:

- course structure
- modules
- lessons
- learning objectives
- lesson content
- examples
- activities
- quizzes
- assignments
- discussion questions
- case studies
- summaries
- flashcards
- glossary
- assessment blueprint

Everything generated by AI must remain **draft content until human approval**.

Implement:

`AI Draft → Human Review → QA → Publish`

Never automatically publish AI-generated educational content.

---

# 14. AI QUESTION GENERATOR

Generate:

- MCQs
- true/false
- multiple-select
- short answer
- scenario questions
- case-based questions
- matching
- ordering
- coding questions where appropriate

Each generated question should have:

- difficulty
- learning objective
- Bloom's taxonomy level
- correct answer
- distractor rationale
- explanation
- source reference
- generated-by-AI flag
- human review status

Implement question quality review.

---

# 15. AI ASSESSMENT ENGINE

Build adaptive assessment capability.

The system should eventually support:

```text
Learner performance
        ↓
Knowledge estimate
        ↓
Difficulty selection
        ↓
Next question
        ↓
Performance update
        ↓
Recommended learning
```

Do not make AI the sole grading authority for high-stakes assessments.

Maintain deterministic grading where possible.

---

# 16. AI PERSONALIZED LEARNING

Build a learner profile containing:

- completed courses
- scores
- assessment history
- time spent
- weak topics
- strong topics
- engagement
- attendance
- learning pace
- preferred language
- learning preferences
- certification status

AI can recommend:

- next course
- remedial lessons
- practice quizzes
- additional resources
- certification paths
- learning plans

---

# 17. AI EARLY-WARNING SYSTEM

Create:

`AI Learner Risk Engine`

Identify learners potentially at risk of:

- dropping out
- low assessment performance
- low engagement
- incomplete courses
- certification failure

Provide explainable reasons.

Example:

> "Learner engagement declined 42% over the last two weeks and assessment performance decreased from 78% to 61%."

Do NOT create opaque or punitive automated decisions.

AI predictions should assist programme staff, not make irreversible decisions.

---

# 18. AI CONTENT ASSURANCE

Create AI-assisted content QA.

Check:

- factual consistency
- duplicate content
- broken references
- reading level
- learning objective alignment
- assessment alignment
- potentially ambiguous questions
- inappropriate content
- accessibility
- spelling/grammar
- outdated information
- hallucinated references

Return a quality report before publication.

---

# 19. AI TRANSLATION

Architecture must support multilingual delivery.

At minimum prepare for:

- English
- Urdu

Design for future:

- Punjabi
- Sindhi
- Pashto
- Balochi
- Arabic
- other languages

Translation must preserve:

- formatting
- educational terminology
- questions
- answer choices
- captions
- metadata

Maintain translation versions rather than overwriting the original.

---

# 20. AI VOICE / SPEECH

Prepare an AI media pipeline supporting:

- speech-to-text
- text-to-speech
- subtitles
- captions
- transcript generation
- audio summaries
- AI narration

Keep provider configuration restricted to Super Admin/authorized staff.

---

# 21. AI KNOWLEDGE BASE / RAG

Build an enterprise RAG system.

Documents may include:

- course PDFs
- curriculum documents
- government policies
- programme guidelines
- trainer materials
- FAQs
- approved knowledge resources

Pipeline:

```text
Upload
 ↓
Virus Scan
 ↓
Extract
 ↓
Normalize
 ↓
Chunk
 ↓
Metadata
 ↓
Embedding
 ↓
Vector Index
 ↓
RAG Retrieval
 ↓
AI Response
```

Every document must include access-control metadata.

A learner must never retrieve:

- confidential staff documents
- unpublished course content
- assessment answer keys
- administrator documents
- other learners' information

---

# 22. AI INTEGRATION MARKETPLACE / CONNECTOR SYSTEM

Create a Vibly-style centralized integration architecture.

Do not expose this to ordinary users.

Build:

`Super Admin → Integrations`

with categories:

### AI

- OpenAI
- Anthropic
- Gemini
- Azure OpenAI
- custom OpenAI-compatible providers
- local/self-hosted LLMs

### Communication

- Email
- SMS
- WhatsApp where legally/technically supported
- push notifications

### Productivity

- Google Workspace
- Microsoft 365
- Google Calendar
- Microsoft Calendar

### Meetings

- Zoom
- Microsoft Teams
- Google Meet

### Storage

- AWS S3
- Azure Blob
- Google Cloud Storage
- compatible S3 storage

### Analytics

- Power BI
- Looker/BI-compatible exports
- webhooks

### Identity

- Google OAuth
- Microsoft Entra ID
- SAML
- OIDC

### Automation

- Webhooks
- Zapier-compatible webhook architecture
- Make-compatible webhook architecture

### LMS interoperability

- SCORM
- xAPI
- LTI 1.3

Each integration should have:

- enabled/disabled
- credentials
- configuration
- health status
- last successful sync
- last error
- logs
- retry
- permissions
- webhook configuration

Credentials MUST be encrypted.

Never expose secrets to frontend code.

---

# 23. INTEGRATION SDK

Create a connector abstraction.

Example:

```typescript
interface IntegrationProvider {
  connect()
  disconnect()
  testConnection()
  getStatus()
  execute()
  handleWebhook()
}
```

This makes future integrations pluggable.

---

# 24. LEARNER PORTAL

Build a premium learner experience.

Dashboard:

- welcome
- current courses
- progress
- next lesson
- upcoming assessments
- certificates
- recommended learning
- AI tutor
- achievements
- announcements
- notifications
- deadlines
- learning streak

---

# 25. COURSE PLAYER

Build a modern course player supporting:

- video
- audio
- PDF
- presentations
- text
- interactive content
- embedded content
- quizzes
- assignments
- surveys
- SCORM
- xAPI
- external resources
- AI tutor

Track:

- lesson started
- lesson completed
- video watched
- watch percentage
- time spent
- assessment attempt
- assessment score
- resource opened
- course completed

Use event-based learning telemetry.

---

# 26. TRAINER PORTAL

Trainer dashboard:

- assigned courses
- assigned cohorts
- learners
- attendance
- assessments
- grading
- announcements
- discussions
- learner performance
- AI-generated insights
- content access
- live sessions
- reports

Trainers must NOT have access to:

- global AI provider configuration
- API keys
- system integrations
- platform secrets
- Super Admin settings

unless explicitly granted.

---

# 27. TRAINER MANAGEMENT

Support:

- trainer onboarding
- trainer verification
- qualifications
- CV
- experience
- AI expertise
- subject expertise
- province
- availability
- assigned courses
- performance
- ratings
- workload

Validate minimum trainer requirements:

- 16 years education
- relevant IT/CS/relevant qualification
- 3–5 years relevant/AI experience

The exact eligibility rules must be configurable.

---

# 28. PROGRAMME MANAGEMENT

Programme managers should be able to configure:

- programme
- participant categories
- curriculum
- courses
- cohorts
- trainers
- schedules
- provinces
- districts
- targets
- enrolment rules
- completion requirements
- certification rules

---

# 29. TRAINEE REGISTRATION

Support:

- individual registration
- bulk registration
- CSV import
- API registration
- invitation links
- organizational registration

Capture configurable demographic/programme information including:

- name
- email
- phone
- province
- district
- city
- gender
- age group
- occupation
- organization
- participant category
- education
- AI experience
- accessibility requirements where voluntarily provided
- preferred language

Implement data minimization and privacy controls.

---

# 30. NATIONAL OUTREACH

Create geographic reporting:

- Pakistan
- province
- region
- district
- city

Dashboard:

- registered
- active
- completed
- certified
- dropout
- female participation
- category distribution
- province distribution
- district distribution

Map visualization should support drill-down.

---

# 31. GENDER INCLUSION

Build configurable programme KPI:

`Minimum Female Participation = 30%`

Dashboard should show:

- target
- achieved
- gap
- trend
- province-level distribution
- category-level distribution

Allow alerts when participation falls below configurable thresholds.

---

# 32. PWD ACCESSIBILITY

Follow WCAG 2.2 AA principles.

Support:

- keyboard navigation
- screen readers
- semantic HTML
- captions
- transcripts
- accessible forms
- contrast
- focus management
- alt text
- scalable typography
- reduced motion
- accessible assessments

Run automated accessibility testing.

---

# 33. ASSESSMENT ENGINE

Create a full assessment platform.

Support:

- question bank
- exams
- quizzes
- assignments
- practical assessments
- randomized questions
- randomized answers
- question pools
- difficulty levels
- timed assessments
- attempt limits
- pass marks
- grading
- manual review
- automated grading
- moderation
- reattempts

---

# 34. EXAM SECURITY

Prepare architecture for:

- question randomization
- answer randomization
- attempt locking
- time synchronization
- server-side timer
- autosave
- anti-cheat telemetry
- browser/device telemetry where legally appropriate
- optional proctoring integration

Do not implement invasive surveillance by default.

---

# 35. CERTIFICATION

Build complete certification management.

Certificate lifecycle:

```text
Completion
 ↓
Eligibility Check
 ↓
Assessment Validation
 ↓
Certificate Generation
 ↓
Unique Certificate ID
 ↓
QR Code
 ↓
Verification URL
 ↓
Issued
```

Certificate verification must work publicly without exposing private learner information.

Support:

- certificate templates
- logos
- signatures
- expiry
- revocation
- reissue
- verification
- QR code
- downloadable PDF

---

# 36. INTERNATIONAL CERTIFICATIONS

Create an integration-ready certification recommendation system.

For a learner/course:

AI can recommend relevant certifications based on:

- course
- skill
- learner level
- assessment
- career path

Examples may include international AI/cloud/data certifications.

Do not hard-code commercial claims.

Make certification providers configurable.

---

# 37. ATTENDANCE

Support:

- live online attendance
- session attendance
- trainer marking
- automated attendance
- join/leave events
- attendance percentage
- minimum attendance requirements

Attendance must integrate with certification eligibility.

---

# 38. LIVE LEARNING

Architecture should support integration with:

- Zoom
- Microsoft Teams
- Google Meet
- future video platforms

Store:

- session
- trainer
- cohort
- participants
- attendance
- recording reference
- transcript
- materials

---

# 39. GAMIFICATION

Optional but recommended.

Support:

- XP
- badges
- streaks
- achievements
- leaderboards
- course milestones
- certificates

Make gamification configurable at programme level.

---

# 40. NOTIFICATION ENGINE

Centralized notification service.

Channels:

- in-app
- email
- SMS
- push
- WhatsApp where configured

Events:

- registration
- enrollment
- course assignment
- assessment
- deadline
- reminder
- completion
- certificate
- trainer assignment
- announcement

Create template management.

---

# 41. WORKFLOW ENGINE

Build configurable workflows.

Examples:

```text
Learner registers
 → verification
 → category assignment
 → programme enrollment
 → course assignment
 → welcome notification
```

Another:

```text
Course completed
 → assessment completed
 → attendance validated
 → eligibility checked
 → certificate generated
 → learner notified
```

Another:

```text
Learner inactive for 7 days
 → risk detected
 → reminder
 → escalation
 → staff dashboard alert
```

Workflows must be configurable without modifying core business logic.

---

# 42. ANALYTICS

Build a comprehensive analytics engine.

Metrics:

- registrations
- active users
- DAU/WAU/MAU
- enrolments
- course starts
- course completion
- assessment attempts
- average scores
- pass rates
- dropout
- time spent
- attendance
- certification
- AI usage
- female participation
- regional distribution
- trainer performance
- course performance

---

# 43. EXECUTIVE DASHBOARD

Create a high-level MoITT dashboard.

Show:

- 20,000 target
- current participants
- completion
- certification
- female participation
- province coverage
- course performance
- trainer capacity
- attendance
- assessment performance
- dropout
- AI utilization
- programme health

Everything must support:

- filters
- date ranges
- programme
- province
- category
- gender
- course
- trainer

---

# 44. REPORTING

Generate:

- daily reports
- weekly reports
- monthly reports
- programme reports
- province reports
- gender reports
- trainer reports
- course reports
- assessment reports
- certification reports

Exports:

- CSV
- XLSX
- PDF
- JSON

Support scheduled reports.

---

# 45. REPORT BUILDER

Super Admin staff should be able to create custom reports.

Allow:

- dimensions
- metrics
- filters
- grouping
- sorting
- charts
- export
- scheduled delivery

Do not expose raw database access to staff.

---

# 46. AUDIT LOGGING

Everything sensitive must be auditable.

Record:

- actor
- role
- action
- resource
- old value
- new value
- IP
- user agent
- timestamp
- request ID

Audit:

- login
- logout
- role changes
- permission changes
- AI configuration
- integration configuration
- course publication
- assessment changes
- certificate issuance
- learner data changes
- bulk imports
- exports

Audit logs must be immutable from ordinary application interfaces.

---

# 47. SECURITY

Implement enterprise-grade security.

Requirements:

- OWASP ASVS principles
- secure authentication
- MFA for administrators
- RBAC
- least privilege
- rate limiting
- brute-force protection
- secure sessions
- JWT rotation where applicable
- refresh-token security
- CSRF protection where applicable
- XSS protection
- NoSQL injection prevention
- SSRF protection
- file upload validation
- malware scanning architecture
- secure headers
- CORS
- secrets management
- encryption at rest
- TLS
- audit logs

Never store:

- passwords in plaintext
- API keys in source code
- provider secrets in frontend
- sensitive tokens in logs

---

# 48. ADMIN MFA

Super Admin and privileged staff must support MFA.

Prefer:

- TOTP
- WebAuthn/passkeys
- recovery codes

Make MFA policy configurable.

---

# 49. DATA PRIVACY

Implement privacy-by-design.

Provide:

- data retention policies
- export
- correction
- deletion workflows where legally applicable
- consent records
- privacy notices
- data access logging
- configurable retention

Do not expose unnecessary learner information to trainers or other learners.

---

# 50. FILE MANAGEMENT

Create secure object storage abstraction.

Support:

- S3-compatible storage
- Azure Blob
- Google Cloud Storage

Never store large videos/PDFs directly in MongoDB.

Store metadata in MongoDB and binary assets in object storage.

Use signed URLs.

---

# 51. VIDEO ARCHITECTURE

Do not stream large video files directly through the Node.js server.

Use:

```text
Upload
 ↓
Object Storage
 ↓
Transcoding
 ↓
HLS/DASH
 ↓
CDN
 ↓
Learner
```

Prepare for:

- adaptive bitrate
- thumbnails
- captions
- transcripts
- chapters
- playback analytics

---

# 52. SEARCH

Implement global search.

Search:

- courses
- lessons
- users
- trainers
- documents
- assessments
- certificates
- reports

Prepare abstraction for:

- MongoDB Search
- Elasticsearch/OpenSearch

Do not build expensive full-text queries that will collapse at scale.

---

# 53. SCALABILITY — 200,000 LEARNERS

Design for:

- 200,000+ registered users
- 20,000+ concurrent sessions eventually
- large assessment bursts
- mass notifications
- video traffic
- AI requests
- reporting workloads

Never perform expensive analytics synchronously in API requests.

Use:

```text
API
 ↓
Event
 ↓
Queue
 ↓
Worker
 ↓
Aggregation
 ↓
Analytics Store/Cache
```

Use Redis for:

- caching
- queues
- rate limiting
- distributed locks
- session-related workloads where appropriate

Use background workers for:

- emails
- notifications
- certificate generation
- reports
- AI jobs
- document processing
- embeddings
- video processing
- bulk imports
- exports

---

# 54. QUEUE ARCHITECTURE

Implement BullMQ or equivalent if compatible with the current stack.

Queues should include separate workload classes:

- email
- notifications
- AI
- document-processing
- embeddings
- reports
- certificates
- imports
- exports
- analytics
- media

Implement:

- retries
- exponential backoff
- dead-letter handling
- idempotency
- job status
- monitoring

---

# 55. CACHING

Use layered caching.

Cache:

- course catalog
- public certificate verification
- configuration
- frequently accessed dashboards
- permission metadata
- feature flags

Do not cache sensitive learner data indiscriminately.

Implement cache invalidation strategies.

---

# 56. DATABASE DESIGN

Design normalized domain models while using MongoDB appropriately.

Major collections:

- users
- roles
- permissions
- organizations
- programmes
- participantCategories
- courses
- modules
- lessons
- contentBlocks
- enrollments
- cohorts
- trainers
- assessments
- questions
- attempts
- answers
- progress
- attendance
- certificates
- notifications
- AIConversations
- AIUsage
- documents
- embeddings metadata
- integrations
- workflows
- events
- auditLogs
- reports
- analyticsSnapshots

Add proper indexes.

Avoid unbounded arrays inside documents.

Do not store unlimited events inside a learner document.

---

# 57. EVENT-DRIVEN LEARNING TELEMETRY

Create a learning event model.

Examples:

```text
COURSE_STARTED
MODULE_STARTED
LESSON_STARTED
LESSON_COMPLETED
VIDEO_STARTED
VIDEO_PROGRESS
VIDEO_COMPLETED
QUIZ_STARTED
QUIZ_COMPLETED
ASSESSMENT_STARTED
ASSESSMENT_SUBMITTED
COURSE_COMPLETED
CERTIFICATE_ISSUED
AI_TUTOR_USED
RESOURCE_VIEWED
```

Use these events to power analytics.

---

# 58. API DESIGN

Implement versioned APIs:

`/api/v1/...`

Use consistent:

- response structure
- error codes
- validation
- pagination
- sorting
- filtering
- authorization
- request IDs

Document APIs using OpenAPI.

---

# 59. FRONTEND ARCHITECTURE

Separate portals:

```text
/learner
/trainer
/staff
/admin
```

Do not merely hide UI buttons.

Authorization must be enforced server-side.

Build reusable:

- tables
- forms
- charts
- modals
- drawers
- filters
- pagination
- file upload
- rich text editor
- video player
- assessment components

---

# 60. SUPER ADMIN PORTAL

The Super Admin portal should feel like an enterprise control plane.

Sections:

### Dashboard

### Users

### Staff

### Roles & Permissions

### Programmes

### Participant Categories

### Courses

### Content

### Trainers

### Cohorts

### Enrollments

### Assessments

### Certificates

### Attendance

### AI Control Center

### AI Models

### AI Prompt Templates

### AI Knowledge Base

### AI Usage

### Integrations

### Workflows

### Notifications

### Analytics

### Reports

### Audit Logs

### Security

### System Health

### Feature Flags

### System Configuration

---

# 61. AI PROMPT MANAGEMENT

Do not hard-code important prompts throughout the codebase.

Build:

`Super Admin → AI Prompt Studio`

Allow authorized staff to manage:

- system prompts
- tutor prompts
- course generation prompts
- question generation prompts
- summarization prompts
- translation prompts
- assessment feedback prompts

Support:

- versioning
- activation
- rollback
- testing
- variables
- model selection
- temperature
- token limits

Example:

```text
Prompt v1
Prompt v2
Prompt v3 → Active
```

Every AI response should be traceable to prompt version where practical.

---

# 62. AI EVALUATION LAB

Build an internal AI evaluation area.

Staff can test:

- model A vs model B
- prompt A vs prompt B
- response quality
- latency
- cost
- factuality
- relevance

Support evaluation datasets.

This is particularly important because this is an AI-capacity-building programme.

---

# 63. AI GUARDRAILS

Implement:

- input validation
- output moderation
- PII detection where appropriate
- prompt injection defenses for RAG
- tool permission boundaries
- retrieval access controls
- maximum token limits
- rate limiting
- model allowlists
- blocked topics/configuration
- logging

Never allow an LLM to directly execute privileged system actions without authorization and explicit tool boundaries.

---

# 64. MCP-READY ARCHITECTURE

Prepare the AI layer for Model Context Protocol-style integrations.

Do not make MCP mandatory for the MVP.

Create a tool abstraction:

```text
AI Agent
 ↓
Tool Registry
 ↓
Authorized Tool
 ↓
Execution
 ↓
Audit
```

Tools may eventually include:

- course search
- learner progress
- knowledge base search
- report generation
- course recommendation
- assessment analysis

Every tool requires:

- permission
- schema
- validation
- audit
- rate limit

An AI agent must never receive unrestricted database access.

---

# 65. AI AGENTS

Build the architecture to support future specialized agents.

Potential agents:

### Learner Tutor Agent

Helps learners understand content.

### Course Authoring Agent

Helps staff create courses.

### Assessment Agent

Generates/reviews assessments.

### Programme Analytics Agent

Explains programme metrics.

### Support Agent

Handles learner support questions.

### Operations Agent

Helps staff identify operational issues.

### Knowledge Agent

Answers questions from approved institutional knowledge.

Agents must operate within role-specific tools and permissions.

---

# 66. HUMAN-IN-THE-LOOP

AI must assist humans rather than silently replacing important decisions.

Require human approval for:

- course publication
- high-stakes assessment changes
- certification policy
- programme policy
- official reports
- sensitive communications
- AI-generated institutional content

---

# 67. CONTENT VERSIONING

Everything educational must be versioned.

Support:

- draft
- review
- approved
- published
- archived

Example:

```text
Course v1.0
Course v1.1
Course v2.0
```

Learner historical records must remain associated with the version they actually consumed.

---

# 68. CONTENT WORKFLOW

Implement:

```text
Author
 ↓
AI Assistance
 ↓
Draft
 ↓
Reviewer
 ↓
QA
 ↓
Approval
 ↓
Publish
 ↓
Analytics
 ↓
Revision
```

---

# 69. BULK OPERATIONS

Because of the national scale, every major administrative operation should support bulk actions.

Examples:

- bulk import users
- bulk enrollment
- bulk course assignment
- bulk trainer assignment
- bulk certificate generation
- bulk notifications
- bulk export

Never block the HTTP request for large bulk operations.

Use background jobs.

---

# 70. IMPORT VALIDATION

CSV imports should:

- validate schema
- preview records
- detect duplicates
- validate emails
- validate categories
- validate geography
- show errors
- allow correction
- process asynchronously

Return an import report.

---

# 71. SUPPORT CENTER

Create support functionality.

Learners can:

- create tickets
- ask questions
- attach files
- track status

Staff can:

- assign
- categorize
- prioritize
- respond
- escalate

AI may suggest responses but human staff remain responsible.

---

# 72. ANNOUNCEMENTS

Support:

- national announcements
- programme announcements
- course announcements
- cohort announcements
- trainer announcements

Target by:

- province
- category
- course
- cohort
- role
- gender where appropriate for programme communications

---

# 73. FEATURE FLAGS

Implement feature flags for:

- AI tutor
- adaptive learning
- gamification
- integrations
- new dashboard
- beta features

Super Admin can enable features by:

- global
- programme
- cohort
- user group

---

# 74. OBSERVABILITY

Implement:

- structured logs
- metrics
- tracing
- health checks
- readiness checks
- liveness checks

Monitor:

- API latency
- error rate
- DB latency
- Redis
- queue depth
- worker health
- AI latency
- AI errors
- storage
- CPU
- memory

Prepare OpenTelemetry-compatible architecture.

---

# 75. SYSTEM HEALTH DASHBOARD

Super Admin:

```text
API              HEALTHY
MongoDB          HEALTHY
Redis            HEALTHY
Workers          HEALTHY
AI Gateway       HEALTHY
Storage          HEALTHY
Email            HEALTHY
SMS              HEALTHY
Notifications    HEALTHY
Search           HEALTHY
```

Show:

- uptime
- latency
- error rate
- queue backlog
- provider status

---

# 76. BACKUP / DISASTER RECOVERY

Design for:

- automated MongoDB backups
- point-in-time recovery where supported
- object-storage versioning
- configuration backup
- disaster recovery procedures

Document:

- RPO
- RTO
- restore procedure

---

# 77. TESTING

Do not consider the system complete without tests.

Implement:

### Unit tests

Business logic.

### Integration tests

API/database.

### End-to-end tests

Critical user journeys.

### Security tests

Authorization and injection cases.

### Accessibility tests

Critical frontend paths.

### Load tests

At minimum simulate:

- 1,000 users
- 5,000 users
- 10,000 users
- eventual 20,000-user workloads

Prepare test scenarios for 200,000 registered users with realistic concurrency rather than pretending all 200,000 are simultaneously active.

---

# 78. CRITICAL E2E FLOWS

Automate:

### Learner

Registration → Login → Enrollment → Course → Lesson → Quiz → Assessment → Completion → Certificate

### Trainer

Login → Course → Cohort → Attendance → Assessment → Learner Analytics

### Staff

Login → Programme → Cohort → Learners → Reports

### Super Admin

Login → MFA → User → Role → AI Provider → Integration → Audit

### AI

Course → AI Tutor → RAG → Response → Usage Logging → Audit

---

# 79. PERFORMANCE REQUIREMENTS

Set performance targets.

Typical API:

- p95 < 500ms for normal CRUD operations
- p99 monitored

AI requests:

- asynchronous where appropriate
- streaming responses for interactive chat

Large reports:

- asynchronous

Large imports:

- asynchronous

Video:

- CDN delivery

Dashboards:

- cached/pre-aggregated where appropriate

---

# 80. MOBILE EXPERIENCE

The learner experience must be mobile-first.

Prioritize:

- Android browsers
- low-bandwidth networks
- responsive UI
- resumable video
- optimized assets
- lazy loading
- offline-friendly course metadata
- PWA architecture

Prepare future React Native application reuse where appropriate.

---

# 81. LOW-BANDWIDTH MODE

Because nationwide access is required, implement:

- compressed images
- adaptive video
- lazy loading
- resumable downloads
- lightweight pages
- efficient APIs
- pagination
- minimal initial JavaScript
- caching

Avoid shipping huge frontend bundles.

---

# 82. INTERNATIONALIZATION

Use i18n architecture from the beginning.

Never hard-code UI strings.

Prepare RTL support for Urdu/Arabic.

---

# 83. DESIGN SYSTEM

The interface must look like a serious national digital platform.

Avoid:

- generic bootstrap-looking pages
- excessive gradients
- childish LMS aesthetics
- inconsistent cards
- random colors
- inconsistent spacing

Use:

- clear hierarchy
- professional dashboards
- excellent typography
- accessible contrast
- responsive layouts
- data-rich tables
- useful empty states
- meaningful loading states
- skeletons
- clear errors

---

# 84. ERROR HANDLING

Never show raw backend errors to users.

Create standardized errors:

```json
{
  "success": false,
  "error": {
    "code": "COURSE_NOT_FOUND",
    "message": "The requested course could not be found.",
    "requestId": "..."
  }
}
```

Log technical details internally.

---

# 85. SECURITY OF AI INTEGRATIONS

This is mandatory.

API keys must:

- never reach frontend
- never appear in logs
- never be stored plaintext
- be encrypted at rest
- be masked in UI
- support rotation
- support testing

Example UI:

`sk-••••••••••••••••••1234`

---

# 86. API RATE LIMITING

Different limits for:

- anonymous
- learner
- trainer
- staff
- admin
- AI endpoints
- authentication
- public certificate verification

Use Redis-backed distributed rate limiting.

---

# 87. IDEMPOTENCY

Implement idempotency for operations such as:

- certificate issuance
- payment if introduced
- bulk enrollment
- notifications
- AI jobs
- imports

Avoid duplicate processing.

---

# 88. SECURITY MODEL

Think in terms of:

```text
Authentication
     ↓
Identity
     ↓
Role
     ↓
Permission
     ↓
Resource ownership
     ↓
Programme scope
     ↓
Action
```

A trainer assigned to Course A must not automatically access Course B.

A programme staff member for Province A should not automatically see restricted Province B data unless authorized.

---

# 89. MULTI-PROGRAMME / MULTI-TENANT READY

Even if initially deployed for one national programme, architecture should support:

```text
Platform
 ├── Programme A
 ├── Programme B
 ├── Future Government Programme
 └── Future Corporate Programme
```

Keep:

- programme-level configuration
- branding
- courses
- cohorts
- staff
- reports
- AI policies
- certification rules

configurable.

---

# 90. DATA ARCHITECTURE FOR ANALYTICS

Do not make the operational MongoDB database responsible for every analytical query.

Create an analytics abstraction.

Initially:

- MongoDB aggregation
- scheduled snapshots
- Redis caching

Later:

- data warehouse
- ClickHouse
- BigQuery
- Snowflake
- PostgreSQL analytics layer

Design interfaces so migration is possible.

---

# 91. AI COST MANAGEMENT

The platform could generate significant AI expenditure.

Implement:

- per-provider cost tracking
- per-model cost tracking
- per-feature cost
- programme cost
- daily limits
- monthly limits
- budget alerts
- fallback policies

Super Admin dashboard:

```text
AI Budget
Used
Remaining
Projected
Top Features
Top Models
Cost/Learner
```

---

# 92. AI MODEL FAILOVER

If primary provider fails:

```text
Provider A
   ↓ failure
Provider B
   ↓ failure
Provider C
```

Do not silently switch models for high-stakes tasks where model behavior matters.

Log every fallback.

---

# 93. RAG QUALITY

RAG must return:

- relevant source chunks
- source document
- section/page where available
- confidence/relevance information

Learner-facing answers should identify the source when appropriate.

Do not fabricate citations.

---

# 94. AI CONVERSATION MANAGEMENT

Store:

- conversation ID
- user
- course
- lesson
- model
- provider
- prompt version
- messages
- citations
- token usage
- timestamp

Provide conversation history to learners where appropriate.

Allow admins to configure retention.

---

# 95. AI PRIVACY

Do not use learner data to train external models unless explicitly permitted and contractually/legal approved.

Provider configurations must support:

- data retention settings
- zero-training/provider policy where available
- regional endpoint configuration where available

---

# 96. DOCUMENT AI

Allow authorized staff to upload:

- PDFs
- DOCX
- PPTX
- spreadsheets
- images

AI can:

- summarize
- extract learning objectives
- generate course outline
- generate questions
- identify topics
- generate glossary
- translate
- create study notes

Every generated artifact must identify its source document.

---

# 97. AI CONTENT FACTORY

Create an admin workflow:

```text
Upload Source
      ↓
AI Analyze
      ↓
Curriculum Generator
      ↓
Lesson Generator
      ↓
Assessment Generator
      ↓
Translation
      ↓
Voice/Video
      ↓
Human Review
      ↓
Publish
```

This should become a major differentiator of the platform.

---

# 98. RECOMMENDATION ENGINE

Build a recommendation abstraction.

Inputs:

- learner history
- interests
- category
- performance
- career goals
- course prerequisites

Outputs:

- courses
- lessons
- resources
- certifications
- practice activities

Initially use deterministic rules + AI.

Later support ML recommendation models.

---

# 99. PROGRAMME COMMAND CENTER

Create a dedicated operations dashboard.

A programme manager should be able to answer:

- How many registered?
- How many active?
- Where are they?
- Which categories?
- Female participation?
- Which courses are underperforming?
- Which trainers are overloaded?
- Which learners are at risk?
- Who has completed?
- Who needs intervention?
- Which certificates are pending?
- What is the national completion rate?

All from one screen.

---

# 100. TRAINER COMMAND CENTER

Trainer should see:

- today's tasks
- active cohorts
- learner risk
- attendance
- assessment queue
- content
- AI teaching assistant
- upcoming sessions
- messages

---

# 101. LEARNER COMMAND CENTER

Learner should see:

- continue learning
- progress
- AI tutor
- recommended next action
- upcoming assessment
- achievements
- certificates
- announcements

The system should always make the next action obvious.

---

# 102. NO MOCK FEATURES

Critical instruction:

Do NOT implement fake functionality simply to make the UI look complete.

No:

```text
"Coming Soon"
```

where actual functionality is expected.

No fake charts using hard-coded numbers.

No fake AI responses.

No fake certificate verification.

No fake API calls.

No placeholder integration buttons.

If an external service requires credentials, build the real integration and expose configuration status appropriately.

---

# 103. REAL DATA FLOW

Every dashboard must be backed by real database data.

Every button must perform a real operation.

Every form must validate.

Every API must authorize.

Every AI feature must use the configured AI gateway.

Every integration must report real status.

---

# 104. DOCUMENTATION

Create:

```text
/docs
  ARCHITECTURE.md
  ARCHITECTURE_AUDIT.md
  DATABASE.md
  API.md
  AUTHORIZATION.md
  AI_ARCHITECTURE.md
  AI_GOVERNANCE.md
  RAG.md
  INTEGRATIONS.md
  LMS_STANDARDS.md
  SCALABILITY.md
  SECURITY.md
  DEPLOYMENT.md
  OBSERVABILITY.md
  DISASTER_RECOVERY.md
  TESTING.md
  ADMIN_GUIDE.md
  TRAINER_GUIDE.md
  LEARNER_GUIDE.md
```

---

# 105. DATABASE DOCUMENTATION

Document every major collection:

- purpose
- fields
- relationships
- indexes
- lifecycle
- privacy classification

---

# 106. API DOCUMENTATION

Generate OpenAPI documentation.

Document:

- authentication
- roles
- users
- courses
- enrolments
- assessments
- certificates
- AI
- integrations
- reports

---

# 107. DEVOPS

Create production deployment architecture.

Support:

```text
CDN
 ↓
Load Balancer
 ↓
Frontend
 ↓
API instances
 ↓
Redis
 ↓
Workers
 ↓
MongoDB
 ↓
Object Storage
```

AI:

```text
AI Gateway
 ↓
Provider adapters
 ↓
External/self-hosted models
```

---

# 108. CI/CD

Pipeline:

```text
Commit
 ↓
Lint
 ↓
Type Check
 ↓
Unit Tests
 ↓
Integration Tests
 ↓
Security Scan
 ↓
Build
 ↓
Container Scan
 ↓
Deploy Staging
 ↓
E2E Tests
 ↓
Production Approval
 ↓
Deploy
```

---

# 109. ENVIRONMENT MANAGEMENT

Support:

- development
- test
- staging
- production

Never share production secrets with development.

---

# 110. CONFIGURATION

Create typed configuration.

Fail startup if required production configuration is missing.

Never silently use insecure defaults in production.

---

# 111. SECRETS

Prepare integration with:

- AWS Secrets Manager
- Azure Key Vault
- GCP Secret Manager
- Kubernetes Secrets
- Vault

Do not hard-code credentials.

---

# 112. LOGGING

Structured JSON logs containing:

- timestamp
- level
- service
- requestId
- userId where appropriate
- action
- duration
- error code

Never log:

- passwords
- access tokens
- refresh tokens
- API keys
- full sensitive personal data

---

# 113. SECURITY SCANNING

Add:

- dependency scanning
- npm audit equivalent
- SAST
- container scanning
- secret scanning

Fix critical vulnerabilities before release.

---

# 114. CODE QUALITY

Enforce:

- strict TypeScript
- no `any` unless justified
- ESLint
- formatting
- reusable components
- clean architecture
- separation of concerns
- no giant controllers
- no giant React components
- service layer
- repository/data access abstraction where appropriate

---

# 115. FRONTEND SECURITY

Never trust frontend authorization.

For example:

Hiding:

`Admin → AI Providers`

is NOT security.

Backend must reject unauthorized requests.

---

# 116. ADMIN ACTION CONFIRMATIONS

Sensitive operations require confirmation:

- delete user
- revoke certificate
- disable integration
- rotate AI credentials
- publish course
- modify assessment
- bulk enrollment

Use clear impact warnings.

---

# 117. SOFT DELETE

Use soft deletion where historical reporting requires records.

Do not physically delete critical educational history merely because a user account is deactivated.

---

# 118. DATA EXPORT

Authorized users can export only data they are allowed to access.

Large exports must run asynchronously.

Track export events in audit logs.

---

# 119. PUBLIC CERTIFICATE VERIFICATION

Create:

`/verify/{certificateId}`

Public page:

- certificate validity
- course/programme
- issue date
- verification status

Minimize personal information.

QR code points to verification URL.

---

# 120. DESIGN FOR 200K WITHOUT OVERENGINEERING

Important:

Do not build unnecessary distributed complexity just because 200,000 learners is the eventual target.

Build:

- stateless API
- Redis
- queues
- CDN
- object storage
- indexed MongoDB
- background jobs
- caching
- event telemetry
- scalable AI gateway

Then allow horizontal scaling.

---

# 121. IMPLEMENTATION STRATEGY

Implement in phases.

## Phase 0 — Audit

Repository audit.

## Phase 1 — Foundation

- authentication
- authorization
- users
- roles
- permissions
- programmes
- database
- audit

## Phase 2 — LMS Core

- courses
- modules
- lessons
- content
- enrollment
- progress
- learner portal

## Phase 3 — Training Operations

- trainers
- cohorts
- attendance
- schedules
- staff portal

## Phase 4 — Assessments

- question bank
- quizzes
- exams
- grading
- assessment analytics

## Phase 5 — Certification

- eligibility
- certificates
- QR verification

## Phase 6 — AI Platform

- AI Gateway
- provider management
- model management
- AI Tutor
- RAG
- content generation
- question generation
- AI analytics

## Phase 7 — Integrations

- email
- SMS
- meetings
- storage
- SSO
- webhooks
- LMS standards

## Phase 8 — Analytics

- programme dashboard
- executive dashboard
- geographic analytics
- M&E reporting

## Phase 9 — Scale

- Redis
- queues
- workers
- CDN
- load testing
- observability

## Phase 10 — Hardening

- security
- accessibility
- performance
- disaster recovery
- documentation

---

# 122. HOW YOU MUST WORK

Do not ask me to manually specify every missing detail.

Use reasonable enterprise architecture decisions.

When you encounter ambiguity:

1. inspect existing code
2. inspect existing data models
3. infer intent
4. choose a scalable design
5. document the decision
6. implement it

Only ask for clarification when the decision would materially change the business model or cause irreversible data loss.

---

# 123. NEVER BREAK EXISTING FUNCTIONALITY

Before modifying an existing feature:

1. understand it
2. test it
3. refactor safely
4. preserve behavior unless intentionally improving it

Run tests after major changes.

---

# 124. IMPLEMENTATION TRACKER

Maintain:

`/docs/IMPLEMENTATION_STATUS.md`

For every feature:

```text
Feature
Status
Backend
Frontend
Database
Tests
Security
Documentation
Production Ready
```

Use:

- NOT_STARTED
- IN_PROGRESS
- BLOCKED
- COMPLETE
- HARDENING_REQUIRED

---

# 125. DEFINITION OF DONE

A feature is NOT complete merely because the UI exists.

A feature is complete only when:

- database model exists
- backend exists
- authorization exists
- validation exists
- frontend exists
- loading states exist
- error handling exists
- audit requirements are addressed
- tests exist
- documentation exists
- scalability implications are considered

---

# 126. FINAL QUALITY GATE

Before declaring the LMS complete, run a full system review against:

### Functional

- All stakeholder workflows work.

### Security

- No privilege escalation.
- No exposed secrets.
- No unauthorized data access.

### AI

- AI Gateway works.
- Providers are configurable.
- AI usage is tracked.
- RAG permissions are enforced.
- AI-generated content requires review.

### LMS

- Course delivery works.
- Progress works.
- Assessments work.
- Attendance works.
- Certificates work.

### Reporting

- Dashboard numbers reflect real data.

### Scale

- No synchronous heavy operations.
- Background queues work.
- Caching works.
- CDN architecture works.

### Accessibility

- WCAG-oriented implementation.
- Keyboard navigation.
- Screen reader support.
- captions/transcripts.

### Reliability

- retries
- idempotency
- error recovery
- health checks
- observability

---

# 127. IMPORTANT PRODUCT PRINCIPLE

The final system should not feel like:

> "A website with courses."

It should feel like:

> **A national AI learning operating system.**

The platform should connect:

```text
Government Programme
        ↓
Programme Management
        ↓
National Outreach
        ↓
Learner Registration
        ↓
Cohort Management
        ↓
Curriculum
        ↓
AI-Powered Learning
        ↓
Assessment
        ↓
Analytics
        ↓
Certification
        ↓
Career / Certification Guidance
        ↓
Programme Impact Reporting
```

And underneath everything:

```text
Identity
Security
AI Gateway
Integration Gateway
Event System
Analytics
Audit
Observability
```

---

# 128. FINAL INSTRUCTION TO CLAUDE CODE

Start NOW.

Do not start by generating a giant speculative codebase.

First:

1. Inspect repository.
2. Run the existing application.
3. Identify frontend and backend entry points.
4. Inspect environment configuration.
5. Inspect database models.
6. Inspect authentication.
7. Inspect existing LMS functionality.
8. Run existing tests.
9. Produce `ARCHITECTURE_AUDIT.md`.
10. Produce `IMPLEMENTATION_STATUS.md`.
11. Create the target architecture.
12. Identify the highest-value missing foundation.
13. Implement incrementally.
14. Test continuously.
15. Refactor existing code when necessary.
16. Do not introduce unnecessary technology.
17. Do not create fake functionality.
18. Do not leave critical features as placeholders.
19. Keep the application runnable after every major milestone.
20. Maintain production-grade security throughout.

At every stage, think like a **Principal Engineer responsible for a government-scale national platform**, not like a developer completing a coding exercise.

The target is:

**20,000 learners now → 200,000+ learners later**

without redesigning the core platform.

The target experience is:

**modern LMS + AI-native learning + national programme operations + enterprise administration + analytics + certification + integration platform.**

Build it accordingly.
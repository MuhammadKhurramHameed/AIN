# CLAUDE CODE MASTER PROMPT
# NATIONAL AI CAPACITY BUILDING LMS
## FORENSIC AUDIT → GAP ANALYSIS → COMPLETE IMPLEMENTATION → PRODUCTION HARDENING

You are taking over an **existing partially implemented MERN + TypeScript National AI Capacity Building LMS**.

The previous implementation is considered **INCOMPLETE**.

Do NOT assume that a feature is implemented merely because:

- a menu item exists
- a page exists
- a button exists
- a database model exists
- an API route exists
- mock data appears on a dashboard
- a modal opens
- an AI chat window exists
- a configuration screen exists

A feature is implemented ONLY when the complete business workflow works end-to-end.

Your job is to perform a **forensic audit of the existing application and then finish it completely**.

This is not a UI redesign exercise.

This is not a prototype exercise.

This is not a "make the dashboard look complete" exercise.

This is a production implementation task.

---

# 1. PRIMARY OBJECTIVE

Transform the existing application into a complete, production-grade:

> NATIONAL AI CAPACITY BUILDING LMS + AI LEARNING PLATFORM + TRAINING OPERATIONS PLATFORM + ASSESSMENT PLATFORM + CERTIFICATION PLATFORM + PROGRAMME MANAGEMENT PLATFORM + ANALYTICS/M&E PLATFORM + AI/INTEGRATION CONTROL PLANE.

The system must support:

### Initial target

20,000 trainees.

### Future target

200,000+ registered trainees.

The architecture must support horizontal scaling without rewriting the application.

---

# 2. VERY IMPORTANT — DO NOT START CODING

Before changing ANY code:

## Step 1

Inspect the entire repository.

## Step 2

Run the application.

## Step 3

Run backend.

## Step 4

Run frontend.

## Step 5

Run all existing tests.

## Step 6

Inspect the database schema/models.

## Step 7

Inspect every API route.

## Step 8

Inspect every frontend route/page.

## Step 9

Inspect every role and permission.

## Step 10

Inspect every existing integration.

## Step 11

Inspect every AI feature.

## Step 12

Inspect every dashboard and report.

## Step 13

Inspect every workflow.

DO NOT modify anything during the initial audit.

---

# 3. CREATE THE FORENSIC AUDIT

Create:

`/docs/FORENSIC_AUDIT.md`

The audit MUST contain:

## A. Existing functionality

For every module:

- implemented
- partially implemented
- broken
- mocked
- missing
- inaccessible
- insecure
- technically implemented but functionally incomplete

## B. Frontend audit

Inspect:

- routes
- pages
- components
- forms
- tables
- modals
- navigation
- state management
- API calls
- loading states
- error states
- permissions
- responsiveness
- accessibility

## C. Backend audit

Inspect:

- controllers
- services
- repositories
- routes
- middleware
- validation
- authorization
- database queries
- indexes
- background jobs
- integrations
- AI services

## D. Database audit

Inspect:

- collections
- schemas
- relationships
- indexes
- references
- denormalization
- unbounded arrays
- orphaned data
- duplicate data
- missing constraints

## E. Security audit

Check:

- authentication
- authorization
- privilege escalation
- IDOR
- insecure direct object access
- exposed API keys
- JWT security
- session security
- password handling
- rate limiting
- file upload
- injection
- XSS
- CSRF
- CORS
- secrets
- logging
- audit logs

## F. AI audit

Check every AI feature for:

- actual provider integration
- provider abstraction
- model configuration
- API key security
- prompt management
- token tracking
- cost tracking
- rate limiting
- RAG
- citations
- hallucination control
- permissions
- conversation persistence
- model fallback
- AI governance
- human approval

## G. Scalability audit

Check:

- synchronous heavy processing
- database bottlenecks
- missing indexes
- pagination
- N+1 queries
- large MongoDB documents
- video delivery
- report generation
- bulk imports
- notifications
- AI requests
- queue architecture
- caching
- concurrency

---

# 4. CREATE A REQUIREMENTS TRACEABILITY MATRIX

This is mandatory.

Create:

`/docs/REQUIREMENTS_TRACEABILITY_MATRIX.md`

Every requirement must have:

| ID | Requirement | Role | UI | API | DB | Workflow | Tests | Status |
|---|---|---|---|---|---|---|---|---|

Statuses:

- MISSING
- MOCKED
- PARTIAL
- BROKEN
- IMPLEMENTED
- PRODUCTION_READY

Do not use "implemented" unless the complete workflow is verified.

---

# 5. ZERO ASSUMPTIONS

The following are NOT evidence of implementation:

```text
Page exists
Button exists
API endpoint exists
Schema exists
Dashboard exists
Chart exists
AI textbox exists
Integration card exists
```

Evidence must be:

```text
User action
→ Frontend request
→ Authorization
→ Backend validation
→ Database operation
→ Business logic
→ Event/job if required
→ Response
→ Frontend state update
→ Audit
→ Error handling
→ Test
```

---

# 6. BUSINESS REQUIREMENTS FROM THE NATIONAL PROGRAMME

The platform must support:

## Participants

20,000 initial participants.

## Gender

Minimum 30% female participation.

## Coverage

Nationwide:

- Punjab
- Sindh
- Khyber Pakhtunkhwa
- Balochistan
- Islamabad Capital Territory
- AJK
- Gilgit-Baltistan
- other configurable regions

## Duration

18–24 hours per participant/category.

## Programme duration

6–12 months.

## Delivery

Online through LMS/portal.

---

# 7. PARTICIPANT CATEGORIES

These MUST be actual configurable entities, not hard-coded frontend labels.

1. Students / Undergraduates / Fresh Graduates
2. Teaching Professionals
3. Sectoral Professionals
4. Mid-level to C-level Private Sector Professionals
5. Government Officials / Public Servants
6. Public Sector / Secretariat Staff
7. General Workforce
8. Entrepreneurs / Startup Founders
9. Freelancers / Remote Workers

Sectoral professional subcategories must also be configurable:

- Healthcare
- Agriculture
- FinTech
- etc.

---

# 8. THREE-LEVEL CURRICULUM

The curriculum hierarchy must actually exist in the database and UI.

```text
Programme
  ↓
Level
  ↓
Track
  ↓
Course
  ↓
Module
  ↓
Lesson
  ↓
Content
  ↓
Activity
  ↓
Assessment
```

Do NOT flatten everything into courses.

---

# 9. LEVEL 1

AI Literacy:

- Generative AI
- AI Fundamentals
- Prompt Engineering
- AI Productivity
- Responsible AI
- AI for Office / Business

---

# 10. LEVEL 2

Applied AI:

- Python for AI
- Machine Learning
- Data Analytics
- Computer Vision
- NLP
- AI for Healthcare
- AI for Agriculture
- AI for FinTech

---

# 11. LEVEL 3

Advanced / Professional:

- Deep Learning
- Advanced ML
- LLMs
- MLOps
- AI Engineering
- AI Security
- Responsible AI
- AI Governance

All of these must be configurable.

---

# 12. USER AND ROLE ARCHITECTURE

Implement proper RBAC.

Required roles include:

## Learner

Can:

- learn
- take assessments
- view progress
- use permitted AI tools
- obtain certificates
- receive notifications

## Trainer

Can:

- manage assigned teaching activities
- view assigned cohorts
- mark attendance
- grade permitted assessments
- communicate with learners
- view permitted analytics

## Programme Staff

Can:

- manage assigned programmes
- manage cohorts
- manage learners
- assign trainers
- view programme analytics
- generate reports

## Programme Manager

Can manage programme operations.

## Content Staff

Can manage course content.

## Assessment Staff

Can manage question banks and assessments.

## Certification Staff

Can manage certificates.

## M&E Staff

Can manage monitoring/evaluation reports.

## Support Staff

Can manage support tickets.

## Super Admin Staff

Configurable permissions.

## Super Admin

Complete platform control.

---

# 13. CRITICAL AUTHORIZATION REQUIREMENT

Do NOT rely on frontend route protection.

Every protected backend operation must verify:

```text
Authentication
+
Role
+
Permission
+
Programme scope
+
Organization scope
+
Resource ownership/scope
```

Example:

Trainer A assigned to Cohort A must NOT automatically see Cohort B.

Programme Staff for Programme A must NOT automatically access Programme B.

---

# 14. SUPER ADMIN CONTROL PLANE

The Super Admin portal must be materially different from the learner portal.

Required sections:

- Dashboard
- Users
- Staff
- Roles
- Permissions
- Programmes
- Participant Categories
- Curriculum
- Courses
- Content
- Trainers
- Cohorts
- Enrolments
- Attendance
- Assessments
- Question Bank
- Certifications
- Notifications
- AI Control Center
- AI Models
- AI Providers
- AI Prompts
- AI Knowledge Base
- AI Usage
- Integrations
- Workflows
- Analytics
- Reports
- Audit Logs
- Security
- System Health
- Feature Flags
- Configuration

Every section must be functional.

---

# 15. AI MUST BE A PLATFORM, NOT A CHATBOX

The existing implementation must NOT simply add a chatbot and claim "AI integration".

Build an actual AI platform layer.

Architecture:

```text
Application Feature
        ↓
AI Workflow
        ↓
AI Orchestrator
        ↓
AI Gateway
        ↓
Provider Adapter
        ↓
Model
```

---

# 16. AI PROVIDERS

Super Admin / authorized staff only.

Support architecture for:

- OpenAI
- Anthropic
- Google Gemini
- Azure OpenAI
- OpenAI-compatible APIs
- self-hosted models
- Ollama
- vLLM

Do not hard-code providers.

---

# 17. AI MODEL MANAGEMENT

Super Admin can configure:

- provider
- model
- capability
- API credentials
- temperature
- token limits
- timeout
- retries
- fallback
- rate limits
- cost
- status

---

# 18. AI CAPABILITIES

The AI platform must support:

- text generation
- structured output
- embeddings
- RAG
- image understanding
- speech-to-text
- text-to-speech
- translation
- summarization
- question generation
- assessment assistance
- recommendations
- content generation
- moderation

---

# 19. AI PROVIDER SECRETS

API keys:

- never frontend
- never logs
- encrypted at rest
- masked in UI
- rotatable
- auditable

---

# 20. AI CONTROL CENTER

Dashboard:

- requests
- tokens
- estimated cost
- provider
- model
- latency
- errors
- fallback
- usage by programme
- usage by feature
- usage by learner category

---

# 21. AI COST MANAGEMENT

Track:

```text
provider
model
feature
programme
user
tokens
estimated cost
latency
timestamp
status
```

Allow:

- quotas
- budget
- alerts
- limits

---

# 22. AI LEARNER ASSISTANT

Every learner should have access to an appropriate AI assistant based on programme/course permissions.

The AI should understand:

- learner
- programme
- course
- module
- lesson
- progress
- assessment history

---

# 23. COURSE-CONTEXT RAG

AI must answer course-specific questions from approved content.

Architecture:

```text
Course Content
↓
Document Processing
↓
Chunking
↓
Embeddings
↓
Vector Search
↓
Permission Filtering
↓
RAG
↓
LLM
```

A learner MUST NOT retrieve:

- answer keys
- unpublished material
- administrator documents
- other learners' information
- private trainer material

---

# 24. AI TUTOR

Implement:

- Explain
- Simplify
- Example
- Quiz me
- Hint
- Summarize
- Flashcards
- Practice
- Translation
- Socratic learning

The AI must not reveal answers to active assessments unless explicitly permitted.

---

# 25. AI COURSE AUTHORING

Authorized staff can:

1. enter objectives
2. select audience
3. upload source material
4. generate curriculum
5. generate modules
6. generate lessons
7. generate activities
8. generate assessments
9. translate
10. generate summaries
11. review
12. approve
13. publish

AI-generated content must NEVER automatically become published official content.

---

# 26. AI QUESTION GENERATION

Support:

- MCQ
- multi-select
- true/false
- scenario
- case study
- short answer
- matching
- ordering
- coding questions

Metadata:

- difficulty
- Bloom level
- learning objective
- answer
- explanation
- source
- AI-generated
- review status

---

# 27. AI CONTENT REVIEW

AI should check:

- factual consistency
- ambiguity
- duplication
- readability
- objective alignment
- assessment alignment
- accessibility
- potentially outdated content
- inappropriate material

Then human review.

---

# 28. AI PERSONALIZATION

Create learner profile:

- strengths
- weaknesses
- completed courses
- assessment results
- time spent
- engagement
- learning pace

Recommendations:

- next course
- remedial material
- practice
- certification
- learning plan

---

# 29. AI EARLY WARNING

Identify:

- inactivity
- declining scores
- low engagement
- missed deadlines
- dropout risk

The system must explain why the learner was flagged.

AI should assist staff rather than make irreversible decisions.

---

# 30. AI AGENTS

Prepare architecture for:

- Learner Tutor Agent
- Course Authoring Agent
- Assessment Agent
- Analytics Agent
- Support Agent
- Knowledge Agent
- Operations Agent

Agents must use permission-controlled tools.

NO unrestricted database access.

---

# 31. AI TOOL SYSTEM

Implement:

```text
Agent
 ↓
Tool Registry
 ↓
Permission Check
 ↓
Input Validation
 ↓
Tool Execution
 ↓
Audit
```

---

# 32. VIBLY-LIKE INTEGRATION CONTROL

The platform must have a centralized integration control plane.

ONLY:

- Super Admin
- explicitly authorized Super Admin Staff

can access provider/integration configuration.

Learners and ordinary trainers must NOT see API keys, providers or integration administration.

---

# 33. INTEGRATION CATEGORIES

Prepare real connector architecture for:

### AI

- OpenAI
- Anthropic
- Gemini
- Azure OpenAI
- custom OpenAI-compatible providers
- self-hosted models

### Communication

- Email
- SMS
- WhatsApp where appropriate

### Meetings

- Zoom
- Microsoft Teams
- Google Meet

### Identity

- Google
- Microsoft
- OIDC
- SAML

### Storage

- S3
- Azure Blob
- GCS

### Automation

- webhooks
- external workflow platforms

### Analytics

- BI exports
- APIs

---

# 34. INTEGRATION CONNECTOR MODEL

Each connector must have:

- name
- provider
- category
- status
- credentials
- configuration
- scopes
- health check
- test connection
- logs
- retry
- webhook
- last sync
- error state

---

# 35. LMS CORE

Implement fully:

- programme
- curriculum
- courses
- modules
- lessons
- content
- activities
- prerequisites
- enrolment
- progress
- completion

---

# 36. COURSE PLAYER

Support:

- video
- PDF
- audio
- text
- slides
- interactive content
- quizzes
- assignments
- SCORM
- xAPI
- external resources

Track real learner activity.

---

# 37. PROGRESS ENGINE

Progress cannot simply be a manually stored percentage.

Calculate from actual:

- lessons
- activities
- assessments
- required content
- completion rules

Support configurable completion rules.

---

# 38. ENROLMENT ENGINE

Support:

- self enrollment
- staff enrollment
- bulk enrollment
- cohort enrollment
- programme enrollment
- eligibility rules
- prerequisite rules

---

# 39. COHORT MANAGEMENT

Cohorts must support:

- programme
- category
- province
- district
- trainer
- schedule
- learners
- course assignments
- attendance
- performance
- completion

---

# 40. TRAINER MANAGEMENT

Trainer records:

- qualifications
- experience
- specialization
- AI expertise
- province
- availability
- workload
- courses
- cohorts
- performance

Eligibility rules must be configurable.

---

# 41. TRAINER WORKLOAD

System should prevent or flag:

- over-allocation
- conflicting schedules
- excessive cohorts
- insufficient trainer capacity

---

# 42. ATTENDANCE ENGINE

Support:

- session attendance
- trainer attendance marking
- automated attendance
- join/leave events
- attendance percentage
- minimum requirements

Attendance must affect completion/certification where configured.

---

# 43. ASSESSMENT ENGINE

Must support:

- question bank
- quizzes
- exams
- assignments
- practical assessment
- randomization
- question pools
- attempts
- time limits
- pass marks
- grading
- manual review
- automated grading
- moderation

---

# 44. QUESTION BANK

Questions must be reusable.

Support:

- subject
- course
- module
- objective
- difficulty
- Bloom level
- question type
- status
- version

---

# 45. ASSESSMENT SECURITY

Implement:

- server-side timer
- autosave
- randomized questions
- randomized options
- attempt locking
- attempt limits
- submission integrity
- audit trail

---

# 46. CERTIFICATION ENGINE

Certificate eligibility must be calculated from:

- course completion
- required assessments
- pass marks
- attendance
- programme rules

Then:

```text
Eligibility
↓
Certificate Generation
↓
Unique ID
↓
QR
↓
Public Verification
```

---

# 47. PUBLIC CERTIFICATE VERIFICATION

Create:

`/verify/:certificateId`

It must actually query the database.

No hard-coded certificates.

---

# 48. REPORTING

Reports must use real data.

No fake charts.

No hard-coded numbers.

Required:

- registrations
- active learners
- completion
- certification
- gender
- province
- category
- course
- trainer
- attendance
- assessment
- dropout

---

# 49. EXECUTIVE DASHBOARD

MoITT-facing dashboard should answer:

- How many participants?
- Target vs actual?
- Female percentage?
- Province coverage?
- Course completion?
- Certification?
- Dropout?
- Attendance?
- Assessment performance?
- Trainer capacity?
- Programme health?

---

# 50. GEOGRAPHICAL ANALYTICS

Support:

```text
Pakistan
 ↓
Province
 ↓
District
 ↓
City
```

All metrics must be drillable.

---

# 51. GENDER KPI

Show:

```text
Target = 30%
Actual = X%
Gap = X%
Trend = X
```

Support filtering.

---

# 52. REPORT EXPORT

Support:

- CSV
- XLSX
- PDF
- JSON

Large reports MUST be asynchronous.

---

# 53. CUSTOM REPORT BUILDER

Authorized staff should be able to construct reports using:

- dimensions
- metrics
- filters
- grouping
- sorting
- date ranges
- exports

No direct database access.

---

# 54. NOTIFICATION ENGINE

Real notification system.

Channels:

- in-app
- email
- SMS
- push
- WhatsApp where configured

Events:

- registration
- enrollment
- assignment
- deadline
- assessment
- completion
- certificate
- announcement

---

# 55. WORKFLOW ENGINE

Build actual configurable workflows.

Example:

```text
Registration
→ Verification
→ Category
→ Programme
→ Cohort
→ Enrollment
→ Welcome
```

Another:

```text
Course Complete
→ Assessment
→ Attendance
→ Eligibility
→ Certificate
→ Notification
```

Another:

```text
Inactive 7 days
→ Risk
→ Reminder
→ Staff Alert
```

---

# 56. SUPPORT SYSTEM

Implement:

- ticket
- category
- priority
- assignment
- response
- escalation
- status
- attachments
- AI response suggestion

---

# 57. ANNOUNCEMENT SYSTEM

Target:

- national
- programme
- cohort
- course
- participant category

---

# 58. GAMIFICATION

If enabled:

- XP
- badges
- streaks
- achievements
- milestones
- leaderboard

Make configurable.

---

# 59. ACCESSIBILITY

Implement WCAG 2.2 AA-oriented practices.

Verify:

- keyboard
- screen reader
- focus
- captions
- transcripts
- contrast
- forms
- errors
- responsive behavior
- reduced motion
- RTL preparation

---

# 60. MOBILE

The learner portal must work properly on mobile.

Do not merely shrink desktop UI.

Test:

- Android Chrome
- small screens
- tablets
- low bandwidth

---

# 61. LOW-BANDWIDTH

Implement:

- lazy loading
- optimized images
- adaptive video
- compressed assets
- resumable playback
- efficient APIs
- pagination
- caching

---

# 62. VIDEO ARCHITECTURE

Do NOT stream large videos through Node.js.

Use:

```text
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

---

# 63. EVENT SYSTEM

Implement learning events:

- registration
- login
- enrollment
- course started
- module started
- lesson started
- lesson completed
- video progress
- quiz started
- quiz completed
- assessment submitted
- course completed
- certificate issued
- AI used

---

# 64. BACKGROUND JOBS

Heavy tasks MUST NOT run inside normal HTTP requests.

Move these to workers:

- AI
- email
- SMS
- reports
- certificates
- imports
- exports
- document processing
- embeddings
- video processing
- analytics

---

# 65. QUEUE REQUIREMENTS

Implement queues with:

- retry
- exponential backoff
- dead-letter handling
- idempotency
- job status
- monitoring

---

# 66. DATABASE REQUIREMENTS

Audit all MongoDB models.

Look for:

- missing indexes
- unbounded arrays
- duplicated data
- excessive population
- N+1 queries
- missing pagination
- inefficient aggregation
- huge documents

Add indexes based on actual access patterns.

---

# 67. SEARCH

Implement real search.

Search:

- courses
- lessons
- users
- trainers
- documents
- assessments
- certificates

---

# 68. SECURITY

Run a full security audit.

Specifically test:

- IDOR
- broken access control
- privilege escalation
- injection
- XSS
- CSRF
- SSRF
- file upload
- rate limiting
- token theft
- session handling
- password attacks
- exposed secrets

---

# 69. ADMIN MFA

Implement:

- TOTP
- recovery codes
- preferably WebAuthn/passkeys where feasible

Mandatory for Super Admin.

---

# 70. AUDIT LOGGING

Log:

- login
- permission change
- role change
- user modification
- course publication
- assessment changes
- certificate issuance
- AI configuration
- provider configuration
- integration configuration
- bulk operations
- exports
- sensitive data access

---

# 71. NO FAKE IMPLEMENTATION

Search the entire repository for:

```text
TODO
FIXME
Coming Soon
placeholder
mock
dummy
fake
sample
hardcoded
static data
console.log
```

Do NOT automatically delete them.

Determine whether they represent unfinished production functionality.

Replace unfinished functionality where required.

---

# 72. NO HARDCODED BUSINESS DATA

Do not hard-code:

- participant numbers
- gender percentages
- province statistics
- course counts
- certificate counts
- dashboard metrics
- trainer counts

Everything must come from the database/analytics layer.

---

# 73. NO DEAD BUTTONS

Every button must either:

- perform a real action
- navigate to a real working feature

or be intentionally disabled with a clear reason.

No dead buttons.

---

# 74. NO DEAD ROUTES

Every navigation route must resolve to a real functional page.

No empty dashboards.

No fake placeholders.

---

# 75. NO UI-ONLY FEATURES

If a UI feature exists, verify:

```text
Frontend
↕
API
↕
Service
↕
Database
```

---

# 76. API CONTRACT TESTING

For every major endpoint test:

- authentication
- valid request
- invalid request
- unauthorized
- forbidden
- not found
- duplicate
- database failure
- pagination
- filtering

---

# 77. FRONTEND TESTING

Test:

- loading
- empty state
- success
- validation error
- server error
- permission denied
- mobile
- accessibility

---

# 78. E2E TESTS

Create actual browser tests for:

## Learner

```text
Register
→ Login
→ Browse Programme
→ Enroll
→ Start Course
→ Complete Lesson
→ Take Quiz
→ Complete Assessment
→ Receive Certificate
```

## Trainer

```text
Login
→ Assigned Cohort
→ Learners
→ Attendance
→ Assessment
→ Analytics
```

## Staff

```text
Login
→ Programme
→ Cohort
→ Enrollment
→ Reporting
```

## Super Admin

```text
Login
→ MFA
→ User
→ Role
→ AI Provider
→ AI Model
→ Integration
→ Audit
```

---

# 79. AI E2E

Test:

```text
Learner
→ Course
→ AI Tutor
→ Course-specific question
→ RAG
→ Answer
→ Source
→ Usage tracking
```

And:

```text
Staff
→ AI Course Generator
→ Generate
→ Review
→ Approve
→ Publish
```

---

# 80. SCALE TESTING

Prepare load tests for:

- 1,000 users
- 5,000
- 10,000
- 20,000

And stress test architecture toward 200,000 registered users.

Test high-concurrency scenarios:

- login
- course catalog
- course launch
- quiz start
- assessment submission
- dashboard
- certificate verification
- notifications

---

# 81. PERFORMANCE REQUIREMENTS

Normal APIs:

- p95 target <500ms where realistic

Heavy operations:

- asynchronous

AI:

- streaming where appropriate

Reports:

- asynchronous

Video:

- CDN

Dashboards:

- caching/pre-aggregation

---

# 82. OBSERVABILITY

Implement:

- structured logs
- metrics
- tracing
- health checks
- queue monitoring
- AI monitoring
- DB monitoring

---

# 83. SYSTEM HEALTH

Super Admin dashboard:

```text
API
DATABASE
REDIS
QUEUE
WORKERS
AI
STORAGE
EMAIL
SMS
SEARCH
```

with:

- healthy/unhealthy
- latency
- errors
- queue depth

---

# 84. DATA PRIVACY

Implement:

- privacy controls
- retention
- export
- correction
- deletion where applicable
- consent records
- access logging

---

# 85. INTERNATIONALIZATION

Prepare properly for:

- English
- Urdu

with future support for additional languages.

Do not hard-code UI strings.

Support RTL.

---

# 86. DOCUMENT MANAGEMENT

Authorized staff can upload:

- PDF
- DOCX
- PPTX
- XLSX
- images

Pipeline:

```text
Upload
→ Virus Scan
→ Extraction
→ Metadata
→ Chunk
→ Embedding
→ Index
```

---

# 87. CONTENT VERSIONING

Courses and lessons must support:

```text
Draft
→ Review
→ Approved
→ Published
→ Archived
```

Historical learner records must preserve consumed content version.

---

# 88. PROGRAMME CONFIGURATION

Do not hard-code programme rules.

Configure:

- target participants
- duration
- hours
- attendance requirement
- pass marks
- certification rules
- gender KPI
- participant categories
- geography
- completion rules

---

# 89. MULTI-PROGRAMME ARCHITECTURE

The application should eventually support:

```text
Platform
├── National AI Programme
├── Future Government Programme
├── Future Corporate Programme
└── Future International Programme
```

without duplicating the application.

---

# 90. SUPER ADMIN VS STAFF

Create two levels:

## Super Admin

Can configure the platform.

## Super Admin Staff

Can operate assigned areas.

The Super Admin controls exactly what staff can access.

Implement granular permission matrix.

---

# 91. PERMISSION MATRIX

Create:

`/docs/PERMISSION_MATRIX.md`

Example:

| Permission | Learner | Trainer | Staff | Super Staff | Super Admin |
|---|---:|---:|---:|---:|---:|
| View Course | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manage Course | | | configurable | ✓ | ✓ |
| AI Tutor | ✓ | ✓ | ✓ | ✓ | ✓ |
| AI Provider Config | | | | configurable | ✓ |
| API Keys | | | | configurable | ✓ |
| User Management | | | configurable | ✓ | ✓ |
| System Config | | | | | ✓ |

Expand this into a complete permission catalogue.

---

# 92. REQUIREMENT ID SYSTEM

Every major feature should have IDs.

Example:

```text
AUTH-001
AUTH-002

LMS-001
LMS-002

ASSESS-001

CERT-001

AI-001
AI-002

INT-001

REPORT-001

SEC-001
```

Map every ID to:

- implementation
- API
- UI
- tests
- documentation

---

# 93. IMPLEMENTATION ORDER

After forensic audit, implement in this order:

## Priority 1

Foundation:

- auth
- roles
- permissions
- database
- audit
- configuration

## Priority 2

LMS:

- programmes
- curriculum
- courses
- lessons
- enrollment
- progress

## Priority 3

Training operations:

- trainers
- cohorts
- attendance

## Priority 4

Assessment:

- question bank
- assessments
- grading

## Priority 5

Certification.

## Priority 6

AI platform.

## Priority 7

Integrations.

## Priority 8

Analytics/M&E.

## Priority 9

Scale/performance.

## Priority 10

Security/accessibility/hardening.

---

# 94. DO NOT REBUILD EVERYTHING

Preserve existing good implementation.

Before replacing something:

- inspect it
- test it
- determine its quality
- improve it where appropriate

Do not introduce unnecessary frameworks.

---

# 95. DO NOT CREATE MICROSERVICE HELL

Keep a modular monolith unless a service genuinely needs independent scaling.

Use clear modules.

Extract later only where justified.

---

# 96. CODE QUALITY

Use:

- strict TypeScript
- no unnecessary `any`
- validation
- reusable services
- reusable components
- clean controllers
- centralized error handling
- consistent API contracts
- proper logging

---

# 97. DOCUMENTATION

Maintain:

```text
/docs/
  FORENSIC_AUDIT.md
  REQUIREMENTS_TRACEABILITY_MATRIX.md
  IMPLEMENTATION_STATUS.md
  ARCHITECTURE.md
  DATABASE.md
  API.md
  RBAC.md
  PERMISSION_MATRIX.md
  AI_ARCHITECTURE.md
  AI_GOVERNANCE.md
  RAG.md
  INTEGRATIONS.md
  SECURITY.md
  SCALABILITY.md
  TESTING.md
  DEPLOYMENT.md
```

---

# 98. IMPLEMENTATION STATUS

Maintain:

`IMPLEMENTATION_STATUS.md`

For EVERY requirement:

```text
Requirement
Status
Frontend
Backend
Database
Authorization
Tests
Documentation
Production Ready
```

---

# 99. DEFINITION OF COMPLETE

A feature is NOT complete until:

### Database

exists and is correct.

### Backend

implemented.

### API

implemented.

### Authorization

implemented.

### Validation

implemented.

### Frontend

implemented.

### Error handling

implemented.

### Loading/empty states

implemented.

### Audit

implemented where required.

### Tests

implemented.

### Documentation

implemented.

### Real data

verified.

---

# 100. FINAL FORENSIC PASS

After implementation:

Search again for:

```text
TODO
FIXME
mock
dummy
fake
placeholder
Coming Soon
hardcoded
```

Review each result.

Then inspect every route.

Then inspect every role.

Then test every major workflow.

Then test unauthorized access.

Then test mobile.

Then run build.

Then run tests.

Then run security checks.

Then run load tests.

---

# 101. FINAL DELIVERABLE

At the end create:

`/docs/FINAL_IMPLEMENTATION_REPORT.md`

Include:

## Executive Summary

## Features Completed

## Features Previously Missing

## Features Fixed

## Security Findings

## AI Capabilities

## Integration Capabilities

## Performance

## Scalability

## Test Results

## Remaining Risks

## Deployment Requirements

## Known Limitations

## Production Readiness Assessment

---

# 102. MOST IMPORTANT RULE

DO NOT TELL ME:

> "The LMS is complete."

unless you can demonstrate that it is complete.

Instead provide evidence:

```text
Requirement
→ Code
→ API
→ Database
→ UI
→ Test
→ Result
```

---

# 103. YOUR FIRST RESPONSE AFTER RECEIVING THIS PROMPT

DO NOT start coding.

Return ONLY:

1. Repository architecture summary
2. Number of frontend routes
3. Number of backend routes
4. Number of database models
5. Number of roles
6. Number of permissions
7. Number of existing AI features
8. Number of integrations
9. Number of dashboards
10. Number of tests
11. Critical missing features
12. Critical security issues
13. Critical architectural issues
14. Estimated completion percentage
15. Top 20 implementation gaps
16. Proposed implementation sequence

Then create:

`/docs/FORENSIC_AUDIT.md`

and

`/docs/REQUIREMENTS_TRACEABILITY_MATRIX.md`

ONLY AFTER THAT should implementation begin.

---

# 104. ABSOLUTE RULE

Do not optimize for:

> "How much code can I generate?"

Optimize for:

> "Can a real learner, trainer, programme manager, staff member and Super Admin successfully complete their entire business workflow without encountering a missing, fake, disconnected or insecure feature?"

That is the standard.

Build this as a **real national-scale production LMS**, not as a demonstration application.
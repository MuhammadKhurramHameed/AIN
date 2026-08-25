# Synapse LMS

A lightweight MERN + TypeScript platform for the MoITT AI capacity-building programme: role-based delegation for MoITT staff, consortium partners and their staff, content administrators, tutors, and trainees across the programme's 9 tracks — with a live Kanban board and a Tableau-like analytics dashboard.

## Stack

- **Server**: Express + TypeScript + Mongoose (MongoDB) + Socket.io (Kanban real-time), JWT auth in an httpOnly cookie.
- **Client**: Vite + React + TypeScript + Tailwind CSS + Recharts (charts) + `@dnd-kit` (drag-and-drop).
- Single monolithic API process, no queues/microservices/Redis — designed to run comfortably on a small VM.

## Prerequisites

- Node.js 18+
- A MongoDB instance — either:
  - `docker compose up -d` (starts MongoDB on `localhost:27017` using the root `docker-compose.yml`), or
  - a local `mongod`, or
  - a MongoDB Atlas connection string.

## Setup

```bash
npm install
cp server/.env.example server/.env
```

Edit `server/.env` if your Mongo URI, ports, or seeded super-admin credentials should differ from the defaults.

## Run

```bash
npm run dev
```

This runs the API on `http://localhost:4000` and the client on `http://localhost:5173` concurrently (Vite proxies `/api` and `/socket.io` to the API).

## Seed sample data

```bash
npm run seed
```

Creates the super admin, the 9 tracks, a sample consortium partner (with a partner admin + staff), a content admin, a tutor, a published course with lessons, a handful of trainees across tracks, and a starter Kanban board. Seeded super admin login is printed in `server/.env.example` (`admin@synapse.local` / `ChangeMe123!` by default) — change the password before any real deployment.

## Project layout

```
server/   Express + TypeScript API (models, routes, auth/RBAC, Socket.io, seed script)
client/   Vite + React + TypeScript SPA
```

## Roles & delegation

- **Super Admin** — can create staff of any role.
- **MoITT Staff** — delegated by Super Admin; scoped by a `permissions[]` array rather than a full ACL engine, to keep authorization lightweight.
- **Consortium Partner Admin** — represents a delivery partner; can add their own **Consortium Partner Staff**; submits periodic reports.
- **Content Administrator** — owns tracks/courses/lessons.
- **Tutor** — assigned to courses, delivers lessons.
- **Trainee** — enrolled in courses under one of the 9 tracks.

## Notes

- No public signup — every account is created by an authorized role (delegation chain rooted at the seeded Super Admin).
- File uploads (if added later) should go through a storage-service abstraction so local disk can be swapped for S3 without touching route code.
- This is a phased build (see project plan): Phase 1 delivered a working breadth-first MVP across every module; Phases 2–3 deepen the core LMS flow and the admin/reporting/Kanban depth respectively.

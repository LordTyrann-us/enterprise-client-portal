# Technical Decisions

## Candidate Information

| Field | Value |
|-------|-------|
| **Name** | Ulises Betancourt |
| **Date Started** | (Feb-25-2026) |
| **Date Completed** | (Feb-27-2026) |
| **Total Time Spent** | (36 hrs) |

---

## Summary

Built a working full-stack **Enterprise Client Portal** with role-based access control, where administrators manage projects and client assignments while clients can only view their authorized projects and collaborate through comments. The solution uses FastAPI + PostgreSQL for the backend API and React + TypeScript (Vite) for the frontend, with a simple `/api` proxy architecture to avoid CORS issues and keep service communication clean.

---

## Technology Stack

### Backend

| Component | Choice | Why? |
|-----------|--------|------|
| Framework | FastAPI | Fast iteration, async-friendly, built-in OpenAPI/Swagger (`/api/docs`) |
| Database | Postgres (Docker) | Production-like relational DB, reliable, easy local setup |
| ORM | SQLAlchemy | Clear models + relationships; standard Python ORM |

### Frontend

| Component | Choice | Why? |
|-----------|--------|------|
| Framework | React + TypeScript (Vite) | Strong ecosystem, typed UI, fast dev server |
| State Management | Local component state + localStorage | Simple scope: auth token/role stored locally, minimal complexity |
| Styling | Inline styles (minimal) | Prioritized functionality; easy to refine later |

---

## Architecture Decisions

### Backend Structure

- FastAPI app with routers mounted under `/api`.
- JWT auth implemented via auth routes and dependency-based auth checks.
- SQLAlchemy models for `User`, `Project`, `Comment`.
- Access control enforced server-side:
  - Admin can view/manage all projects.
  - Client can only view projects assigned to their email.

### Frontend Structure

- Pages:
  - `/login`, `/register`
  - `/dashboard` (role-based content)
  - `/projects` (admin list view; clients hidden from menu)
  - `/projects/:id` (detail + comments)
- Axios instance configured with `baseURL: "/api"` plus interceptor to attach Bearer token.
- React Router + protected routes (RequireAuth); role-based navigation for UX.

### Database Design

- `users`: email (unique), hashed password, role (`admin`/`client`)
- `projects`: name, description, status (`active`, `on-hold`, `completed`), client_email
- `comments`: project_id FK, author_email, body
- Comments fetched by project and appended via POST.

---

## Security

- JWT-based authentication (Bearer token).
- Authorization enforced on the backend (role + project ownership checks).
- Frontend additionally hides admin-only navigation links for clients (UX), but backend remains source of truth.
- Basic input validation via Pydantic request models.

---

## Challenges

- Aligning the correct request payload shapes with OpenAPI (e.g., comment creation expects `{ "body": "..." }`).
- Running frontend + backend smoothly together:
  - Solved via Vite proxy `/api` → backend (so browser hits only one origin).

---

## Trade-offs

- Frontend styling is intentionally minimal; could be upgraded with Tailwind or a component library.
- No DB migrations tool (tables created on startup). For production, add Alembic migrations.
- Vite dev server is used in Docker for simplicity; for production use `vite build` + static hosting + reverse proxy.

---

## Resources Used

- FastAPI docs / OpenAPI docs
- Docker + docker compose
- Vite + React Router + Axios docs
- (Optional) AI assistant for iterative debugging and code generation

# Enterprise Client Portal

Production-style full-stack SaaS prototype designed to demonstrate secure client collaboration, role-based access control (RBAC), and containerized deployment using modern web architecture.

## Overview

Enterprise Client Portal is a secure multi-tenant web application that enables administrators to manage clients and projects while ensuring strict data isolation, so each client can only access their assigned resources.

The platform implements authentication, role-based authorization, project collaboration through comments, dashboard insights, and a fully containerized local environment.


## 👥 Roles

### Admin
- Create and manage projects
- Assign projects to clients
- View all projects
- View all comments
- Dashboard statistics (projects by status)

### Client
- View assigned projects only
- Open project details
- Post comments

---

## 🛠 Tech Stack

### Backend
- FastAPI
- SQLAlchemy
- JWT Authentication
- PostgreSQL (Docker)
- Runs on **port 8000**
- Swagger/OpenAPI:  
  `http://localhost:8000/api/docs`

### Frontend
- React + TypeScript
- Vite
- Axios
- React Router
- Runs on **port 5173**

### Proxy
Vite proxies `/api/*` to the backend to avoid CORS issues.

---

## 🚀 Quick Start (Docker)

From repository root:

```bash
docker compose up -d --build
docker compose ps
```

### Health Checks

```bash
curl -s http://localhost:8000/health && echo
curl -s http://localhost:5173/health && echo
curl -s http://localhost:5173/api/health && echo
```

Open in browser:

```
http://localhost:5173
```

---

## 🧪 Demo Users (After DB Reset)

If you run:

```bash
docker compose down -v
```

The database is wiped and users must be recreated.

### Create Admin

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!","role":"admin"}'
```

### Create Client

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"client1@example.com","password":"Client123!","role":"client"}'
```

---

## 📜 Logs

Backend:

```bash
docker compose logs -f backend
```

Frontend:

```bash
docker compose logs -f frontend
```

---

## 🛑 Stop Containers

```bash
docker compose down
```

---

## ⚠ Reset Database (Deletes All Data)

```bash
docker compose down -v
docker compose up -d --build
```
---

## Architecture Highlights

This project was designed to reflect production-oriented SaaS patterns rather than a simple coding exercise.

### Backend
- FastAPI-based REST API with clear route separation
- JWT authentication with stateless session handling
- Role-Based Access Control (RBAC) enforcing Admin vs Client permissions
- SQLAlchemy ORM with relational data modeling
- Layered structure for routes, models, and services

### Frontend
- React + TypeScript with component-based architecture
- Role-aware UI rendering based on authenticated user
- Axios-based API abstraction
- Protected routes and session handling
- Clean separation between views and API logic

### Infrastructure
- Fully containerized with Docker Compose
- Service separation: frontend, backend, database
- Internal service communication via Docker network
- Proxy-based API routing (`/api → backend`) to avoid CORS issues
- Environment-based configuration via `.env`

### Security Model
- JWT-based authentication
- Password hashing and secure storage
- Role-based authorization at API level
- Client data isolation enforced in backend queries

---

## Future Enhancements

The current version focuses on core functionality and architecture. The following improvements would move it closer to a production deployment:

- Pagination for projects and comments
- Database indexing and query optimization
- Centralized logging and monitoring
- CI/CD pipeline (GitHub Actions)
- Reverse proxy (Nginx) for production routing
- Automated tests (backend and frontend)
- Real-time updates (WebSockets)

---

## Demo Setup

Because the application uses a persistent PostgreSQL volume, users depend on the active database instance.

In a fresh environment, create demo users through Swagger.

API Docs:
- http://localhost:8001/api/docs

Example admin user:
{
  "email": "admin@example.com",
  "password": "Admin123!",
  "role": "admin"
}

Example client user:
{
  "email": "client1@example.com",
  "password": "Client123!",
  "role": "client"
}

Use POST /api/auth/register to create users, then log in through the frontend or POST /api/auth/login.

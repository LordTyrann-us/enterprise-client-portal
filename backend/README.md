# Backend Implementation

## Tech Stack Options

**Node.js**
- Runtime: Node.js v18+
- Frameworks: Express.js, Fastify, or NestJS
- ORM: Prisma, TypeORM, or Sequelize

**Python**
- Runtime: Python 3.10+
- Frameworks: FastAPI or Django REST Framework
- ORM: SQLAlchemy or Django ORM

---

## Required Endpoints

### Authentication
```
POST   /api/auth/register    - User registration
POST   /api/auth/login       - User login
GET    /api/auth/me          - Get current user
```

### Projects
```
GET    /api/projects         - List projects (filtered by role)
POST   /api/projects         - Create project (Admin only)
GET    /api/projects/:id     - Get project details
PUT    /api/projects/:id     - Update project (Admin only)
DELETE /api/projects/:id     - Delete project (Admin only)
```

### Comments
```
GET    /api/projects/:id/comments  - List project comments
POST   /api/projects/:id/comments  - Add comment
```

### Dashboard
```
GET    /api/dashboard        - Stats based on user role
```

---

## Database Schema (Suggested)

**Users:** id, email, password_hash, name, role (admin/client), created_at

**Projects:** id, name, description, status, client_id, created_by, created_at, updated_at

**Comments:** id, project_id, user_id, content, created_at

---

## Security Checklist

- [ ] Passwords hashed (bcrypt/argon2)
- [ ] JWT with reasonable expiration
- [ ] Input validation
- [ ] Role-based access control

---

## Environment Variables

```bash
cp .env.example .env
```

---

## API Documentation

Swagger/OpenAPI should be accessible at `/api/docs`

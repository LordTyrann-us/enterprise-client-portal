# Analysis Responses

## Candidate Information

| Field | Value |
|-------|-------|
| **Name** | Ulises Betancourt |
| **Date** | (Feb-27-2026) |

---

## Question 1: Performance Bottlenecks

> What are the two main performance bottlenecks in your implementation? How would you address them?

### Bottleneck 1

**What:** Growing “chatty” usage between frontend ↔ backend (many small requests), especially as projects/comments increase.

**Why it's a problem:** More HTTP round-trips and DB queries increase latency and backend load. Comment lists can grow large without pagination.

**Solution:**
- Add pagination for comments and project lists.
- Add optimized endpoints (ex: project detail endpoint returns project + latest comments).
- Add DB indexes (ex: `comments.project_id`, `projects.client_email`, `projects.status`).

### Bottleneck 2

**What:** Dashboard stats and common reads can become expensive as data grows (counting by status, repeated fetching).

**Why it's a problem:** Aggregations can become slow, and repeated requests can create DB pressure under concurrency.

**Solution:**
- Cache dashboard aggregates for short TTL (ex: 30–60s).
- Ensure proper indexing on status.
- Production scaling: multiple app workers + connection pooling + reverse proxy.

---

## Question 2: Real-time Updates

> The client asks: "Can we add real-time updates so clients see new comments without refreshing?"

**Recommended approach:** WebSockets (FastAPI supports WebSocket routes) broadcasting “new comment” events per project.

**How it works:**
- Client subscribes to a project-specific channel (ex: `/ws/projects/{id}`).
- When a new comment is created, backend broadcasts to all connected clients for that project.
- UI appends the comment in real time without refresh.

**Why this approach:** True real-time UX with efficient push updates (better than aggressive polling).

**Trade-offs:**
- More complexity: connection management, auth on WS, scaling (requires pub/sub if multiple backend instances).
- Simpler alternative: periodic polling (easy but not real real-time).

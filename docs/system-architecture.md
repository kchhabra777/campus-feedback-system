# System Architecture

The Campus Feedback System follows a microservices-based distributed architecture designed for scalability, fault isolation, atomic data consistency, and intelligent LLM-powered review synthesis.

---

## 🏛️ High-Level Architectural Topology

```mermaid
graph TD
    Client[Student & Faculty Web App - React 19 + Vite :5173] -->|HTTPS / REST| GW[API Gateway - Express.js :8000]
    
    subgraph Microservices Layer
        GW -->|/api/auth, /api/profiles, /api/courses| AUTH[Auth & Profile Microservice :5001]
        GW -->|/api/reviews, /api/ratings, /api/tags| FB[Feedback & Rating Microservice :5000]
    end
    
    subgraph External AI Services
        FB -->|@google/genai SDK| Gemini[Google Gemini 3.5 Flash LLM]
    end

    subgraph Data & Storage Layer
        AUTH -->|Prisma ORM Connection Pool| DB[(Neon Serverless PostgreSQL DB)]
        FB -->|Prisma ORM Connection Pool| DB
    end
```

---

## 🧩 Architectural Components

### 1. API Gateway (`gateway`)
- **Port**: `8000`
- **Role**: Single entry point for all client requests.
- **Responsibilities**:
  - CORS negotiation and request header forwarding.
  - Reverse proxy routing using `http-proxy-middleware`.
  - Route normalization: Handles both `/api/*` and direct route prefixes seamlessly.
  - Centralized `/health` and status monitoring.

### 2. Authentication & Profile Service (`auth-service`)
- **Port**: `5001`
- **Responsibilities**:
  - Institutional `@thapar.edu` email verification via 6-digit cryptographic OTP.
  - Non-tamperable role determination (`STUDENT` vs `TEACHER`).
  - Student onboarding: Full Name, 10-digit roll number, engineering branch, batch group (`3Q11`–`3Q15`, `2Q11`–`2Q15`), year of study.
  - Faculty onboarding: Department, designation, course and batch offerings (`UCS120` to `3Q11`).
  - Course offering management with dynamic eligibility matching.

### 3. Feedback & Rating Microservice (`feedback-microservice`)
- **Port**: `5000`
- **Responsibilities**:
  - **Gemini 3.5 Flash Review Synthesis**: Aggregates qualitative reviews into 5 structured dimensions (*Teaching Quality, Grading & Fairness, Approachability, Course Workload, Overall Vibe*) with in-memory caching and fallback simulation.
  - Review creation with atomic 21-day cooldown verification.
  - Dual time-decay rating calculations ($w_i = \frac{1}{1 + \text{age}/30}$).
  - Review voting (Helpful/Unhelpful) with toggle-off / un-vote mechanics.
  - Community Tags sentiment statistics aggregation.
  - Threaded discussion management for peer student replies and faculty responses.
  - Moderation reporting and content flag management.

### 4. Frontend Client (`frontend`)
- **Port**: `5173`
- **Stack**: React 19, Vite, Recharts, Lucide Icons, Tailwind CSS.
- **Highlights**:
  - **Radial Orbital Timeline**: 60 FPS revolving planetary visualization with auto-pause on hover/inspection.
  - **Community Tags BarChart**: Normalized horizontal bar chart with absolute percentage scaling.
  - **Portal-Rendered Insights**: Isolates full-screen modal overlays from nested stacking contexts.

### 5. Database Layer (Neon Serverless PostgreSQL)
- **Engine**: PostgreSQL 16+ on Neon.
- **Connection Management**: `@prisma/adapter-pg` connection pooler with WebSocket and direct TLS pooling.
- **ACID Integrity**: Enforces strict composite unique constraints and transaction isolation across microservices.

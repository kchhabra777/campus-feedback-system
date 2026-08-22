# Week 2: API Gateway & Microservices Protocols

## 🎯 Objectives
- Build Express.js API Gateway (Port 8000) using `http-proxy-middleware`.
- Formulate RESTful API contracts and CORS policies.
- Connect frontend clients to isolated backend microservices.

---

## 🛠️ Key Implementation Details

1. **Proxy Routing Rules**:
   - Mounted `/api/auth`, `/api/profiles`, `/api/courses` &rarr; `AUTH_SERVICE_URL`.
   - Mounted `/api/reviews`, `/api/ratings` &rarr; `FEEDBACK_SERVICE_URL`.
   - Added dual route alias support for root paths (`/auth`, `/profiles`, etc.) to prevent 404 proxy mismatches.
2. **Centralized Health Check**:
   - Implemented `GET /health` on the gateway returning downstream service URLs.

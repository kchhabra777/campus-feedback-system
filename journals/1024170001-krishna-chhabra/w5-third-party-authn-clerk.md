# Weekly Log: Week 5 — 3rd-Party AuthN (Clerk), Gateway AuthZ & Production Hardening

**Student Name**: Krishna Chhabra  
**Roll Number**: 1024170001  
**Group / Batch**: 3Q1A / Team TechNova  
**Date Range**: 17 August 2026 – 23 August 2026  

---

## 🎯 Weekly Objectives
- Transition institutional authentication to **Clerk 3rd-Party Identity Provider (AuthN)**.
- Implement **API Gateway Cryptographic Token Verification (JWKS)** with header injection.
- Eliminate self-voting security vulnerabilities and implement full CRUD operations for teacher course offerings.

---

## 🛠️ Technical Contributions

### 1. Clerk 3rd-Party AuthN & Gateway JWT Verification
- Configured Clerk React SDK (`@clerk/clerk-react`) and Backend SDK (`@clerk/backend`).
- Built API Gateway authentication middleware in `gateway/src/middleware/clerkAuth.js` verifying Bearer JWTs via Clerk's public key sets.
- Implemented automatic header injection: forwarding `x-user-id`, `x-user-email`, and `x-user-role` to isolated backend microservices.

### 2. Database Self-Voting Guard
- Enforced a strict row-level security rule in `feedback-microservice/src/services/voteService.js` checking `review.reviewerId !== currentUserId` to prevent students from upvoting or downvoting their own feedback.

### 3. Faculty Course Offering Full CRUD Lifecycle
- Implemented `PUT /api/courses/offerings/:id` and `DELETE /api/courses/offerings/:id` with strict teacher ownership verification.
- Added full interactive course editing and deletion controls on the Teacher Dashboard UI.

---

## 🧪 Verification & Benchmarking
- **Self-Vote Denial**: Verified that attempting to vote on one's own review returns HTTP 400 Bad Request.
- **Course Edit/Delete**: Verified that faculty can modify and remove course offerings dynamically.
- **Gateway Health**: Validated sub-10ms response times for verified token proxying.

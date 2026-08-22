# Weekly Log: Week 4 — 3rd-Party Authentication & Course Management Hardening

**Student Name**: Robin Singla  
**Roll Number**: 1024170017  
**Group / Batch**: 3Q1A / Team TechNova  
**Date Range**: 17 August 2026 – 23 August 2026  

---

## 🎯 Weekly Objectives
- Connect Clerk User Identity with Neon PostgreSQL database entities.
- Implement course offering edit and delete endpoints for faculty.
- Expand student sub-batch support across all university branches.

---

## 🛠️ Technical Contributions

### 1. Database User Synchronization (`/api/auth/clerk-sync`)
- Built the automated synchronization endpoint linking verified Clerk Google/Email accounts with our relational PostgreSQL `User`, `StudentProfile`, and `TeacherProfile` tables.
- Preserved role-based domain logic automatically extracting student batch years (`BE24`, `BE23`) or faculty designations from `@thapar.edu` emails.

### 2. Generic University Batch & Department Support
- Expanded batch selection to support all Thapar departments (`COE`, `ENC`, `EEC`, `ECE`, `ME`, `CE`, `CHE`, `BT`) and all sub-group identifiers (`3Q11`–`3Q15`, `3A1`, `3B1`, `2A1`, `ALL`).

### 3. Review Flag Moderation Persistence
- Enhanced the `ReviewFlag` reporting pipeline ensuring community reports are queryable via `GET /api/reviews/flags`.

---

## 🧪 Verification
- Tested user registration via Clerk with test accounts (`student_be24+clerk_test@thapar.edu`).
- Verified database user entity creation with `npm run studio`.

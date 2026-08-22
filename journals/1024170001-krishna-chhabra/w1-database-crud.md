# Week 1: Database Design & Basic CRUD Operations

## 🎯 Objectives
- Design a normalized relational PostgreSQL schema on Neon Cloud.
- Set up Prisma ORM in dual microservices (`auth-service` and `feedback-microservice`).
- Implement basic CRUD operations across all 11 tables.

---

## 🛠️ Key Implementation Details

1. **Dual Microservice Prisma Architecture**:
   - `auth-service/prisma/schema.prisma`: Contains `User`, `OtpVerification`, `StudentProfile`, `TeacherProfile`, and `CourseOffering`.
   - `feedback-microservice/prisma/schema.prisma`: Contains `Review`, `ReviewVote`, `ReviewFlag`, `ReviewReply`, `ReplyVote`, and `ProfileRating`.
2. **Schema Push & Synchronization**:
   - Automated schema migrations using `npx prisma db push`.
   - Configured custom client output paths (`src/generated/prisma`) to avoid namespace collisions.

---

## ⚠️ Challenges & Resolutions

- **Challenge**: Dual microservice Prisma schema drift caused mismatched types between auth profile data and review metadata.
- **Resolution**: Implemented synchronized schema files and unified `prisma generate` post-install hooks.

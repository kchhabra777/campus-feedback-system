# Campus Honest & Transparent Feedback System (Thapar University)

A modern, role-enforced campus review and feedback portal built with a microservices architecture.

---

## 🏛️ Microservices Architecture (Option B)

| Service | Port | Description | Tech Stack |
| :--- | :--- | :--- | :--- |
| **`auth-service`** | `5001` | Auth, Email OTP, BE23–BE30 Role Engine, Student & Faculty Profiles, Dynamic Course Offerings | Node.js, Express, Prisma, JWT, Bcrypt, Nodemailer |
| **`feedback-microservice`** | `5000` | Reviews, 2-Tier Time-Weighted Ratings, Votes (UP/DOWN), Flags, Threaded Replies | Node.js, Express, Prisma (Neon Postgres) |
| **`gateway`** | `8000` | Unified API Gateway routing `/api/auth`, `/api/profiles`, `/api/courses`, `/api/reviews`, `/api/ratings` | Node.js, Express, `http-proxy-middleware` |
| **`frontend`** | `5173` | Responsive web client with live role detection, OTP verification, ratings breakdown & review threads | React 19, Vite, Lucide Icons, Custom CSS Design System |

---

## 🔑 Core Features & Logic

### 1. Automatic Role Determination (Strict `@thapar.edu` & `BE` Rule)
- Requires an email ending with `@thapar.edu`.
- Local email part is scanned for `be23`, `be24`, `be25`, `be26`, `be27`, `be28`, `be29`, `be30`.
  - Matching email (e.g. `kchhabra_be24@thapar.edu`) &rarr; **`STUDENT`** (Batch locked to `BE24`).
  - Non-matching `@thapar.edu` (e.g. `bv.raghav@thapar.edu`) &rarr; **`TEACHER`**.
- User **cannot** choose or change their role.

### 2. Email OTP Verification
- 6-digit cryptographic verification code sent to the `@thapar.edu` email before account activation.
- Code expires in 10 minutes.

### 3. Student & Faculty Onboarding
- **Student Profile**: 10-digit Roll Number (strictly validated), Engineering Branch (e.g. `COE`), Batch (`BE24`), Year of Study (1–4).
- **Faculty Profile**: Full Name & Title, Department, Designation, and Dynamic Course Offerings (e.g. `UCS405 - Discrete Mathematics`, Batches taught `BE24`, Branch `COE`).

### 4. Dynamic Teacher-Student Batch Matching (No Prior Dataset)
- Because there is no pre-existing dataset, teachers dynamically register the courses and batches they teach.
- Students can only review teachers who are registered as having taught their batch and branch.

### 5. Two-Tier Time-Weighted Ratings
- **Overall Rating**: Decays older reviews using $1 / (1 + \text{ageInDays} / 30)$.
- **Current Rating**: Time-weighted decay calculated strictly over recent reviews within the last 180 days (6 months).

### 6. Transparency & Campus Discussion
- **Visible Roll Number**: Student roll number, batch, and branch are visibly attached to reviews for transparent campus accountability.
- **Review Replies (`ReviewReply`)**: Public threaded discussions where faculty and peers can post responses and counter-perspectives.
- **Voting & Moderation**: Upvote/downvote helpful reviews and flag inappropriate content.

---

## 🚀 Running the Platform

### Single Command (All Services):
```bash
npm run dev
```

### Or Run Individual Services Separately:

1. **Auth Service**:
   ```bash
   cd auth-service
   npm run dev
   ```

2. **Feedback Service**:
   ```bash
   cd feedback-microservice
   npm run dev
   ```

3. **API Gateway**:
   ```bash
   cd gateway
   npm run dev
   ```

4. **Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 🧪 Testing

Run automated tests:
```bash
# Test Role Detector Unit Tests
node auth-service/test-roles.js

# Test Full End-to-End Microservice Integration
node auth-service/test-e2e.js
```

# Campus Feedback System

![TIET Logo](assets/tiet-logo-full.png){ width=260px }

**UCS503 : Software Engineering Project (2026-27 ODD)**  
**Thapar Institute of Engineering and Technology (TIET), Patiala**  
**Group / Batch**: 3Q1A / **Team TechNova**

---

## 👥 Team Members

| Name | Roll Number | Email | Contribution Area |
| :--- | :---: | :--- | :--- |
| **Krishna Chhabra** | `1024170001` | `kchhabra_be24@thapar.edu` | Backend Microservices, DB Architecture & Concurrency |
| **Robin Singla** | `1024170017` | `rsingla_be24@thapar.edu` | Auth Microservice, Role Detection & Voting Idempotency |
| **Haritika** | `1024170015` | `haritika_be24@thapar.edu` | Frontend UI/UX, Review Systems & Faculty Dialogue |

---

## 🌐 Live Production Deployments

- **Frontend Web Application (Vercel)**: [https://campus-feedback-system.vercel.app](https://campus-feedback-system.vercel.app)
- **API Gateway (Render)**: [https://campus-feedback-system.onrender.com](https://campus-feedback-system.onrender.com)
- **Documentation (GitHub Pages)**: [https://kchhabra777.github.io/campus-feedback-system](https://kchhabra777.github.io/campus-feedback-system)
- **Database**: Serverless PostgreSQL Cluster on Neon Cloud

---

## 🚀 Key Features

### 1. 🪐 Gemini AI Review Synthesis & Radial Orbital Timeline
- **Automated Qualitative Summarization**: Integrates Google Gemini 3.5 Flash via `@google/genai` to analyze all verified student text reviews.
- **5-Category Evaluation Taxonomy**: Classifies qualitative insights into *Teaching Quality, Grading & Fairness, Approachability, Course Workload,* and *Overall Vibe*.
- **60 FPS Revolving Visualization**: Interactive planetary orbital timeline with smart reading auto-pause on hover/expand, step rotation, and dynamic glow categories.
- **In-Memory Caching & Resilient Fallback**: Optimizes LLM latency and guarantees uninterrupted presentation reliability.

### 2. 🔐 Role-Enforced Institutional Authentication & Onboarding
- **Cryptographic OTP Flow**: Verifies `@thapar.edu` domain ownership with one-time passwords.
- **Automated Role Detection**: Locks students and faculty into distinct access tiers based on institutional email patterns.
- **Batch & Branch Eligibility Matching**: Restricts feedback submission to students who were actually enrolled in the instructor's course and batch (e.g. `3Q11`–`3Q15`).

### 3. ⏱️ Review Integrity & Cooldown Enforcement
- **21-Day Cooldown Window**: Enforces temporal cooldowns per student-instructor pair to prevent review spam.
- **Dual Time-Decay Rating Algorithm**: Computes both overall pedagogical decay and 180-day recent semester ratings ($w_i = \frac{1}{1 + \text{age}/30}$).
- **Community Tags Sentiment Analytics**: Aggregated positive and constructive faculty tag distribution rendered via clamped horizontal percentage charts.

---

## 📁 Repository Structure

```text
├── .github/workflows/          # GitHub Actions for automated MkDocs deployment & CI
├── assets/                     # Logos, stylesheets, and theme overrides
├── auth-service/               # Authentication, User Profile & Course Offering service (:5001)
├── feedback-microservice/      # Reviews, Ratings, Community Tags & Gemini AI service (:5000)
├── gateway/                    # Express.js API Gateway (:8000) reverse proxy
├── frontend/                   # React 19 + Vite Single Page Application (:5173)
├── docs/                       # MkDocs documentation source files
├── journals/                   # Weekly student work logs
├── Makefile                    # Make automation targets (make dev, make test, make docs)
├── mkdocs.yml                  # Material for MkDocs theme configuration
└── pyproject.toml              # Python docs dependencies
```

---

## ⚡ Quickstart & Local Setup

### 1. Prerequisites
- Node.js `v20+` or `v22+`
- PostgreSQL or Neon Serverless DB URL
- Google Gemini API Key (optional, built-in fallback provided)

### 2. Configure Environment Variables
Copy `.env.example` templates to each service:
```bash
cp .env.example .env
cp auth-service/.env.example auth-service/.env
cp feedback-microservice/.env.example feedback-microservice/.env
cp gateway/.env.example gateway/.env
```

### 3. Install Dependencies & Launch
```bash
# Install root & workspace packages
npm install

# Start all microservices, API Gateway, and Frontend concurrently
npm run dev
# OR: make dev
```

- **Frontend**: `http://localhost:5173`
- **API Gateway**: `http://localhost:8000`
- **Feedback Microservice**: `http://localhost:5000`
- **Auth Microservice**: `http://localhost:5001`

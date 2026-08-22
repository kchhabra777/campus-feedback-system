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

## 📁 Repository Structure

```text
├── .github/workflows/          # GitHub Actions for automated MkDocs deployment & CI
├── assets/                     # Logos, stylesheets, and theme overrides
├── auth-service/               # Authentication & User Profile microservice
├── feedback-microservice/      # Review, Voting, Reply & Rating microservice
├── gateway/                    # API Gateway (Port 8000) reverse proxy
├── frontend/                   # React 19 + Vite single-page web client
├── docs/                       # MkDocs documentation files
├── journals/                   # Weekly student work logs
│   ├── 1024170001-krishna-chhabra/
│   ├── 1024170017-robin-singla/
│   └── 1024170015-haritika/
├── project-proposal/           # LaTeX Project Proposal (main.tex)
├── project-report-prototype-stage/ # LaTeX Prototype Report (main.tex)
├── Makefile                    # Standard make targets (make dev, make test, make docs)
├── mkdocs.yml                  # Material for MkDocs theme configuration
└── pyproject.toml              # Python docs dependencies
```

---

## ⚡ Quickstart & Verifiable Testing

### 1. Run Automated Concurrency Benchmark
```shell
make test
# OR: node auth-service/test-concurrency.js
```

### 2. Start Full-Stack Dev Environment
```shell
make dev
# Launches Gateway (:8000), Auth (:5001), Feedback (:5000), and Frontend (:5173) concurrently
```

### 3. Local Documentation Server
```shell
make docs
# Serves interactive documentation at http://localhost:8000
```

# RateProf - Campus Feedback System

![TIET Logo](assets/tiet-logo-full.png){ width=260px }

**UCS503: Software Engineering Project (2026-27 ODD)**  
**Thapar Institute of Engineering and Technology (TIET), Patiala**  
**Group / Batch**: 3Q1A / **Team TechNova**

---

## 👩‍🏫 Faculty Mentor & Project Evaluator

<div style="display: flex; align-items: center; gap: 20px; margin: 16px 0; padding: 18px 20px; background: rgba(245, 158, 11, 0.06); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 10px;">
  <img src="assets/anjula-mehto.png" alt="Dr. Anjula Mehto" style="width: 80px; height: 95px; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); flex-shrink: 0;" />
  <div>
    <h3 style="margin: 0; font-size: 1.15rem; font-weight: 700; color: #1e293b;"><a href="faculty-advisor.md">Dr. Anjula Mehto</a></h3>
    <div style="font-size: 0.9rem; color: #b45309; font-weight: 600; margin-top: 2px;">Assistant Professor · Computer Science & Engineering Department (CSED)</div>
    <div style="font-size: 0.85rem; color: #64748b; margin-top: 4px;">
      Thapar Institute of Engineering and Technology (TIET), Patiala<br>
      <strong>Specialization:</strong> Wireless Sensor Networks, Internet of Things (IoT), Machine Learning<br>
      <strong>Email:</strong> <a href="mailto:anjula.mehto@thapar.edu">anjula.mehto@thapar.edu</a> | <a href="faculty-advisor.md">View Full Academic & Research Profile →</a>
    </div>
  </div>
</div>

---

## 👥 Team Members

| Name | Roll Number | Email | Role |
| :--- | :---: | :--- | :--- |
| **Krishna Chhabra** | `1024170001` | `kchhabra_be24@thapar.edu` | Backend Microservices, DB Architecture & Concurrency |
| **Robin Singla** | `1024170017` | `rsingla_be24@thapar.edu` | Auth Service, Student Verification & Voting Idempotency |
| **Haritika** | `1024170015` | `haritika_be24@thapar.edu` | Frontend UI/UX, Review Systems & Faculty Dialogue |

---

## 🌐 Live Production Deployments

- **Production Web Application**: [https://www.rateprof.tech](https://www.rateprof.tech) (also [https://rateprof.tech](https://rateprof.tech))
- **Frontend Backup (Vercel)**: [https://campus-feedback-system.vercel.app](https://campus-feedback-system.vercel.app)
- **API Gateway (Render)**: [https://campus-feedback-system.onrender.com](https://campus-feedback-system.onrender.com)
- **Database**: Serverless PostgreSQL Cluster on Neon Cloud
- **GitHub Repository**: [https://github.com/kchhabra777/campus-feedback-system](https://github.com/kchhabra777/campus-feedback-system)

---

## 📌 Project Overview

The **Campus Feedback System** is a transparent, accountable, and tamper-resistant feedback platform designed specifically for university ecosystems. Unlike traditional anonymous feedback systems that suffer from review-bombing, spam, and lack of accountability, this system introduces:

1. **Strict `@thapar.edu` University Authentication**: Automatic, non-tamperable role detection based on student roll number format.
2. **Transparent Student Attribution**: Reviews visibly display verified `Name (RollNumber)` and institutional email.
3. **Dynamic Course & Batch Matching**: Students only review faculty members who actively teach their registered engineering batch (`3Q11`–`3Q15`, `2Q11`–`2Q15`) and branch.
4. **Anti-Spam 21-Day Cooldown**: Restricts students to 1 review per faculty member every 21 days, enforced atomically at the database transaction layer.
5. **Dual Time-Decay Rating Engine**:
   - **Overall Time-Decay Rating**: Older reviews decay mathematically using $w_i = \frac{1}{1 + \text{age}/30}$.
   - **Current Semester Rating**: Rolling 180-day recent evaluation.
6. **Two-Way Constructive Faculty Dialogue**: Faculty can reply directly to student reviews left on their courses to seek constructive suggestions and clarify concepts.
7. **Idempotent Community Moderation**: Single-vote constraint (`@@unique([reviewId, userId])`) prevents vote inflation and enables vote toggle/undo.

---

## ⚡ Quick Start & Verifiable Testing

To verify all claims and run the concurrency tests locally:

```shell
# 1. Clone the repository
git clone https://github.com/kchhabra777/campus-feedback-system.git
cd campus-feedback-system

# 2. Run automated atomic transaction and concurrency tests
make test

# 3. Start local development environment (Gateway :8000, Auth :5001, Feedback :5000, Frontend :5173)
make dev
```

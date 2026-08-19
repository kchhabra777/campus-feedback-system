# Interaction Protocols & API Contracts

All client-server communications are formulated as stateless, RESTful HTTP APIs routed through the central API Gateway (Port 8000).

---

## 📋 Comprehensive API Route Matrix

| Domain | Method | Gateway Endpoint | Request Body | Response Status | Access Role |
| :--- | :---: | :--- | :--- | :---: | :---: |
| **Auth** | `POST` | `/api/auth/send-otp` | `{ "email": string }` | `200 OK` | Public (`@thapar.edu`) |
| **Auth** | `POST` | `/api/auth/signup` | `{ "email", "password", "otp" }` | `201 Created` | Public |
| **Auth** | `POST` | `/api/auth/login` | `{ "email", "password" }` | `200 OK` | Public |
| **Auth** | `GET` | `/api/auth/me` | *Bearer Token Header* | `200 OK` | Authenticated |
| **Profiles** | `POST` | `/api/profiles/student` | `{ "fullName", "rollNumber", "branch", "batch", "yearOfStudy" }` | `200 OK` | Student |
| **Profiles** | `POST` | `/api/profiles/teacher` | `{ "fullName", "department", "designation", "offerings": [] }` | `200 OK` | Teacher |
| **Profiles** | `GET` | `/api/profiles/teachers` | *None* | `200 OK` | All Users |
| **Profiles** | `GET` | `/api/profiles/teachers/:id` | *None* | `200 OK` | All Users |
| **Courses** | `GET` | `/api/courses/eligible-teachers`| *None (uses student token batch)* | `200 OK` | Student |
| **Courses** | `POST` | `/api/courses/offerings` | `{ "courseCode", "courseName", "batchTaught", "branchTaught" }` | `201 Created` | Teacher |
| **Reviews** | `POST` | `/api/reviews` | `{ "reviewerId", "reviewerName", "reviewerEmail", "reviewerRollNo", "reviewerBatch", "reviewerBranch", "revieweeId", "courseCode", "rating", "reviewText" }` | `201 Created` | Student |
| **Reviews** | `GET` | `/api/reviews/reviewee/:id` | `?page=1&limit=20` | `200 OK` | All Users |
| **Votes** | `POST` | `/api/reviews/:id/vote` | `{ "user": { "userId" }, "vote": { "type": "UP" \| "DOWN" } }` | `200 OK` | Student |
| **Replies** | `POST` | `/api/reviews/:id/replies` | `{ "authorId", "authorRole", "authorName", "authorBadge", "replyText" }` | `201 Created` | Student / Teacher |
| **Replies** | `GET` | `/api/reviews/:id/replies` | *None* | `200 OK` | All Users |
| **Reply Votes**| `POST`| `/api/reviews/replies/:id/vote`| `{ "user": { "userId" }, "vote": { "type": "UP" \| "DOWN" } }` | `200 OK` | Student |
| **Ratings** | `GET` | `/api/ratings/:teacherId` | *None* | `200 OK` | All Users |
| **Health** | `GET` | `/health` | *None* | `200 OK` | Monitoring / Pinger |

---

## 🔒 Security & Authentication Protocol

1. **JWT Authentication**: Tokens are signed using HMAC SHA-256 (`jsonwebtoken`) with a 7-day expiration period.
2. **Bearer Token Transmission**: The client attaches `Authorization: Bearer <jwt_token>` in request headers for all protected endpoints.
3. **Role-Based Access Control (RBAC)**: Enforced via `requireRole("STUDENT")` and `requireRole("TEACHER")` Express middleware.

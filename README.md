# 🎓 Campus Feedback System

A microservices-based campus feedback platform designed to collect, manage, and analyze feedback from students regarding faculty and courses.

The system provides a structured way for students to submit reviews and ratings while allowing feedback to be moderated through flags, votes, and review status management.

---

## 🚀 Project Overview

**Campus Feedback System** is a backend microservice responsible for handling the feedback and review functionality of a campus management platform.

The system allows users to:

* Submit reviews for faculty and courses
* Rate faculty members
* View and manage reviews
* Vote on reviews
* Flag inappropriate or problematic reviews
* Track review status
* Calculate profile-level ratings
* Associate faculty with courses, batches, semesters, and academic years

The application follows a **microservice architecture**, keeping feedback-related functionality isolated and independently maintainable.

---

## 🏗️ Architecture

The current repository contains the **Feedback Microservice**.

```text
Campus Feedback System
        │
        ├── Feedback Microservice
        │       │
        │       ├── Routes
        │       ├── Controllers
        │       ├── Services
        │       ├── Database Layer
        │       └── Prisma ORM
        │
        └── PostgreSQL Database
```

### Microservice Structure

```text
feedback-microservice/
│
├── prisma/
│   ├── migrations/
│   └── schema.prisma
│
├── src/
│   ├── controllers/
│   ├── lib/
│   ├── routes/
│   ├── services/
│   ├── app.js
│   └── server.js
│
├── .gitignore
├── package.json
├── package-lock.json
└── prisma.config.ts
```

---

## 🛠️ Tech Stack

| Technology | Purpose                         |
| ---------- | ------------------------------- |
| Node.js    | Backend runtime                 |
| Express.js | REST API framework              |
| Prisma     | ORM and database access         |
| PostgreSQL | Relational database             |
| JavaScript | Application development         |
| CORS       | Cross-origin resource sharing   |
| dotenv     | Environment variable management |
| Nodemon    | Development server              |

---

## 🗄️ Database Design

The feedback system uses a relational database to maintain users, courses, reviews, ratings, votes, flags, and faculty-course relationships.

### Main Tables

#### `users`

Stores student/faculty user information.

* `user_id`
* `roll_number`
* `name`
* `email`
* `role`
* `department`
* `batch`
* `year_of_study`
* `is_active`

#### `courses`

Stores course information.

* `course_id`
* `course_code`
* `course_name`

#### `reviews`

Stores feedback submitted by users.

* `review_id`
* `reviewer_id`
* `reviewee_id`
* `course_id`
* `rating`
* `review_text`
* `context_type`
* `status`
* `created_at`

#### `review_votes`

Allows users to vote on reviews.

* `vote_id`
* `review_id`
* `user_id`
* `vote_type`

A composite index on `review_id` and `user_id` helps manage user voting for reviews.

#### `review_flags`

Used to report problematic or inappropriate reviews.

* `flag_id`
* `review_id`
* `reported_by`
* `reason`
* `status`

#### `profile_rating`

Stores calculated rating information for a user.

* `rating_id`
* `user_id`
* `overall_rating`
* `recent_rating`
* `total_reviews`
* `calculated_at`

#### `faculty_course_mapping`

Maps faculty members to courses along with academic information.

* `mapping_id`
* `faculty_id`
* `course_id`
* `batch`
* `year_of_study`
* `semester`
* `academic_year`

---

## 🔄 Review Flow

```text
Student
   │
   │ Submit Review
   ▼
Feedback API
   │
   ▼
Review Controller
   │
   ▼
Review Service
   │
   ▼
Prisma ORM
   │
   ▼
PostgreSQL
```

Additional actions:

```text
Review
 ├── 👍 Vote
 ├── 🚩 Flag
 └── ⭐ Rating
```

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/kchhabra777/campus-feedback-system.git
```

### 2. Navigate to the microservice

```bash
cd campus-feedback-system/feedback-microservice
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file inside `feedback-microservice`.

```env
DATABASE_URL="your_postgresql_connection_string"
```

Replace the value with your PostgreSQL database connection string.

---

## 🗃️ Database Setup

After configuring the database, run the Prisma migrations:

```bash
npx prisma migrate dev
```

Generate the Prisma client:

```bash
npx prisma generate
```

---

## ▶️ Running the Application

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

The available npm scripts are defined in `package.json`.

---

## 📡 API

The microservice exposes REST APIs for feedback-related operations.

Typical operations include:

```text
Reviews
├── Create Review
├── Get Reviews
├── Get Review by ID
├── Update Review
└── Delete/Manage Review

Votes
├── Add Vote
└── Manage Vote

Flags
├── Flag Review
└── Manage Flag

Ratings
└── Calculate / Retrieve Profile Rating
```

> API endpoints may evolve as the microservice is developed.

---

## 🔐 Data & Moderation

The system includes mechanisms to improve feedback quality and moderation:

* Review status management
* Review flagging
* User voting
* Duplicate vote prevention
* Profile rating calculation
* Faculty-course mapping
* Academic context such as batch, semester, and academic year

---

## 📊 Database Relationships

The core relationships can be summarized as:

```text
Users
 │
 ├──────────────► Reviews
 │                   │
 │                   ├──────► Review Votes
 │                   │
 │                   └──────► Review Flags
 │
 └──────────────► Profile Rating

Courses
 │
 ├──────────────► Reviews
 │
 └──────────────► Faculty Course Mapping
                         │
                         └──────► Faculty
```

---

## 🎯 Goals

The project aims to provide:

* A centralized feedback platform
* Structured faculty and course reviews
* Reliable rating calculations
* Review moderation
* Scalable backend architecture
* Clean separation of business logic
* A database-driven feedback system

---

## 🔮 Future Improvements

* Authentication and authorization
* Role-based access control
* API documentation with Swagger/OpenAPI
* Admin moderation dashboard
* Advanced review analytics
* Sentiment analysis
* Notification service
* Rate limiting
* Automated testing
* Docker containerization
* CI/CD pipeline
* Monitoring and logging

---

## 👥 Team

**Team TechNova**

Campus Feedback System — Batch 3Q11

---

## 📌 Project Status

🚧 **Under Development**

This repository currently contains the **Feedback Microservice** and is being developed as part of the Campus Feedback System.

---

## 📄 License

This project is developed for educational and academic purposes.

# Week 1: Student Authentication & Role Determination

## 🎯 Objectives
- Enforce strict university domain authentication (`@thapar.edu`).
- Implement cryptographic 6-digit OTP verification.
- Enforce non-tamperable role determination based on email prefix regex.

---

## 🛠️ Key Implementation Details

1. **Role Determination Algorithm**:
   - Matches regex `/^([a-zA-Z0-9._]+)_(be(?:23|24|25|26|27|28|29|30))@thapar\.edu$/i`.
   - Automatically assigns `role = "STUDENT"` and extracts starting batch (e.g. `BE24`).
   - Non-student university emails (e.g. `bv.raghav@thapar.edu`) are assigned `role = "TEACHER"`.
2. **OTP Generation & Security**:
   - 6-digit cryptographic random OTP with 10-minute TTL.
   - Built a developer helper (`npm run otp`) for quick DB verification during testing.

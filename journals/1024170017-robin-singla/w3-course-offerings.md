# Week 3: Course Offerings & Eligibility Matching

## 🎯 Objectives
- Build dynamic matching between student batch/branch and teacher offerings.
- Restrict review submissions strictly to verified enrolled courses.

---

## 🛠️ Key Implementation Details

1. **Eligibility Filter**:
   - Compares student's `batch` (`3Q11`–`3Q15`) and `branch` (`COE`, `ENC`, etc.) against `CourseOffering.batchTaught` and `branchTaught`.
   - Supports `ALL` wildcards and comma-separated batch lists.
2. **Dual Teacher Directory**:
   - *Eligible Teachers*: Auto-filtered to teachers who taught the student.
   - *All Campus Faculty*: Global searchable directory.

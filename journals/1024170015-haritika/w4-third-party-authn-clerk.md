# Weekly Log: Week 4 — UI Clerk Integration & Self-Voting Prevention

**Student Name**: Haritika  
**Roll Number**: 1024170015  
**Group / Batch**: 3Q1A / Team TechNova  
**Date Range**: 17 August 2026 – 23 August 2026  

---

## 🎯 Weekly Objectives
- Style and embed Clerk `<SignIn />` and `<SignUp />` components with Thapar branding.
- Implement UI disabled states for self-voting prevention on `ReviewCard.jsx`.
- Add interactive course editing and deletion dialogs in `TeacherDashboard.jsx`.

---

## 🛠️ Technical Contributions

### 1. Clerk UI Branded Theme Integration
- Embedded Clerk React components inside the Thapar University authentication card with custom crimson styling (`#b91c1c`), rounded cards (`16px`), and smooth toggle switches between Sign In and Sign Up.
- Implemented immediate non-university domain warning banners rejecting unauthorized personal emails.

### 2. Self-Voting UI Safeguard
- Updated `ReviewCard.jsx` to dynamically evaluate `isOwnReview` and disable upvote/downvote buttons for the author with a clear tooltip: *"You cannot vote on your own review"*.

### 3. Faculty Course Management UI
- Designed and mounted interactive **Edit** and **Delete** buttons on the course offering cards in `TeacherDashboard.jsx`, complete with confirmation dialogs and academic year dropdown selectors.

---

## 🧪 Verification
- Verified responsive layouts on desktop, tablet, and mobile.
- Tested self-vote button disabled states and course editing workflows.

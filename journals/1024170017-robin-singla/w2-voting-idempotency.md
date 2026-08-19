# Week 2: Review Voting & Idempotency Engine

## 🎯 Objectives
- Implement upvote/downvote system for student reviews.
- Enforce 1-vote-per-student limit at the database level.
- Support vote toggle / un-vote behavior.

---

## 🛠️ Key Implementation Details

1. **Unique Constraints**:
   - `ReviewVote`: `@@unique([reviewId, userId])`
   - `ReplyVote`: `@@unique([replyId, userId])`
2. **Toggle & Switch Logic**:
   - Clicking an already active vote deletes the record and decrements tally.
   - Switching from UP to DOWN updates the voteType atomically.

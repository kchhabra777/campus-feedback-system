# Week 3: Atomic Transactions & Concurrency Benchmarking

## 🎯 Objectives
- Decompose review submission and ratings into serialized ACID transactions.
- Enforce 21-day anti-spam cooldown at the transaction boundary.
- Build multi-threaded benchmark test script (`test-concurrency.js`).

---

## 🛠️ Key Implementation Details

1. **Serialized Cooldown Check**:
   - Wrapped cooldown verification and insertion inside `prisma.$transaction(async (tx) => { ... })`.
   - Prevented race conditions when multiple identical requests are dispatched simultaneously.
2. **Benchmark Execution Results**:
   - Dispatched 5 simultaneous review creation requests: **1 Succeeded, 4 Blocked (100% Pass)**.
   - Tested 20 concurrent parallel votes on a single review: **20/20 Recorded, 0 Deadlocks**.
   - Verified 4 rapid parallel duplicate clicks: **Single vote recorded in DB (Idempotency Confirmed)**.

# Concurrency & Stress Testing Benchmarks

To verify the system's performance and race-condition safety under multi-user campus load, an automated concurrency benchmark test suite was developed (`auth-service/test-concurrency.js`).

---

## 🧪 Test Suite Execution Command

```shell
make test
# OR
node auth-service/test-concurrency.js
```

---

## 📊 Live Benchmark Output Log

```text
=================================================================
   CAMPUS FEEDBACK SYSTEM - ATOMIC & CONCURRENCY BENCHMARK TEST  
=================================================================

▶ [TEST 1] Concurrency on Review Creation (21-Day Cooldown Race Condition)
   Description: Dispatches 5 simultaneous review creation requests from the same student ID.
   Total Parallel Requests: 5 simultaneous submissions
   Successful Submissions:  1 (Expected: 1)
   Blocked by Cooldown:     4 (Expected: 4)
   ✅ PASS: Cooldown safely serialized inside transaction and prevented duplicate reviews.

▶ [TEST 2] High-Volume Concurrent Voting (Atomic Unique Constraint Validation)
   Description: Simulates 20 distinct students casting helpful upvotes simultaneously on a single review.
   Concurrent Voters:       20 parallel transactions
   Execution Time:          2582ms
   Recorded Votes in DB:    20 / 20
   Data Consistency Check:  100% MATCH (ACID Compliant)
   ✅ PASS: Parallel votes processed with zero deadlocks or lost updates.

▶ [TEST 3] Duplicate Concurrent Votes from Same Student (Idempotency Check)
   Description: Simulates 4 rapid parallel clicks from the exact same student.
   Simultaneous Attempts:   4 rapid parallel clicks
   Distinct Votes in DB:    1 (Expected: 1)
   ✅ PASS: Unique composite key enforced 1-vote-per-student limit under race condition.

=================================================================
   ALL CONCURRENCY AND ATOMIC TRANSACTION TESTS PASSED! (100%)
=================================================================
```

---

## 🎯 Verification Findings

1. **Zero Deadlocks**: PostgreSQL row-level locks and Prisma transactions handled parallel execution without serialization failures.
2. **Strict Idempotency**: Unique composite keys eliminated data duplication during network spikes.
3. **Serialized Cooldown Integrity**: The 21-day cooldown check cannot be bypassed by simultaneous parallel requests.

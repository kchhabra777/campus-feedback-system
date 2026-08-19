# Atomic Transactions & Mathematical Formulations

To ensure data integrity under concurrent user operations, multi-step business logic is encapsulated in serialized Prisma ACID database transactions.

---

## 🔄 1. Review Submission & Auto-Rating Recalculation

When a student submits feedback, the operation is executed inside an atomic transaction (`prisma.$transaction`):

```javascript
export const createReview = async ({
    reviewerId, reviewerName, reviewerEmail, reviewerRollNo, reviewerBatch,
    reviewerBranch, revieweeId, courseCode, courseName, rating, reviewText, context
}) => {
    const cooldownThreshold = new Date(Date.now() - COOLDOWN_DAYS * 24 * 60 * 60 * 1000);

    // Atomic transaction enforcing serialized cooldown check + review creation
    const review = await prisma.$transaction(async (tx) => {
        // Step 1: Check 21-day cooldown threshold
        const lastReview = await tx.review.findFirst({
            where: {
                reviewerId,
                revieweeId,
                createdAt: { gte: cooldownThreshold }
            },
            orderBy: { createdAt: "desc" }
        });

        if (lastReview) {
            const ageInMs = Date.now() - new Date(lastReview.createdAt).getTime();
            const remainingDays = Math.max(1, Math.ceil(COOLDOWN_DAYS - (ageInMs / (1000 * 60 * 60 * 24))));
            throw new Error(`21-day cooldown active. One review permitted every 21 days.`);
        }

        // Step 2: Insert the review record
        return await tx.review.create({
            data: {
                reviewerId, reviewerName, reviewerEmail, reviewerRollNo,
                reviewerBatch, reviewerBranch, revieweeId, courseCode,
                courseName, rating, reviewText, context
            }
        });
    });

    // Step 3: Trigger mathematical rating recalculation
    await calculateRating(revieweeId);
    return review;
};
```

---

## 🧮 2. Mathematical Formulation of Dual Ratings

Faculty ratings are calculated dynamically using an exponential time-decay model to reward continuous improvement:

### A. Overall Time-Decay Rating ($R_{\text{overall}}$)
Every review $i$ with star rating $r_i \in [1, 5]$ and age in days $\Delta t_i$ is assigned a time-decay weight $w_i$:

$$w_i = \frac{1}{1 + \frac{\Delta t_i}{30}}$$

The aggregated overall rating is the weighted average:

$$R_{\text{overall}} = \frac{\sum_{i=1}^{N} (r_i \cdot w_i)}{\sum_{i=1}^{N} w_i}$$

*Intuition*: A review from yesterday has a weight near $1.0$, while a review from 6 months ago ($\approx 180$ days) has a weight of $\approx 0.14$.

### B. Current Semester Rating ($R_{\text{recent}}$)
Evaluates recent teaching performance strictly for reviews submitted within the last 180 days:

$$R_{\text{recent}} = \frac{\sum_{j \in \{k \mid \Delta t_k \le 180\}} (r_j \cdot w_j)}{\sum_{j \in \{k \mid \Delta t_k \le 180\}} w_j}$$

---

## 🔒 3. Vote Idempotency & Concurrency Guarantees

1. **Unique Composite Constraint**: `@@unique([reviewId, userId])` guarantees that multiple rapid clicks or network retries by the same student can never inflate vote counts.
2. **Toggle & Undo Mechanism**: If a user clicks an already active vote, the record is removed from the database (`prisma.reviewVote.delete`) and the count decrements atomically.

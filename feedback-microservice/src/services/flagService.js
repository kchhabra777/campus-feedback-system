import prisma from "../lib/prisma.js";

export const createFlag = async ({
    reviewId,
    reporterId,
    reason
}) => {
    const numReviewId = Number(reviewId);

    const flag = await prisma.reviewFlag.create({
        data: {
            reviewId: numReviewId,
            reporterId,
            reason: reason || "Inappropriate / abusive content"
        }
    });

    // Mark isFlagged on the review
    try {
        await prisma.review.update({
            where: { reviewId: numReviewId },
            data: { isFlagged: true }
        });
    } catch (e) {}

    return flag;
};

export const getAllFlags = async () => {
    return await prisma.reviewFlag.findMany({
        include: {
            review: true
        },
        orderBy: {
            createdAt: "desc"
        }
    });
};
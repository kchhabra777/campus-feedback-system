import prisma from "../lib/prisma.js";

export const voteReview = async ({
    reviewId,
    userId,
    voteType
}) => {
    // 1. Fetch the review to verify self-voting restriction
    const review = await prisma.review.findUnique({
        where: { reviewId }
    });

    if (!review) {
        throw new Error("Review not found.");
    }

    if (review.reviewerId === userId) {
        throw new Error("You cannot vote on your own review.");
    }

    const existingVote = await prisma.reviewVote.findUnique({
        where: {
            reviewId_userId: {
                reviewId,
                userId
            }
        }
    });

    // If user clicked the same vote button again -> toggle off (delete vote)
    if (existingVote && existingVote.voteType === voteType) {
        await prisma.reviewVote.delete({
            where: {
                voteId: existingVote.voteId
            }
        });
        return { deleted: true, voteType: null };
    }

    // If user already voted a different type -> switch vote type
    if (existingVote) {
        return await prisma.reviewVote.update({
            where: {
                voteId: existingVote.voteId
            },
            data: {
                voteType
            }
        });
    }

    // If first time voting -> create vote
    return await prisma.reviewVote.create({
        data: {
            reviewId,
            userId,
            voteType
        }
    });
};
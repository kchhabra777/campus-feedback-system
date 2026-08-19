import prisma from "../lib/prisma.js";

export const createReply = async ({
    reviewId,
    authorId,
    authorRole,
    authorName,
    authorBadge,
    replyText
}) => {
    if (!["STUDENT", "TEACHER"].includes(authorRole)) {
        throw new Error("Invalid author role for reply.");
    }

    if (authorRole === "TEACHER") {
        // Faculty members can reply to reviews written for them to seek constructive feedback or clarify
        const review = await prisma.review.findUnique({
            where: { reviewId: Number(reviewId) }
        });
        if (!review) {
            throw new Error("Review not found.");
        }
        if (review.revieweeId !== authorId) {
            throw new Error("Faculty members can only reply to reviews submitted for their own courses/profile.");
        }
    }

    return await prisma.reviewReply.create({
        data: {
            reviewId: Number(reviewId),
            authorId,
            authorRole,
            authorName,
            authorBadge,
            replyText
        },
        include: {
            votes: true
        }
    });
};

export const voteReply = async ({ replyId, userId, voteType }) => {
    const existing = await prisma.replyVote.findUnique({
        where: {
            replyId_userId: {
                replyId: Number(replyId),
                userId
            }
        }
    });

    if (existing) {
        return await prisma.replyVote.update({
            where: { voteId: existing.voteId },
            data: { voteType }
        });
    }

    return await prisma.replyVote.create({
        data: {
            replyId: Number(replyId),
            userId,
            voteType
        }
    });
};

export const getRepliesByReview = async (reviewId) => {
    const replies = await prisma.reviewReply.findMany({
        where: {
            reviewId: Number(reviewId)
        },
        include: {
            votes: true
        },
        orderBy: {
            createdAt: "asc"
        }
    });

    return replies.map((r) => {
        const up = r.votes ? r.votes.filter((v) => v.voteType === "UP").length : 0;
        const down = r.votes ? r.votes.filter((v) => v.voteType === "DOWN").length : 0;
        return {
            ...r,
            upvotes: up,
            downvotes: down
        };
    });
};

import prisma from "../lib/prisma.js";

export const createReply = async ({
    reviewId,
    authorId,
    authorRole,
    authorName,
    authorBadge,
    replyText
}) => {
    return await prisma.reviewReply.create({
        data: {
            reviewId,
            authorId,
            authorRole,
            authorName,
            authorBadge,
            replyText
        }
    });
};

export const getRepliesByReview = async (reviewId) => {
    return await prisma.reviewReply.findMany({
        where: {
            reviewId
        },
        orderBy: {
            createdAt: "asc"
        }
    });
};

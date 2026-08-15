import prisma from "../lib/prisma.js";

export const createReview = async ({
    reviewerId,
    revieweeId,
    rating,
    reviewText,
    context
}) => {
    return await prisma.review.create({
        data: {
            reviewerId,
            revieweeId,
            rating,
            reviewText,
            context
        }
    });
};

export const getReviewsByReviewee = async (revieweeId, page, limit) => {

    const skip = (page - 1) * limit;

    const reviews = await prisma.review.findMany({
        where: {
            revieweeId: revieweeId,
            isFlagged: false
        },
        orderBy: {
            createdAt: "desc"
        },
        skip: skip,
        take: limit
    });

    const totalReviews = await prisma.review.count({
        where: {
            revieweeId: revieweeId,
            isFlagged: false
        }
    });

    return {
        reviews,
        totalReviews
    };
};
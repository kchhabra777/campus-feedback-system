import prisma from "../lib/prisma.js";
import { calculateRating } from "./ratingService.js";

export const createReview = async ({
    reviewerId,
    reviewerRollNo,
    reviewerBatch,
    reviewerBranch,
    revieweeId,
    courseCode,
    courseName,
    rating,
    reviewText,
    context
}) => {
    const review = await prisma.review.create({
        data: {
            reviewerId,
            reviewerRollNo: reviewerRollNo || null,
            reviewerBatch: reviewerBatch || null,
            reviewerBranch: reviewerBranch || null,
            revieweeId,
            courseCode: courseCode || null,
            courseName: courseName || null,
            rating,
            reviewText,
            context: context || (reviewerBatch ? `Batch ${reviewerBatch}` : null)
        },
        include: {
            replies: true,
            votes: true
        }
    });

    // Automatically recalculate time-weighted ratings for the teacher
    try {
        await calculateRating(revieweeId);
    } catch (err) {
        console.error("Failed to auto-update profile rating:", err);
    }

    return review;
};

export const getReviewsByReviewee = async (revieweeId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const rawReviews = await prisma.review.findMany({
        where: {
            revieweeId: revieweeId,
            isFlagged: false
        },
        include: {
            replies: {
                orderBy: {
                    createdAt: "asc"
                }
            },
            votes: true
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

    // Format reviews with upvote/downvote totals
    const reviews = rawReviews.map((rev) => {
        const upvotes = rev.votes.filter((v) => v.voteType === "UP").length;
        const downvotes = rev.votes.filter((v) => v.voteType === "DOWN").length;
        return {
            ...rev,
            upvotes,
            downvotes
        };
    });

    return {
        reviews,
        totalReviews
    };
};

export const getReviewById = async (reviewId) => {
    return await prisma.review.findUnique({
        where: { reviewId: Number(reviewId) },
        include: {
            replies: {
                orderBy: { createdAt: "asc" }
            },
            votes: true
        }
    });
};
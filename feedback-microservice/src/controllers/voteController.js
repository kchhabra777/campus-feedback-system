import { voteReview as voteReviewService } from "../services/voteService.js";
import prisma from "../lib/prisma.js";

export const voteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { user, vote } = req.body;

        if (!user || !user.userId) {
            return res.status(400).json({
                error: "User is required"
            });
        }

        if (!vote || !["UP", "DOWN"].includes(vote.type)) {
            return res.status(400).json({
                error: "Vote must be UP or DOWN"
            });
        }

        const reviewId = Number(id);

        const result = await voteReviewService({
            reviewId,
            userId: user.userId,
            voteType: vote.type
        });

        // Fetch exact aggregated counts from DB
        const upvotes = await prisma.reviewVote.count({
            where: { reviewId, voteType: "UP" }
        });
        const downvotes = await prisma.reviewVote.count({
            where: { reviewId, voteType: "DOWN" }
        });

        return res.status(200).json({
            vote: result,
            upvotes,
            downvotes
        });
    } catch (error) {
        console.error("Vote review error:", error);
        return res.status(500).json({
            error: "Failed to vote"
        });
    }
};
import { calculateRating } from "../services/ratingService.js";

export const getRating = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                error: "User ID is required"
            });
        }

        const rating = await calculateRating(userId);

        return res.status(200).json({
            userId: rating.userId,
            overallRating: rating.overallRating,
            recentRating: rating.recentRating,
            totalReviews: rating.totalReviews,
            calculatedAt: rating.calculatedAt,
            rating
        });
    } catch (error) {
        console.error("Failed to calculate rating:", error);
        return res.status(500).json({
            error: "Failed to calculate rating"
        });
    }
};
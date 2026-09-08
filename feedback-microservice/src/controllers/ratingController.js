import { calculateRating } from "../services/ratingService.js";

const ratingCache = new Map();
const RATING_CACHE_TTL = 60 * 1000;

export const getRating = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                error: "User ID is required"
            });
        }

        const cached = ratingCache.get(userId);
        if (cached && Date.now() - cached.timestamp < RATING_CACHE_TTL) {
            return res.status(200).json(cached.data);
        }

        const rating = await calculateRating(userId);
        const responseData = {
            userId: rating.userId,
            overallRating: rating.overallRating,
            recentRating: rating.recentRating,
            totalReviews: rating.totalReviews,
            calculatedAt: rating.calculatedAt,
            rating
        };

        ratingCache.set(userId, { data: responseData, timestamp: Date.now() });

        return res.status(200).json(responseData);
    } catch (error) {
        console.error("Failed to calculate rating:", error);
        return res.status(500).json({
            error: "Failed to calculate rating"
        });
    }
};
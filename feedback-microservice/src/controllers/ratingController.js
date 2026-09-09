import prisma from "../lib/prisma.js";
import { calculateRating } from "../services/ratingService.js";

const ratingCache = new Map();
const RATING_CACHE_TTL = 60 * 1000;

export const getAllRatingsSummary = async (req, res) => {
    try {
        const cached = ratingCache.get("__all_summary__");
        if (cached && Date.now() - cached.timestamp < RATING_CACHE_TTL) {
            return res.status(200).json(cached.data);
        }

        const ratings = await prisma.profileRating.findMany();
        const ratingsMap = {};
        let totalReviews = 0;
        let totalSum = 0;
        let ratedCount = 0;

        for (const r of ratings) {
            ratingsMap[r.userId] = {
                overallRating: r.overallRating,
                recentRating: r.recentRating,
                totalReviews: r.totalReviews
            };
            if (r.totalReviews > 0) {
                totalReviews += r.totalReviews;
                totalSum += r.overallRating;
                ratedCount++;
            }
        }

        const responseData = {
            ratings: ratingsMap,
            totalReviews,
            campusAvg: ratedCount > 0 ? (totalSum / ratedCount).toFixed(2) : "—"
        };

        ratingCache.set("__all_summary__", { data: responseData, timestamp: Date.now() });

        return res.status(200).json(responseData);
    } catch (error) {
        console.error("Failed to calculate ratings summary:", error);
        return res.status(500).json({
            error: "Failed to calculate ratings summary"
        });
    }
};

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
import prisma from "../lib/prisma.js";
import {
    createReview as createReviewService,
    getReviewsByReviewee,
    getReviewById
} from "../services/reviewService.js";

export const createReview = async (req, res) => {
    try {
        const {
            reviewer,
            reviewee,
            rating,
            reviewText,
            context,
            courseCode,
            courseName,
            tags
        } = req.body;

        // Validation
        if (!reviewer || !reviewer.userId) {
            return res.status(400).json({
                error: "Reviewer information is required"
            });
        }

        if (!reviewee || !reviewee.userId) {
            return res.status(400).json({
                error: "Reviewee teacher information is required"
            });
        }

        const numRating = Number(rating);
        if (!numRating || numRating < 1 || numRating > 5) {
            return res.status(400).json({
                error: "Rating must be an integer between 1 and 5"
            });
        }

        if (!reviewText || reviewText.trim() === "") {
            return res.status(400).json({
                error: "Review text cannot be empty"
            });
        }

        const review = await createReviewService({
            reviewerId: reviewer.userId,
            reviewerName: reviewer.name || reviewer.fullName || null,
            reviewerEmail: reviewer.email || null,
            reviewerRollNo: reviewer.rollNumber || null,
            reviewerBatch: reviewer.batch || null,
            reviewerBranch: reviewer.branch || null,
            revieweeId: reviewee.userId,
            courseCode: courseCode || null,
            courseName: courseName || null,
            rating: numRating,
            reviewText: reviewText.trim(),
            context: context || null,
            tags: tags || []
        });

        return res.status(201).json({
            review
        });
    } catch (error) {
        console.error("Create review error:", error);
        return res.status(400).json({
            error: error.message || "Failed to submit review"
        });
    }
};

export const getReviews = async (req, res) => {
    try {
        const { id } = req.params;

        let page = Number(req.query.page) || 1;
        let limit = Number(req.query.limit) || 20;

        if (page < 1) page = 1;
        if (limit < 1) limit = 10;
        if (limit > 50) limit = 50;

        const result = await getReviewsByReviewee(id, page, limit);

        const requesterEmail = req.headers["x-user-email"] ? req.headers["x-user-email"].toLowerCase() : "";
        let isAdmin = false;
        
        if (requesterEmail) {
            const user = await prisma.user.findUnique({
                where: { email: requesterEmail }
            });
            if (user && user.role === "ADMIN") {
                isAdmin = true;
            } else {
                const localPart = requesterEmail.split("@")[0] || "";
                const baseLocalPart = localPart.split("+")[0];
                const aliasPart = localPart.includes("+") ? localPart.split("+")[1] : "";
                const adminEmails = ["doaa", "dosa", "admin"];
                isAdmin = adminEmails.includes(baseLocalPart) || adminEmails.includes(aliasPart);
            }
        }

        // Anonymize for non-admins
        const processedReviews = isAdmin ? result.reviews : result.reviews.map(review => ({
            ...review,
            reviewerName: "Anonymous Student",
            reviewerEmail: null,
            reviewerRollNo: null,
            reviewerBatch: null,
            reviewerBranch: null
        }));

        return res.status(200).json({
            reviewee: {
                userId: id
            },
            page,
            limit,
            totalReviews: result.totalReviews,
            reviews: processedReviews
        });
    } catch (error) {
        console.error("Get reviews error:", error);
        return res.status(500).json({
            error: "Failed to retrieve reviews"
        });
    }
};

export const getSingleReview = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await getReviewById(id);
        if (!review) {
            return res.status(404).json({ error: "Review not found" });
        }
        const requesterEmail = req.headers["x-user-email"] ? req.headers["x-user-email"].toLowerCase() : "";
        const localPart = requesterEmail.split("@")[0] || "";
        const baseLocalPart = localPart.split("+")[0];
        const aliasPart = localPart.includes("+") ? localPart.split("+")[1] : "";
        
        const adminEmails = ["doaa", "dosa", "admin"];
        const isAdmin = requesterEmail && (adminEmails.includes(baseLocalPart) || adminEmails.includes(aliasPart));

        const processedReview = isAdmin ? review : {
            ...review,
            reviewerName: "Anonymous Student",
            reviewerEmail: null,
            reviewerRollNo: null,
            reviewerBatch: null,
            reviewerBranch: null
        };

        return res.status(200).json({ review: processedReview });
    } catch (error) {
        console.error("Get single review error:", error);
        return res.status(500).json({ error: "Failed to retrieve review" });
    }
};
export const getPublicTags = async (req, res) => {
    try {
        const tags = await prisma.communityTag.findMany({
            orderBy: { name: 'asc' }
        });
        res.json({ tags });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const getTeacherTagStats = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const reviews = await prisma.review.findMany({
            where: { revieweeId: teacherId },
            select: { tags: true }
        });
        
        const counts = {};
        let totalTags = 0;
        
        reviews.forEach(r => {
            if (r.tags && r.tags.length > 0) {
                const validTags = r.tags.filter(t => t !== "None of these fit");
                validTags.forEach(t => {
                    counts[t] = (counts[t] || 0) + 1;
                    totalTags++;
                });
            }
        });
        
        const stats = Object.entries(counts).map(([name, count]) => ({
            name,
            count,
            percentage: totalTags > 0 ? Math.round((count / totalTags) * 100) : 0
        })).sort((a, b) => b.count - a.count);
        
                const totalReviewsWithTags = reviews.filter(r => r.tags && r.tags.length > 0).length;
        const MIN_REVIEWS_FOR_TAGS = 5;
        const sufficientData = totalReviewsWithTags >= MIN_REVIEWS_FOR_TAGS;
        const needed = Math.max(0, MIN_REVIEWS_FOR_TAGS - totalReviewsWithTags);
        
        res.json({ stats, totalReviewsWithTags, sufficientData, needed });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

import { generateTeacherSummaries } from "../services/aiService.js";

// Basic in-memory cache to save API calls
const aiSummaryCache = new Map();

export const getTeacherAISummary = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const cacheKey = `ai-summary-${teacherId}`;

        if (aiSummaryCache.has(cacheKey)) {
            return res.json({ summary: aiSummaryCache.get(cacheKey) });
        }

        const reviews = await prisma.review.findMany({
            where: { revieweeId: teacherId },
            select: { reviewText: true },
        });

        if (!reviews || reviews.length === 0) {
            return res.status(404).json({ error: "No reviews found for this teacher" });
        }

        const summary = await generateTeacherSummaries(reviews);
        
        // Cache the result to avoid repeating LLM calls
        aiSummaryCache.set(cacheKey, summary);

        res.json({ summary });
    } catch (e) {
        console.error("Failed to generate AI summary:", e);
        res.status(500).json({ error: e.message || "Failed to generate AI insights" });
    }
};

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
            courseName
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
            context: context || null
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

        return res.status(200).json({
            reviewee: {
                userId: id
            },
            page,
            limit,
            totalReviews: result.totalReviews,
            reviews: result.reviews
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
        return res.status(200).json({ review });
    } catch (error) {
        console.error("Get single review error:", error);
        return res.status(500).json({ error: "Failed to retrieve review" });
    }
};

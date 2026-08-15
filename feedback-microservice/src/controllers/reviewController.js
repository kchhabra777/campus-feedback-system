import {
    createReview as createReviewService,
    getReviewsByReviewee
} from "../services/reviewService.js";


const createReview = async (req, res) => {

    try {

        const {
            reviewer,
            reviewee,
            rating,
            reviewText,
            context
        } = req.body;

        // Basic validation
        if (!reviewer || !reviewer.userId) {
            return res.status(400).json({
                error: "Reviewer is required"
            });
        }

        if (!reviewee || !reviewee.userId) {
            return res.status(400).json({
                error: "Reviewee is required"
            });
        }

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                error: "Rating must be between 1 and 5"
            });
        }

        if (!reviewText || reviewText.trim() === "") {
            return res.status(400).json({
                error: "Review text is required"
            });
        }

        const review = await createReviewService({
            reviewerId: reviewer.userId,
            revieweeId: reviewee.userId,
            rating,
            reviewText,
            context
        });

        return res.status(201).json({
            review
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: "Failed to create review"
        });
    }
};

export const getReviews = async (req, res) => {

    try {

        const { id } = req.params;

        let page = Number(req.query.page) || 1;
        let limit = Number(req.query.limit) || 10;

        if (page < 1) {
            page = 1;
        }

        if (limit < 1) {
            limit = 10;
        }

        if (limit > 50) {
            limit = 50;
        }

        const result = await getReviewsByReviewee(
            id,
            page,
            limit
        );

        return res.status(200).json({
            reviewee: {
                userId: id
            },
            page: page,
            limit: limit,
            totalReviews: result.totalReviews,
            reviews: result.reviews
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: "Failed to get reviews"
        });
    }
};
export { createReview };

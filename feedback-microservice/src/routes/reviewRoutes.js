import express from "express";
import {
    createReview,
    getReviews,
    getSingleReview
} from "../controllers/reviewController.js";

const router = express.Router();

router.post("/", createReview);
router.get("/reviewee/:id", getReviews);
router.get("/:id", getSingleReview);

export default router;

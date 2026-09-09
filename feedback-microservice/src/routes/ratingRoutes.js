import express from "express";

import {
    getRating,
    getAllRatingsSummary
} from "../controllers/ratingController.js";


const router = express.Router();

router.get("/batch/summary", getAllRatingsSummary);
router.get("/:userId", getRating);


export default router;
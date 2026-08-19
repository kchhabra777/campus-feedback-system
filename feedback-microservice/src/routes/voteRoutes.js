import express from "express";
import { voteReview } from "../controllers/voteController.js";

const router = express.Router();

// Support both /reviews/:id/vote and /reviews/:id/votes
router.post("/:id/vote", voteReview);
router.post("/:id/votes", voteReview);

export default router;
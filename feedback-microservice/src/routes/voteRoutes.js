import express from "express";

import {
    voteReview
} from "../controllers/voteController.js";

const router = express.Router();

router.post("/:id/votes", voteReview);

export default router;
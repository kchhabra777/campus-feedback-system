import express from "express";
import { createReply, getReplies, voteOnReply } from "../controllers/replyController.js";

const router = express.Router();

router.post("/:id/replies", createReply);
router.get("/:id/replies", getReplies);
router.post("/replies/:replyId/vote", voteOnReply);

export default router;

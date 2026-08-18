import express from "express";
import { createReply, getReplies } from "../controllers/replyController.js";

const router = express.Router();

router.post("/:id/replies", createReply);
router.get("/:id/replies", getReplies);

export default router;

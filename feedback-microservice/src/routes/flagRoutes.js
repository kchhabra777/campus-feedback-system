import express from "express";
import { flagReview, listFlags } from "../controllers/flagController.js";

const router = express.Router();

router.get("/flags", listFlags);
router.post("/:id/flag", flagReview);
router.post("/:id/flags", flagReview);

export default router;
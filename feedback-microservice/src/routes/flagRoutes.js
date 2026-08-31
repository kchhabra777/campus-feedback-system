import express from "express";
import { flagReview, listFlags, resolveFlag } from "../controllers/flagController.js";

const router = express.Router();

router.get("/flags", listFlags);
router.post("/flags/:id/resolve", resolveFlag);
router.post("/:id/flag", flagReview);
router.post("/:id/flags", flagReview);

export default router;
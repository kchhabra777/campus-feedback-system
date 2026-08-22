import express from "express";
import {
  createOffering,
  updateOffering,
  deleteOffering,
  getMyOfferings,
  getEligibleTeachers,
  checkEligibility
} from "../controllers/courseController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post("/offerings", requireAuth, requireRole("TEACHER"), createOffering);
router.put("/offerings/:id", requireAuth, requireRole("TEACHER"), updateOffering);
router.delete("/offerings/:id", requireAuth, requireRole("TEACHER"), deleteOffering);
router.get("/my-offerings", requireAuth, requireRole("TEACHER"), getMyOfferings);
router.get("/eligible-teachers", requireAuth, requireRole("STUDENT"), getEligibleTeachers);
router.get("/check-eligibility", requireAuth, requireRole("STUDENT"), checkEligibility);

export default router;

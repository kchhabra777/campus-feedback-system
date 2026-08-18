import express from "express";
import {
  onboardStudent,
  onboardTeacher,
  listTeachers,
  getTeacherProfile
} from "../controllers/profileController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post("/student", requireAuth, requireRole("STUDENT"), onboardStudent);
router.post("/teacher", requireAuth, requireRole("TEACHER"), onboardTeacher);
router.get("/teachers", listTeachers);
router.get("/teachers/:id", getTeacherProfile);

export default router;

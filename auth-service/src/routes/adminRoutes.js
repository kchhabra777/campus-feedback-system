import express from "express";
import {
  getStudents,
  banUser,
  registerTeacher,
  deleteTeacher,
  getTeacherCourses,
  addTeacherCourse,
  deleteTeacherCourse
} from "../controllers/adminController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(requireAuth, requireRole("ADMIN"));

router.get("/students", getStudents);
router.patch("/users/:id/ban", banUser);
router.post("/register-teacher", registerTeacher);
router.delete("/teachers/:id", deleteTeacher);

router.get("/teachers/:id/courses", getTeacherCourses);
router.post("/teachers/:id/courses", addTeacherCourse);
router.delete("/courses/:courseId", deleteTeacherCourse);

export default router;

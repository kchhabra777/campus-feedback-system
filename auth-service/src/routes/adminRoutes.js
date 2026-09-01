import express from "express";
import {
  getStudents,
  banUser,
  registerTeacher,
  deleteTeacher,
  getTeacherCourses,
  addTeacherCourse,
  deleteTeacherCourse,
  updateTeacherCourse,
  updateStudent,
  updateTeacher,
  getCommunityTags,
  addCommunityTag,
  updateCommunityTag,
  deleteCommunityTag
} from "../controllers/adminController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(requireAuth, requireRole("ADMIN"));

router.get("/tags", getCommunityTags);
router.post("/tags", addCommunityTag);
router.put("/tags/:id", updateCommunityTag);
router.delete("/tags/:id", deleteCommunityTag);

router.get("/students", getStudents);
router.put("/students/:id", updateStudent);
router.patch("/users/:id/ban", banUser);
router.post("/register-teacher", registerTeacher);
router.put("/teachers/:id", updateTeacher);
router.delete("/teachers/:id", deleteTeacher);

router.get("/teachers/:id/courses", getTeacherCourses);
router.post("/teachers/:id/courses", addTeacherCourse);
router.put("/courses/:courseId", updateTeacherCourse);
router.delete("/courses/:courseId", deleteTeacherCourse);

export default router;

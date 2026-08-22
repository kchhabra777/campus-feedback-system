import {
  addCourseOffering,
  getTeacherOfferings,
  getEligibleTeachersForStudent,
  verifyStudentTeacherEligibility
} from "../services/courseService.js";
import prisma from "../lib/prisma.js";

export const createOffering = async (req, res) => {
  try {
    const { courseCode, courseName, batchTaught, branchTaught, academicYear } = req.body;

    const offering = await addCourseOffering({
      teacherUserId: req.user.id,
      courseCode,
      courseName,
      batchTaught,
      branchTaught,
      academicYear
    });

    return res.status(201).json({
      success: true,
      message: "Course offering registered successfully",
      offering
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const getMyOfferings = async (req, res) => {
  try {
    const offerings = await getTeacherOfferings(req.user.id);
    return res.status(200).json({ offerings });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch course offerings" });
  }
};

export const getEligibleTeachers = async (req, res) => {
  try {
    let batch = req.query.batch;
    let branch = req.query.branch;

    if (!batch && req.user?.id) {
      const student = await prisma.studentProfile.findUnique({
        where: { userId: req.user.id }
      });
      if (student) {
        batch = student.batch;
        branch = branch || student.branch;
      }
    }

    if (!batch) {
      batch = req.user?.studentProfile?.batch || req.user?.detectedBatch || "3Q11";
      branch = branch || req.user?.studentProfile?.branch || "COE";
    }

    const teachers = await getEligibleTeachersForStudent({ batch, branch });
    return res.status(200).json({ teachers });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to fetch eligible teachers" });
  }
};

export const checkEligibility = async (req, res) => {
  try {
    const { teacherId, courseCode } = req.query;
    if (!teacherId) {
      return res.status(400).json({ error: "Teacher ID is required." });
    }

    const result = await verifyStudentTeacherEligibility({
      studentUserId: req.user.id,
      teacherUserId: teacherId,
      courseCode
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

import {
  addCourseOffering,
  getTeacherOfferings,
  getEligibleTeachersForStudent,
  verifyStudentTeacherEligibility
} from "../services/courseService.js";

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
    const batch = req.query.batch || req.user?.studentProfile?.batch || req.user?.detectedBatch;
    const branch = req.query.branch || req.user?.studentProfile?.branch;

    const teachers = await getEligibleTeachersForStudent({ batch, branch });
    return res.status(200).json({ teachers });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch eligible teachers" });
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

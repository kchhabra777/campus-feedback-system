import {
  saveStudentProfile,
  saveTeacherProfile,
  getAllTeachers,
  getTeacherById
} from "../services/profileService.js";

export const onboardStudent = async (req, res) => {
  try {
    const { fullName, rollNumber, branch, batch, yearOfStudy } = req.body;

    const profile = await saveStudentProfile({
      userId: req.user.id,
      fullName,
      rollNumber,
      branch,
      batch: batch || req.user.detectedBatch,
      yearOfStudy
    });

    return res.status(200).json({
      success: true,
      message: "Student profile saved successfully",
      profile
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const onboardTeacher = async (req, res) => {
  try {
    const { fullName, department, designation, offerings } = req.body;

    const profile = await saveTeacherProfile({
      userId: req.user.id,
      fullName,
      department,
      designation,
      offerings
    });

    return res.status(200).json({
      success: true,
      message: "Teacher profile saved successfully",
      profile
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

let allTeachersCache = null;
let allTeachersCacheTime = 0;
const TEACHERS_CACHE_TTL = 60 * 1000;

export const listTeachers = async (req, res) => {
  try {
    if (allTeachersCache && Date.now() - allTeachersCacheTime < TEACHERS_CACHE_TTL) {
      return res.status(200).json({ teachers: allTeachersCache });
    }

    const teachers = await getAllTeachers();
    allTeachersCache = teachers;
    allTeachersCacheTime = Date.now();

    return res.status(200).json({ teachers });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch teachers" });
  }
};

export const getTeacherProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await getTeacherById(id);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }
    return res.status(200).json({ teacher });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch teacher profile" });
  }
};

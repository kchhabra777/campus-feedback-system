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

import prisma from "../lib/prisma.js";

let allTeachersCache = null;
let allTeachersCacheTime = 0;
const TEACHERS_CACHE_TTL = 60 * 1000;

export const invalidateTeachersCache = () => {
  allTeachersCache = null;
  allTeachersCacheTime = 0;
};

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

export const suggestTeacherName = async (req, res) => {
  try {
    const { id } = req.params; // teacherId (TeacherProfile id or userId)
    const {
      suggestedName,
      suggestedDept,
      suggestedCourseCode,
      suggestedCourseName,
      suggestedLtp,
      courseOfferingId,
      notes
    } = req.body;

    if (!suggestedName || !suggestedName.trim()) {
      return res.status(400).json({ error: "Suggested full name is required" });
    }

    // Find teacher
    const teacher = await prisma.teacherProfile.findFirst({
      where: {
        OR: [{ id }, { userId: id }]
      },
      include: { offerings: true }
    });

    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    // Fetch submitting student profile to check CR status and roll number
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id }
    });

    const isCR = student ? student.isCR : false;
    const studentBatch = student ? student.batch : null;

    const suggestion = await prisma.teacherNameSuggestion.create({
      data: {
        teacherId: teacher.id,
        suggestedName: suggestedName.trim(),
        suggestedDept: suggestedDept?.trim() || null,
        suggestedCourseCode: suggestedCourseCode ? suggestedCourseCode.trim().toUpperCase() : null,
        suggestedCourseName: suggestedCourseName ? suggestedCourseName.trim() : null,
        suggestedLtp: suggestedLtp ? suggestedLtp.trim().toUpperCase() : null,
        courseOfferingId: courseOfferingId || null,
        notes: notes?.trim() || null,
        studentId: req.user.id,
        studentRollNo: student?.rollNumber || null,
        studentEmail: req.user.email || null,
        isCR: Boolean(isCR),
        batch: studentBatch,
        status: "PENDING"
      }
    });

    return res.status(201).json({
      success: true,
      message: isCR
        ? "Submitted as Official Batch CR! Prioritized for admin approval."
        : "Suggestion submitted successfully for campus verification.",
      suggestion
    });
  } catch (error) {
    console.error("Failed to submit teacher name suggestion:", error);
    return res.status(500).json({ error: "Failed to submit suggestion" });
  }
};

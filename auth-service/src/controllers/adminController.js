import prisma from "../lib/prisma.js";

export const getStudents = async (req, res) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      include: { studentProfile: true },
      orderBy: { 
        studentProfile: {
          rollNumber: 'asc'
        }
      }
    });
    res.status(200).json({ students });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch students" });
  }
};

export const banUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { isBanned } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { isBanned: Boolean(isBanned) }
    });
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: "Failed to update ban status" });
  }
};

export const registerTeacher = async (req, res) => {
  try {
    const { fullName, email, department, designation } = req.body;

    const normalized = email.trim().toLowerCase();
    
    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email: normalized } });
    if (existing) {
      return res.status(400).json({ error: "User with this email already exists." });
    }

    // Create user with PENDING password
    const user = await prisma.user.create({
      data: {
        email: normalized,
        passwordHash: "PENDING",
        role: "TEACHER",
        isEmailVerified: false,
        isProfileComplete: true, // we complete profile right away
        teacherProfile: {
          create: {
            fullName,
            department,
            designation
          }
        }
      },
      include: { teacherProfile: true }
    });

    res.status(201).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: "Failed to register teacher" });
  }
};

export const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete teacher profile and user
    await prisma.user.delete({
      where: { id }
    });

    res.status(200).json({ success: true, message: "Teacher deleted successfully" });
  } catch (error) {
    console.error("Failed to delete teacher:", error);
    res.status(500).json({ error: "Failed to delete teacher" });
  }
};
export const getTeacherCourses = async (req, res) => {
  try {
    const { id } = req.params;
    const courses = await prisma.courseOffering.findMany({
      where: { teacherUserId: id }
    });
    res.status(200).json({ courses });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

export const addTeacherCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { courseCode, courseName, batchTaught, branchTaught, academicYear } = req.body;
    const course = await prisma.courseOffering.create({
      data: {
        teacherUserId: id,
        courseCode,
        courseName,
        batchTaught,
        branchTaught,
        academicYear
      }
    });
    res.status(201).json({ course });
  } catch (error) {
    res.status(500).json({ error: "Failed to add course" });
  }
};

export const deleteTeacherCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    await prisma.courseOffering.delete({
      where: { id: courseId }
    });
    res.status(200).json({ message: "Course deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete course" });
  }
};

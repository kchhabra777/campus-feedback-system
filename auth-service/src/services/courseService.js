import prisma from "../lib/prisma.js";

export const addCourseOffering = async ({
  teacherUserId,
  courseCode,
  courseName,
  batchTaught,
  branchTaught,
  academicYear
}) => {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { userId: teacherUserId }
  });

  if (!teacher) {
    throw new Error("Teacher profile not found. Please complete profile onboarding first.");
  }

  if (!courseCode || !courseName || !batchTaught) {
    throw new Error("Course Code, Course Name, and Batch Taught are required.");
  }

  return await prisma.courseOffering.create({
    data: {
      teacherId: teacher.id,
      courseCode: courseCode.trim().toUpperCase(),
      courseName: courseName.trim(),
      batchTaught: batchTaught.trim().toUpperCase(),
      branchTaught: (branchTaught && branchTaught.trim().toUpperCase()) || "ALL",
      academicYear: (academicYear && academicYear.trim()) || "2024-2025"
    }
  });
};

export const getTeacherOfferings = async (teacherUserId) => {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { userId: teacherUserId },
    include: { offerings: true }
  });

  return teacher?.offerings || [];
};

export const getEligibleTeachersForStudent = async ({ batch, branch }) => {
  const normalizedBatch = batch ? batch.trim().toUpperCase() : "";
  const normalizedBranch = branch ? branch.trim().toUpperCase() : "";

  // Find all course offerings where batch matches student batch (or ALL)
  const offerings = await prisma.courseOffering.findMany({
    where: {
      OR: [
        { batchTaught: normalizedBatch },
        { batchTaught: "ALL" }
      ]
    },
    include: {
      teacher: {
        include: {
          user: {
            select: {
              id: true,
              email: true
            }
          }
        }
      }
    }
  });

  // Filter by branch if specific
  const filteredOfferings = offerings.filter((off) => {
    if (off.branchTaught === "ALL") return true;
    if (!normalizedBranch) return true;
    return off.branchTaught.includes(normalizedBranch) || normalizedBranch.includes(off.branchTaught);
  });

  // Group by teacher
  const teacherMap = new Map();

  for (const off of filteredOfferings) {
    const teacherId = off.teacher.user.id;
    if (!teacherMap.has(teacherId)) {
      teacherMap.set(teacherId, {
        userId: off.teacher.user.id,
        email: off.teacher.user.email,
        fullName: off.teacher.fullName,
        department: off.teacher.department,
        designation: off.teacher.designation,
        courses: []
      });
    }

    teacherMap.get(teacherId).courses.push({
      id: off.id,
      courseCode: off.courseCode,
      courseName: off.courseName,
      batchTaught: off.batchTaught,
      branchTaught: off.branchTaught,
      academicYear: off.academicYear
    });
  }

  return Array.from(teacherMap.values());
};

export const verifyStudentTeacherEligibility = async ({ studentUserId, teacherUserId, courseCode }) => {
  const student = await prisma.studentProfile.findUnique({
    where: { userId: studentUserId }
  });

  if (!student) {
    return { eligible: false, reason: "Student profile not found" };
  }

  const teacher = await prisma.teacherProfile.findUnique({
    where: { userId: teacherUserId },
    include: { offerings: true }
  });

  if (!teacher) {
    return { eligible: false, reason: "Teacher profile not found" };
  }

  // Check if teacher has any offering matching student's batch
  const matchingOffering = teacher.offerings.find((off) => {
    const batchMatches = off.batchTaught === student.batch || off.batchTaught === "ALL";
    const branchMatches = off.branchTaught === "ALL" || off.branchTaught === student.branch;
    const courseMatches = !courseCode || off.courseCode === courseCode.toUpperCase();
    return batchMatches && branchMatches && courseMatches;
  });

  if (!matchingOffering && teacher.offerings.length > 0) {
    return {
      eligible: false,
      reason: `Teacher is not registered as having taught batch ${student.batch} (${student.branch})`
    };
  }

  return {
    eligible: true,
    matchingCourse: matchingOffering || null
  };
};

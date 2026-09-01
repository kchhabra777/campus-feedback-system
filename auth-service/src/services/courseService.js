import prisma from "../lib/prisma.js";

export const ALLOWED_BATCHES = [
  "3Q11", "3Q12", "3Q13", "3Q14", "3Q15",
  "2Q11", "2Q12", "2Q13", "2Q14", "2Q15",
  "3A1", "3A2", "3A3", "3B1", "3B2", "3C1", "3C2",
  "4Q11", "4Q12", "1Q11", "1Q12"
];

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
      academicYear: (academicYear && academicYear.trim()) || "2026-2027 ODD"
    }
  });
};

export const updateCourseOffering = async ({
  offeringId,
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
    throw new Error("Teacher profile not found.");
  }

  const existingOffering = await prisma.courseOffering.findUnique({
    where: { id: offeringId }
  });

  if (!existingOffering) {
    throw new Error("Course offering not found.");
  }

  if (existingOffering.teacherId !== teacher.id) {
    throw new Error("Unauthorized: You can only edit your own course offerings.");
  }

  return await prisma.courseOffering.update({
    where: { id: offeringId },
    data: {
      ...(courseCode ? { courseCode: courseCode.trim().toUpperCase() } : {}),
      ...(courseName ? { courseName: courseName.trim() } : {}),
      ...(batchTaught ? { batchTaught: batchTaught.trim().toUpperCase() } : {}),
      ...(branchTaught ? { branchTaught: branchTaught.trim().toUpperCase() } : {}),
      ...(academicYear ? { academicYear: academicYear.trim() } : {})
    }
  });
};

export const deleteCourseOffering = async ({ offeringId, teacherUserId }) => {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { userId: teacherUserId }
  });

  if (!teacher) {
    throw new Error("Teacher profile not found.");
  }

  const existingOffering = await prisma.courseOffering.findUnique({
    where: { id: offeringId }
  });

  if (!existingOffering) {
    throw new Error("Course offering not found.");
  }

  if (existingOffering.teacherId !== teacher.id) {
    throw new Error("Unauthorized: You can only delete your own course offerings.");
  }

  await prisma.courseOffering.delete({
    where: { id: offeringId }
  });

  return { success: true, message: "Course offering deleted successfully." };
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

  // Find all offerings
  const allOfferings = await prisma.courseOffering.findMany({
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

  // Filter matching batch (exact, comma-separated, or ALL) and branch
  const filteredOfferings = allOfferings.filter((off) => {
    const batches = off.batchTaught.split(",").map((b) => b.trim().toUpperCase());
    const batchMatches = off.batchTaught === "ALL" || batches.includes(normalizedBatch) || off.batchTaught === normalizedBatch;
    if (!batchMatches) return false;

    if (off.branchTaught === "ALL") return true;
    if (!normalizedBranch) return true;
    const branches = off.branchTaught.split(",").map((b) => b.trim().toUpperCase());
    
    // Check direct equality or bidirectional substring (e.g., "COE" in "Computer Engineering (COE)")
    const directMatch = branches.includes(normalizedBranch) || off.branchTaught.includes(normalizedBranch) || normalizedBranch.includes(off.branchTaught);
    if (directMatch) return true;

    // Check acronym extraction inside parentheses: "Computer Engineering (COE)" -> "COE"
    const match = normalizedBranch.match(/\(([^)]+)\)/);
    if (match && branches.includes(match[1].trim().toUpperCase())) return true;

    return false;
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
      ltp: off.ltp || "L",
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
    const batches = off.batchTaught.split(",").map((b) => b.trim().toUpperCase());
    const batchMatches = off.batchTaught === "ALL" || batches.includes(student.batch) || off.batchTaught === student.batch;
    const branches = off.branchTaught.split(",").map((b) => b.trim().toUpperCase());
    const branchMatches = off.branchTaught === "ALL" || branches.includes(student.branch) || off.branchTaught.includes(student.branch);
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

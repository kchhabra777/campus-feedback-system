import prisma from "../lib/prisma.js";

export const ALLOWED_BATCHES = [
  "3Q11", "3Q12", "3Q13", "3Q14", "3Q15",
  "2Q11", "2Q12", "2Q13", "2Q14", "2Q15"
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
    return branches.includes(normalizedBranch) || off.branchTaught.includes(normalizedBranch);
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

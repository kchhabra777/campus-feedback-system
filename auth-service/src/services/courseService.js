import prisma from "../lib/prisma.js";

export const ALLOWED_BATCHES = [
  "3Q11", "3Q12", "3Q13", "3Q14", "3Q15",
  "3Q21", "3Q22", "3Q23", "3Q24", "3Q25",
  "3Q31", "3Q32", "3Q33", "3Q34", "3Q35",
  "3P11", "3P12", "3P13", "3P14", "3Q41",
  "3C11", "3C12", "3C13", "3C14", "3C15", "3C16", "3C17", "3C18",
  "3C21", "3C22", "3C23", "3C24", "3C25",
  "3C31", "3C32", "3C33", "3C34", "3C35",
  "3C41", "3C42", "3C43", "3C44", "3C45",
  "3C51", "3C52", "3C53", "3C54", "3C55",
  "3C61", "3C62", "3C63", "3C64", "3C65",
  "3C71", "3C72", "3C73", "3C74", "3C75",
  "3X11", "3X12", "3X13", "3X14", "3X15",
  "3E11", "3E12", "3D11", "3D12", "3D13",
  "3H11", "3H12", "3H13", "3H21", "3H22", "3H23",
  "3I11", "3I12", "3I13", "3W11", "3W12", "3W13", "3W14",
  "3A11", "3A12", "3G11", "3G12", "3G13", "3G14",
  "3B11", "3B12", "3B13", "3U11",
  "3S11", "3S12", "3S13", "3S14", "3S15",
  "3J11", "3R11", "3R12", "3R13",
  "3O11", "3O12", "3O13", "3O14", "3O21", "3O22", "3O23", "3O24", "3O31", "3O32", "3O33", "3O34",
  "3F11", "3F12", "3F13", "3F14", "3F21", "3F22", "3F23", "3F31", "3F32", "3F33",
  "3V11", "3V12", "3V13",
  "2Q11", "2Q12", "2Q13", "2Q14", "2Q15",
  "4Q11", "4Q12", "1Q11", "1Q12", "ALL"
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

  const BRANCH_ALIASES = {
    "COE": ["COMPUTER ENGG", "COMPUTER ENGINEERING"],
    "CSE": ["COMPUTER SCIENCE", "COMPUTER SCIENCE AND ENGG", "COMPUTER SCIENCE AND ENGINEERING"],
    "COPC": ["COMPUTER SCIENCE", "COMPUTER SCIENCE AND ENGG", "COMPUTER SCIENCE AND ENGINEERING"],
    "ENC": ["ELECTRONICS AND COMPUTER", "ELECTRONICS AND COMPUTER ENGG"],
    "ECE": ["ELECTRONICS AND COMMUNICATION", "ELECTRONICS AND COMMUNICATION ENGG"],
    "EIC": ["ELECTRONICS INSTRUMENTATION", "ELECTRONICS INSTRUMENTATION ENGG"],
    "ELE": ["ELECTRICAL", "ELECTRICAL ENGG"],
    "MEC": ["MECHANICAL", "MECHANICAL ENGG"],
    "CIV": ["CIVIL", "CIVIL ENGG"],
    "CHE": ["CHEMICAL", "CHEMICAL ENGG"],
    "BIO": ["BIOTECHNOLOGY", "BIOTECHNOLOGY ENGG"]
  };

  // Filter matching batch (exact, comma-separated, or ALL) and branch
  const filteredOfferings = allOfferings.filter((off) => {
    const batches = off.batchTaught.split(",").map((b) => b.trim().toUpperCase());
    const isSpecificBatchMatch = batches.includes(normalizedBatch) || off.batchTaught === normalizedBatch;
    const isAllBatch = off.batchTaught === "ALL";

    if (!isSpecificBatchMatch && !isAllBatch) return false;

    // If it's a specific batch match (e.g., 3C11 or 3Q11), in Thapar that batch uniquely belongs to that curriculum!
    if (isSpecificBatchMatch) return true;

    if (off.branchTaught === "ALL") return true;
    if (!normalizedBranch) return true;
    const branches = off.branchTaught.split(",").map((b) => b.trim().toUpperCase());
    
    // Check direct equality or bidirectional substring
    const directMatch = branches.includes(normalizedBranch) || off.branchTaught.includes(normalizedBranch) || normalizedBranch.includes(off.branchTaught);
    if (directMatch) return true;

    // Check acronym aliases
    for (const [alias, aliasList] of Object.entries(BRANCH_ALIASES)) {
      if (normalizedBranch.includes(alias)) {
        if (aliasList.some((alt) => off.branchTaught.includes(alt) || branches.includes(alt))) {
          return true;
        }
      }
    }

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
    const isSpecificBatchMatch = batches.includes(student.batch) || off.batchTaught === student.batch;
    const isAllBatch = off.batchTaught === "ALL";

    if (!isSpecificBatchMatch && !isAllBatch) return false;
    
    // If specific batch match, in Thapar this batch uniquely belongs to that curriculum!
    if (isSpecificBatchMatch) {
      const courseMatches = !courseCode || off.courseCode === courseCode.toUpperCase();
      return courseMatches;
    }

    const branches = off.branchTaught.split(",").map((b) => b.trim().toUpperCase());
    const branchMatches = off.branchTaught === "ALL" || branches.includes(student.branch) || off.branchTaught.includes(student.branch);
    const courseMatches = !courseCode || off.courseCode === courseCode.toUpperCase();
    return branchMatches && courseMatches;
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

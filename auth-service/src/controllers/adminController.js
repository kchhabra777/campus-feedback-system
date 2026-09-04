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

    // 1. Find teacher profile by profile id OR by userId
    const teacherProfile = await prisma.teacherProfile.findFirst({
      where: {
        OR: [
          { id },
          { userId: id }
        ]
      }
    });

    const targetUserId = teacherProfile?.userId || id;
    const profileId = teacherProfile?.id;

    // 2. Cascade delete course offerings if any
    if (profileId) {
      await prisma.courseOffering.deleteMany({
        where: { teacherId: profileId }
      });
      await prisma.teacherProfile.deleteMany({
        where: { id: profileId }
      });
    }

    // 3. Cleanup ratings and reviews associated with this teacher
    try {
      await prisma.profileRating.deleteMany({
        where: {
          OR: [
            { userId: targetUserId },
            ...(profileId ? [{ userId: profileId }] : [])
          ]
        }
      });
      await prisma.review.deleteMany({
        where: {
          OR: [
            { revieweeId: targetUserId },
            ...(profileId ? [{ revieweeId: profileId }] : [])
          ]
        }
      });
    } catch (e) {
      console.warn("Cleanup reviews/ratings note:", e.message);
    }

    // 4. Delete user record if exists
    await prisma.user.deleteMany({
      where: { id: targetUserId }
    });

    res.status(200).json({ success: true, message: "Teacher deleted successfully" });
  } catch (error) {
    console.error("Failed to delete teacher:", error);
    res.status(500).json({ error: error.message || "Failed to delete teacher" });
  }
};
export const getTeacherCourses = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find teacher profile first by userId or profile id
    const teacherProfile = await prisma.teacherProfile.findFirst({
      where: {
        OR: [
          { userId: id },
          { id }
        ]
      }
    });
    
    if (!teacherProfile) return res.status(404).json({ error: "Teacher profile not found" });

    const courses = await prisma.courseOffering.findMany({
      where: { teacherId: teacherProfile.id }
    });
    res.status(200).json({ courses });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

export const addTeacherCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { courseCode, courseName, batchTaught, branchTaught, academicYear, ltp } = req.body;
    
    // Find teacher profile first by userId or profile id
    const teacherProfile = await prisma.teacherProfile.findFirst({
      where: {
        OR: [
          { userId: id },
          { id }
        ]
      }
    });
    
    if (!teacherProfile) return res.status(404).json({ error: "Teacher profile not found" });

    const course = await prisma.courseOffering.create({
      data: {
        teacherId: teacherProfile.id,
        courseCode,
        courseName,
        batchTaught,
        branchTaught,
        academicYear,
        ltp: ltp || "L"
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

export const updateTeacherCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { courseCode, courseName, batchTaught, branchTaught, ltp, academicYear } = req.body;
    
    const updated = await prisma.courseOffering.update({
      where: { id: courseId },
      data: { courseCode, courseName, batchTaught, branchTaught, ltp, academicYear }
    });
    res.status(200).json({ message: "Course updated", course: updated });
  } catch (error) {
    res.status(500).json({ error: "Failed to update course" });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, rollNumber } = req.body;
    
    const updated = await prisma.studentProfile.update({
      where: { userId: id },
      data: { fullName, rollNumber }
    });
    res.status(200).json({ message: "Student updated", profile: updated });
  } catch (error) {
    res.status(500).json({ error: "Failed to update student" });
  }
};

export const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, department, designation } = req.body;
    
    const teacherProfile = await prisma.teacherProfile.findFirst({
      where: {
        OR: [
          { userId: id },
          { id }
        ]
      }
    });

    if (!teacherProfile) return res.status(404).json({ error: "Teacher profile not found" });

    const updated = await prisma.teacherProfile.update({
      where: { id: teacherProfile.id },
      data: { fullName, department, designation }
    });
    res.status(200).json({ message: "Teacher updated", profile: updated });
  } catch (error) {
    res.status(500).json({ error: "Failed to update teacher" });
  }
};

export const getCommunityTags = async (req, res) => {
  try {
    const tags = await prisma.communityTag.findMany({ orderBy: { type: 'desc' } });
    res.status(200).json({ tags });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tags" });
  }
};

export const addCommunityTag = async (req, res) => {
  try {
    const { name, type, opposite } = req.body;
    const tag = await prisma.communityTag.create({ data: { name, type, opposite } });
    res.status(201).json({ tag });
  } catch (error) {
    res.status(500).json({ error: "Failed to add tag" });
  }
};

export const updateCommunityTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, opposite } = req.body;
    
    // Get old tag to cascade updates to reviews
    const oldTag = await prisma.communityTag.findUnique({ where: { id: parseInt(id) } });
    
    const tag = await prisma.communityTag.update({
      where: { id: parseInt(id) },
      data: { name, type, opposite }
    });
    
    // If the name changed, we MUST update all existing reviews so old tags don't get orphaned
    if (oldTag && oldTag.name !== name) {
      await prisma.$executeRaw`UPDATE "Review" SET "tags" = array_replace("tags", ${oldTag.name}, ${name})`;
    }
    
    res.status(200).json({ tag });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update tag" });
  }
};

export const deleteCommunityTag = async (req, res) => {
  try {
    const { id } = req.params;
    const oldTag = await prisma.communityTag.findUnique({ where: { id: parseInt(id) } });
    if (oldTag) {
      await prisma.$executeRaw`UPDATE "Review" SET "tags" = array_remove("tags", ${oldTag.name})`;
    }
    await prisma.communityTag.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ message: "Tag deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete tag" });
  }
};

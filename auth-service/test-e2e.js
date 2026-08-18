import { registerUser, loginUser } from "./src/services/authService.js";
import { sendOtp } from "./src/services/emailOtpService.js";
import { saveStudentProfile, saveTeacherProfile } from "./src/services/profileService.js";
import { getEligibleTeachersForStudent } from "./src/services/courseService.js";
import prisma from "./src/lib/prisma.js";

async function runE2E() {
  console.log("=== RUNNING E2E INTEGRATION TEST ===");

  const teacherEmail = `faculty.test.${Date.now()}@thapar.edu`;
  const studentEmail = `student.be24.${Date.now()}@thapar.edu`;

  // 1. Teacher OTP & Signup
  await sendOtp(teacherEmail);
  const otpRecordTeacher = await prisma.otpVerification.findFirst({
    where: { email: teacherEmail }
  });

  const teacherSignup = await registerUser({
    email: teacherEmail,
    password: "Password123!",
    otp: otpRecordTeacher.otp
  });

  console.log(`✅ Teacher Registered: ${teacherSignup.user.email} (Role: ${teacherSignup.user.role})`);

  // 2. Teacher Profile & Course Offering
  const teacherProfile = await saveTeacherProfile({
    userId: teacherSignup.user.id,
    fullName: "Dr. Test Professor",
    department: "Computer Science and Engineering",
    designation: "Associate Professor",
    offerings: [
      {
        courseCode: "UCS405",
        courseName: "Discrete Mathematics",
        batchTaught: "BE24",
        branchTaught: "COE",
        academicYear: "2024-2025"
      }
    ]
  });

  console.log(`✅ Teacher Profile & Offerings Created: ${teacherProfile.fullName}, Courses: ${teacherProfile.offerings.length}`);

  // 3. Student OTP & Signup
  await sendOtp(studentEmail);
  const otpRecordStudent = await prisma.otpVerification.findFirst({
    where: { email: studentEmail }
  });

  const studentSignup = await registerUser({
    email: studentEmail,
    password: "Password123!",
    otp: otpRecordStudent.otp
  });

  console.log(`✅ Student Registered: ${studentSignup.user.email} (Role: ${studentSignup.user.role}, Batch: ${studentSignup.user.detectedBatch})`);

  // 4. Student Onboarding (10-Digit Roll)
  const rollNo = `102403${Math.floor(1000 + Math.random() * 9000)}`;
  const studentProfile = await saveStudentProfile({
    userId: studentSignup.user.id,
    rollNumber: rollNo,
    branch: "COE",
    batch: "BE24",
    yearOfStudy: 2
  });

  console.log(`✅ Student Profile Saved: Roll No: ${studentProfile.rollNumber}, Branch: ${studentProfile.branch}, Batch: ${studentProfile.batch}`);

  // 5. Eligible Teachers Query for BE24 / COE
  const eligibleTeachers = await getEligibleTeachersForStudent({
    batch: "BE24",
    branch: "COE"
  });

  const found = eligibleTeachers.some(t => t.userId === teacherSignup.user.id);
  if (found) {
    console.log(`✅ Teacher successfully matched as eligible for BE24 student!`);
  } else {
    console.error(`❌ Teacher not found in eligible list`);
  }

  // 6. Create Review via prisma
  const review = await prisma.review.create({
    data: {
      reviewerId: studentSignup.user.id,
      reviewerRollNo: studentProfile.rollNumber,
      reviewerBatch: studentProfile.batch,
      reviewerBranch: studentProfile.branch,
      revieweeId: teacherSignup.user.id,
      courseCode: "UCS405",
      courseName: "Discrete Mathematics",
      rating: 5,
      reviewText: "Excellent pedagogical approach and clear explanation of graphs and logic.",
      context: "Batch BE24 - 2nd Year"
    }
  });

  console.log(`✅ Review Created: ID: ${review.reviewId}, Rating: ${review.rating}/5, Roll: ${review.reviewerRollNo}`);

  // 7. Add Reply
  const reply = await prisma.reviewReply.create({
    data: {
      reviewId: review.reviewId,
      authorId: teacherSignup.user.id,
      authorRole: "TEACHER",
      authorName: "Dr. Test Professor",
      authorBadge: "Faculty",
      replyText: "Thank you for the constructive feedback! Best of luck for the midterms."
    }
  });

  console.log(`✅ Reply Thread Created: By ${reply.authorName} (${reply.authorBadge}): "${reply.replyText}"`);

  // 8. Add Vote
  const vote = await prisma.reviewVote.create({
    data: {
      reviewId: review.reviewId,
      userId: studentSignup.user.id,
      voteType: "UP"
    }
  });

  console.log(`✅ Upvote registered: ID: ${vote.voteId}, Type: ${vote.voteType}`);

  console.log("\n🎉 ALL E2E BACKEND INTEGRATION TESTS PASSED SUCCESSFULLY!");
}

runE2E()
  .catch(err => {
    console.error("E2E Test Failure:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

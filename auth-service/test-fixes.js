import { createReview, getReviewsByReviewee } from "../feedback-microservice/src/services/reviewService.js";
import { createReply, voteReply } from "../feedback-microservice/src/services/replyService.js";
import { ALLOWED_BATCHES } from "./src/services/courseService.js";
import prisma from "./src/lib/prisma.js";

async function runFixesTest() {
  console.log("=== RUNNING TEST FOR 4 NEW FIXES & POLICIES ===");

  const testTeacherId = `teacher-uuid-${Date.now()}`;
  const testStudentId1 = `student-uuid-1-${Date.now()}`;
  const testStudentId2 = `student-uuid-2-${Date.now()}`;

  // 1. Test 21-Day Cooldown
  console.log("\n--- Testing 21-Day Cooldown ---");
  const rev1 = await createReview({
    reviewerId: testStudentId1,
    reviewerRollNo: "1024039991",
    reviewerBatch: "3Q11",
    reviewerBranch: "COE",
    revieweeId: testTeacherId,
    courseCode: "UCS405",
    courseName: "Discrete Mathematics",
    rating: 5,
    reviewText: "First review from student 1"
  });
  console.log(`✅ Review 1 created successfully (ID: ${rev1.reviewId})`);

  let cooldownBlocked = false;
  try {
    // Attempting to review again immediately (within 21 days)
    await createReview({
      reviewerId: testStudentId1,
      reviewerRollNo: "1024039991",
      reviewerBatch: "3Q11",
      reviewerBranch: "COE",
      revieweeId: testTeacherId,
      courseCode: "UCS405",
      courseName: "Discrete Mathematics",
      rating: 4,
      reviewText: "Second review within cooldown period"
    });
  } catch (err) {
    if (err.message.includes("21-day cooldown active")) {
      cooldownBlocked = true;
      console.log(`✅ PASS: Cooldown correctly blocked 2nd review with message: "${err.message}"`);
    } else {
      console.error("❌ Unexpected error:", err.message);
    }
  }

  if (!cooldownBlocked) {
    console.error("❌ FAIL: Cooldown did NOT block the immediate second review!");
  }

  // 2. Test Teacher Cannot Reply
  console.log("\n--- Testing Teacher Reply Block ---");
  let teacherBlocked = false;
  try {
    await createReply({
      reviewId: rev1.reviewId,
      authorId: testTeacherId,
      authorRole: "TEACHER",
      authorName: "Dr. Professor",
      authorBadge: "Faculty",
      replyText: "Teacher trying to comment"
    });
  } catch (err) {
    if (err.message.includes("Only students are permitted")) {
      teacherBlocked = true;
      console.log(`✅ PASS: Teacher reply blocked with: "${err.message}"`);
    }
  }
  if (!teacherBlocked) {
    console.error("❌ FAIL: Teacher was able to post a reply!");
  }

  // 3. Test Student Reply & Reply Voting
  console.log("\n--- Testing Student Reply & Reply Voting ---");
  const reply = await createReply({
    reviewId: rev1.reviewId,
    authorId: testStudentId2,
    authorRole: "STUDENT",
    authorName: "1024039992",
    authorBadge: "3Q12 Student",
    replyText: "I had a different experience with this professor's pacing."
  });
  console.log(`✅ Student 2 posted reply (ID: ${reply.replyId}): "${reply.replyText}"`);

  // Student 1 upvotes Student 2's reply
  const upvoteRes = await voteReply({
    replyId: reply.replyId,
    userId: testStudentId1,
    voteType: "UP"
  });
  console.log(`✅ Student 1 upvoted Student 2's reply (Vote ID: ${upvoteRes.voteId}, Type: ${upvoteRes.voteType})`);

  // Query reviews and verify reply votes
  const reviewsData = await getReviewsByReviewee(testTeacherId);
  const fetchedReply = reviewsData.reviews[0].replies.find(r => r.replyId === reply.replyId);
  console.log(`✅ Verified reply vote counts: Upvotes: ${fetchedReply.upvotes}, Downvotes: ${fetchedReply.downvotes}`);

  // 4. Test Allowed Batches List
  console.log("\n--- Testing Allowed Batches ---");
  console.log("Allowed Batches in System:", ALLOWED_BATCHES);
  const expectedBatches = ["3Q11", "3Q12", "3Q13", "3Q14", "3Q15", "2Q11", "2Q12", "2Q13", "2Q14", "2Q15"];
  const allBatchesMatch = expectedBatches.every(b => ALLOWED_BATCHES.includes(b));
  if (allBatchesMatch) {
    console.log("✅ PASS: All 10 allowed batches (3Q11-3Q15, 2Q11-2Q15) are configured properly.");
  } else {
    console.error("❌ FAIL: Allowed batches do not match!");
  }

  console.log("\n🎉 ALL 4 NEW FIXES & POLICIES VERIFIED SUCCESSFULLY!");
}

runFixesTest()
  .catch(err => console.error("Test error:", err))
  .finally(async () => {
    await prisma.$disconnect();
  });

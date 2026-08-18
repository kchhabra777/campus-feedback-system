import { determineRoleFromEmail } from "./src/utils/roleDetector.js";

console.log("=== RUNNING AUTOMATED UNIT TESTS ===");

// 1. Role Detector Tests
const testCases = [
  { email: "kchhabra_be24@thapar.edu", expectedRole: "STUDENT", expectedBatch: "BE24" },
  { email: "ayush_be23@thapar.edu", expectedRole: "STUDENT", expectedBatch: "BE23" },
  { email: "rahul.be25@thapar.edu", expectedRole: "STUDENT", expectedBatch: "BE25" },
  { email: "student_be30@thapar.edu", expectedRole: "STUDENT", expectedBatch: "BE30" },
  { email: "bv.raghav@thapar.edu", expectedRole: "TEACHER", expectedBatch: null },
  { email: "anurag.sharma@thapar.edu", expectedRole: "TEACHER", expectedBatch: null }
];

let passCount = 0;

for (const tc of testCases) {
  try {
    const res = determineRoleFromEmail(tc.email);
    if (res.role === tc.expectedRole && res.batch === tc.expectedBatch) {
      console.log(`✅ PASS: ${tc.email} -> Role: ${res.role}, Batch: ${res.batch}`);
      passCount++;
    } else {
      console.error(`❌ FAIL: ${tc.email} -> Expected: ${tc.expectedRole}/${tc.expectedBatch}, Got: ${res.role}/${res.batch}`);
    }
  } catch (err) {
    console.error(`❌ ERROR: ${tc.email} -> ${err.message}`);
  }
}

// Test rejection of non-thapar email
try {
  determineRoleFromEmail("user@gmail.com");
  console.error("❌ FAIL: user@gmail.com was not rejected");
} catch (err) {
  console.log(`✅ PASS: user@gmail.com correctly rejected with: "${err.message}"`);
  passCount++;
}

console.log(`\nResults: ${passCount} / ${testCases.length + 1} tests passed successfully!`);

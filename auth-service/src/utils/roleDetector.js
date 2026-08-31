/**
 * Strict role detection based on @thapar.edu email.
 * Students must have be23, be24, ..., be30 in their email prefix.
 * Faculty/Teachers have official @thapar.edu emails without the student batch tag.
 */
export function determineRoleFromEmail(email) {
  if (!email || typeof email !== "string") {
    throw new Error("Email is required");
  }

  const normalized = email.trim().toLowerCase();

  if (!normalized.endsWith("@thapar.edu")) {
    throw new Error("Registration is strictly restricted to @thapar.edu email addresses.");
  }

  const localPart = normalized.substring(0, normalized.indexOf("@"));

  // Check for admin emails (including + aliases for testing like kchhabra_be24+admin@thapar.edu)
  const adminEmails = ["doaa", "dosa", "admin"];
  const baseLocalPart = localPart.split("+")[0];
  const aliasPart = localPart.includes("+") ? localPart.split("+")[1] : "";
  
  if (adminEmails.includes(baseLocalPart) || adminEmails.includes(aliasPart)) {
    return {
      role: "ADMIN",
      batch: null,
      isStudent: false,
      email: normalized
    };
  }

  // Check for be23 through be30
  const beStudentRegex = /(?:^|_|\.)be(2[3-9]|30)(?:$|_|\.|\+)/i;
  const match = localPart.match(beStudentRegex);

  if (match) {
    const batchYear = match[1]; // e.g. "24"
    return {
      role: "STUDENT",
      batch: `BE${batchYear}`,
      isStudent: true,
      email: normalized
    };
  }

  // Any other @thapar.edu is treated as TEACHER
  return {
    role: "TEACHER",
    batch: null,
    isStudent: false,
    email: normalized
  };
}

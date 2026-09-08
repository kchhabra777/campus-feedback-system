import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import prisma from "../lib/prisma.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedTimetable() {
  console.log("🚀 Starting Thapar Timetable Database Seeding...");

  const dataPath = path.join(__dirname, "timetable_data.json");
  if (!fs.existsSync(dataPath)) {
    console.error("❌ timetable_data.json not found!");
    process.exit(1);
  }

  const raw = fs.readFileSync(dataPath, "utf-8");
  const data = JSON.parse(raw);

  const { teachers, offerings } = data;
  console.log(`📊 Found ${teachers.length} teachers and ${offerings.length} course offerings.`);

  // 1. Seed / Upsert Teachers
  const teacherProfileMap = new Map(); // teacherCode -> TeacherProfile.id

  console.log("👨‍🏫 Upserting Teacher Profiles...");
  for (const t of teachers) {
    try {
      let user = await prisma.user.findUnique({
        where: { email: t.email },
        include: { teacherProfile: true }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: t.email,
            passwordHash: "PENDING",
            role: "TEACHER",
            isEmailVerified: true,
            isProfileComplete: true,
            teacherProfile: {
              create: {
                fullName: t.fullName,
                department: t.department,
                designation: t.designation
              }
            }
          },
          include: { teacherProfile: true }
        });
      } else if (!user.teacherProfile) {
        const profile = await prisma.teacherProfile.create({
          data: {
            userId: user.id,
            fullName: t.fullName,
            department: t.department,
            designation: t.designation
          }
        });
        user.teacherProfile = profile;
      }

      teacherProfileMap.set(t.code, user.teacherProfile.id);
    } catch (err) {
      console.warn(`⚠️ Warning with teacher ${t.code} (${t.email}):`, err.message);
    }
  }

  console.log(`✅ Upserted ${teacherProfileMap.size} teacher profiles in database.`);

  // 2. Seed / Upsert Course Offerings
  console.log("📚 Upserting Course Offerings...");
  let insertedOfferings = 0;

  for (const off of offerings) {
    const teacherId = teacherProfileMap.get(off.teacherCode);
    if (!teacherId) {
      continue;
    }

    try {
      // Check if offering already exists for this teacher, courseCode, and ltp
      const existing = await prisma.courseOffering.findFirst({
        where: {
          teacherId,
          courseCode: off.courseCode,
          ltp: off.ltp
        }
      });

      if (existing) {
        // Merge batches
        const existingBatches = new Set(existing.batchTaught.split(",").map((b) => b.trim().toUpperCase()));
        off.batchTaught.split(",").forEach((b) => existingBatches.add(b.trim().toUpperCase()));
        const mergedBatchStr = Array.from(existingBatches).join(", ");

        await prisma.courseOffering.update({
          where: { id: existing.id },
          data: {
            batchTaught: mergedBatchStr,
            courseName: off.courseName,
            branchTaught: off.branchTaught
          }
        });
      } else {
        await prisma.courseOffering.create({
          data: {
            teacherId,
            courseCode: off.courseCode,
            courseName: off.courseName,
            batchTaught: off.batchTaught,
            branchTaught: off.branchTaught,
            academicYear: off.academicYear,
            ltp: off.ltp
          }
        });
      }
      insertedOfferings++;
    } catch (err) {
      console.warn(`⚠️ Warning with offering ${off.courseCode} for ${off.teacherCode}:`, err.message);
    }
  }

  console.log(`✅ Successfully processed ${insertedOfferings} course offerings!`);

  const totalTeachersInDB = await prisma.teacherProfile.count();
  const totalOfferingsInDB = await prisma.courseOffering.count();

  console.log("\n=======================================================");
  console.log(`🎉 DB Seeding Complete!`);
  console.log(`   Total Teachers in DB: ${totalTeachersInDB}`);
  console.log(`   Total Course Offerings in DB: ${totalOfferingsInDB}`);
  console.log("=======================================================\n");

  process.exit(0);
}

seedTimetable().catch((err) => {
  console.error("❌ Fatal Seeding Error:", err);
  process.exit(1);
});

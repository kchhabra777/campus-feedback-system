import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import prisma from "../lib/prisma.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedTimetable() {
  console.log("🚀 Starting Thapar Timetable Database Seeding (High Performance)...");

  const dataPath = path.join(__dirname, "timetable_data.json");
  if (!fs.existsSync(dataPath)) {
    console.error("❌ timetable_data.json not found!");
    process.exit(1);
  }

  const raw = fs.readFileSync(dataPath, "utf-8");
  const data = JSON.parse(raw);

  const { teachers, offerings } = data;
  console.log(`📊 Found ${teachers.length} teachers and ${offerings.length} course offerings in JSON.`);

  // 1. Fetch existing users and teacher profiles in a single query
  console.log("📥 Loading existing faculty from database...");
  const existingTeachers = await prisma.user.findMany({
    where: { role: "TEACHER" },
    include: { teacherProfile: true }
  });

  const userByEmail = new Map(existingTeachers.map((u) => [u.email, u]));
  const teacherProfileMap = new Map(); // teacherCode -> TeacherProfile.id

  // Map already existing profiles
  for (const t of teachers) {
    const existing = userByEmail.get(t.email);
    if (existing && existing.teacherProfile) {
      teacherProfileMap.set(t.code, existing.teacherProfile.id);
    }
  }

  const missingTeachers = teachers.filter((t) => !teacherProfileMap.has(t.code));
  console.log(`👨‍🏫 Found ${teacherProfileMap.size} existing teachers in DB, need to create ${missingTeachers.length} new teachers.`);

  // Create missing teachers in concurrent chunks of 20
  const CHUNK_SIZE = 20;
  for (let i = 0; i < missingTeachers.length; i += CHUNK_SIZE) {
    const chunk = missingTeachers.slice(i, i + CHUNK_SIZE);
    await Promise.all(
      chunk.map(async (t) => {
        try {
          let user = userByEmail.get(t.email);
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
            userByEmail.set(t.email, user);
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
          if (user.teacherProfile) {
            teacherProfileMap.set(t.code, user.teacherProfile.id);
          }
        } catch (err) {
          console.warn(`⚠️ Warning creating teacher ${t.code}:`, err.message);
        }
      })
    );
    if ((i + CHUNK_SIZE) % 100 === 0 || i + CHUNK_SIZE >= missingTeachers.length) {
      console.log(`   Upserted ${Math.min(i + CHUNK_SIZE, missingTeachers.length)} / ${missingTeachers.length} teachers...`);
    }
  }

  console.log(`✅ Ready with ${teacherProfileMap.size} total faculty members.`);

  // 2. Fetch all existing course offerings in 1 query
  console.log("📥 Loading existing course offerings from database...");
  const existingOfferings = await prisma.courseOffering.findMany();
  const offeringKeyMap = new Map(); // key: teacherId_courseCode_ltp -> existingOffering

  for (const off of existingOfferings) {
    const key = `${off.teacherId}_${off.courseCode}_${off.ltp || "L"}`;
    offeringKeyMap.set(key, off);
  }

  console.log(`📚 Found ${existingOfferings.length} existing offerings in DB. Processing incoming offerings...`);

  const offeringsToCreate = [];
  const offeringsToUpdate = [];
  const newOfferingsMap = new Map();

  for (const off of offerings) {
    const teacherId = teacherProfileMap.get(off.teacherCode);
    if (!teacherId) continue;

    const key = `${teacherId}_${off.courseCode}_${off.ltp || "L"}`;
    const existing = offeringKeyMap.get(key);

    if (existing) {
      const existingBatches = new Set((existing.batchTaught || "").split(",").map((b) => b.trim().toUpperCase()).filter(Boolean));
      const incomingBatches = (off.batchTaught || "").split(",").map((b) => b.trim().toUpperCase()).filter(Boolean);
      let hasNewBatch = false;
      for (const b of incomingBatches) {
        if (!existingBatches.has(b)) {
          existingBatches.add(b);
          hasNewBatch = true;
        }
      }
      if (hasNewBatch) {
        existing.batchTaught = Array.from(existingBatches).join(", ");
        offeringsToUpdate.push({
          id: existing.id,
          batchTaught: existing.batchTaught,
          courseName: off.courseName,
          branchTaught: off.branchTaught
        });
      }
    } else if (newOfferingsMap.has(key)) {
      const target = newOfferingsMap.get(key);
      const batchSet = new Set((target.batchTaught || "").split(",").map((b) => b.trim().toUpperCase()).filter(Boolean));
      (off.batchTaught || "").split(",").forEach((b) => {
        if (b.trim()) batchSet.add(b.trim().toUpperCase());
      });
      target.batchTaught = Array.from(batchSet).join(", ");
    } else {
      const newOff = {
        teacherId,
        courseCode: off.courseCode,
        courseName: off.courseName,
        batchTaught: off.batchTaught || "ALL",
        branchTaught: off.branchTaught || "ALL",
        academicYear: off.academicYear || "2026-2027 ODD",
        ltp: off.ltp || "L"
      };
      offeringsToCreate.push(newOff);
      newOfferingsMap.set(key, newOff);
    }
  }

  console.log(`📝 To Create: ${offeringsToCreate.length} new offerings | To Update: ${offeringsToUpdate.length} offerings.`);

  // Create in bulk chunks of 100 using createMany
  if (offeringsToCreate.length > 0) {
    console.log("⚡ Executing bulk inserts for new offerings...");
    const BULK_CHUNK = 100;
    for (let i = 0; i < offeringsToCreate.length; i += BULK_CHUNK) {
      const chunk = offeringsToCreate.slice(i, i + BULK_CHUNK);
      await prisma.courseOffering.createMany({
        data: chunk,
        skipDuplicates: true
      });
      if ((i + BULK_CHUNK) % 500 === 0 || i + BULK_CHUNK >= offeringsToCreate.length) {
        console.log(`   Inserted ${Math.min(i + BULK_CHUNK, offeringsToCreate.length)} / ${offeringsToCreate.length} offerings...`);
      }
    }
  }

  // Update in parallel chunks of 25
  if (offeringsToUpdate.length > 0) {
    console.log("⚡ Executing updates for existing offerings...");
    const UPDATE_CHUNK = 25;
    for (let i = 0; i < offeringsToUpdate.length; i += UPDATE_CHUNK) {
      const chunk = offeringsToUpdate.slice(i, i + UPDATE_CHUNK);
      await Promise.all(
        chunk.map((item) =>
          prisma.courseOffering.update({
            where: { id: item.id },
            data: {
              batchTaught: item.batchTaught,
              courseName: item.courseName,
              branchTaught: item.branchTaught
            }
          })
        )
      );
      if ((i + UPDATE_CHUNK) % 250 === 0 || i + UPDATE_CHUNK >= offeringsToUpdate.length) {
        console.log(`   Updated ${Math.min(i + UPDATE_CHUNK, offeringsToUpdate.length)} / ${offeringsToUpdate.length} offerings...`);
      }
    }
  }

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

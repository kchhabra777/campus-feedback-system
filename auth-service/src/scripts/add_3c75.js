import prisma from '../lib/prisma.js';

const offerings3C75 = [
  {
    rawName: "GURUGUBELLI V ESWARA RAO",
    searchEmail: "gveswara.rao@thapar.edu",
    searchName: "Eswara Rao",
    fallbackName: "Dr. G.V. Eswara Rao",
    fallbackEmail: "gveswara.rao@thapar.edu",
    courseCode: "UCS510",
    courseName: "COMPUTER ARCHITECTURE AND ORGANIZATION",
    ltp: "L"
  },
  {
    rawName: "NIKHIL SHARMA",
    searchEmail: "nikhil.sharma@thapar.edu",
    searchName: "Nikhil Sharma",
    fallbackName: "NIKHIL SHARMA",
    fallbackEmail: "nikhil.sharma@thapar.edu",
    courseCode: "UCS553",
    courseName: "ENTERPRISE WEB APPLICATION",
    ltp: "P"
  },
  {
    rawName: "VIKRAMJIT SINGH BHATHAL",
    searchEmail: "vikramjit.bhathal@thapar.edu",
    searchName: "Vikramjit Singh",
    fallbackName: "Dr. Vikramjit Singh",
    fallbackEmail: "vikramjit.bhathal@thapar.edu",
    courseCode: "UCS553",
    courseName: "ENTERPRISE WEB APPLICATION",
    ltp: "L"
  },
  {
    rawName: "DEBASISH MANDAL DR.",
    searchEmail: "debasish.mandal@thapar.edu",
    searchName: "Debasish Mandal",
    fallbackName: "Dr. Debasish Mandal",
    fallbackEmail: "debasish.mandal@thapar.edu",
    courseCode: "UCS421",
    courseName: "ETHICS AND RISK MITIGATION IN AI",
    ltp: "L"
  },
  {
    rawName: "KAPIL RANA",
    searchEmail: "kapil.rana@thapar.edu",
    searchName: "Kapil Rana",
    fallbackName: "Dr. Kapil Rana",
    fallbackEmail: "kapil.rana@thapar.edu",
    courseCode: "UCS615",
    courseName: "IMAGE PROCESSING",
    ltp: "L"
  },
  {
    rawName: "ALKA KUMARI",
    searchEmail: "alka.kumari@thapar.edu",
    searchName: "Alka Kumari",
    fallbackName: "ALKA KUMARI",
    fallbackEmail: "alka.kumari@thapar.edu",
    courseCode: "UCS615",
    courseName: "IMAGE PROCESSING",
    ltp: "P"
  },
  {
    rawName: "HARJOT SINGH",
    searchEmail: "harjot.singh@thapar.edu",
    searchName: "Harjot Singh",
    fallbackName: "HARJOT SINGH",
    fallbackEmail: "harjot.singh@thapar.edu",
    courseCode: "UML501",
    courseName: "MACHINE LEARNING",
    ltp: "P"
  },
  {
    rawName: "MAHAK GAMBHIR",
    searchEmail: "mahak.gambhir@thapar.edu",
    searchName: "Mahak Gambhir",
    fallbackName: "Dr. Mahak Gambhir",
    fallbackEmail: "mahak.gambhir@thapar.edu",
    courseCode: "UML501",
    courseName: "MACHINE LEARNING",
    ltp: "L"
  },
  {
    rawName: "NISHA THAKUR",
    searchEmail: "nisha.thakur@thapar.edu",
    searchName: "Nisha Thakur",
    fallbackName: "NISHA THAKUR",
    fallbackEmail: "nisha.thakur@thapar.edu",
    courseCode: "UCS503",
    courseName: "SOFTWARE ENGINEERING",
    ltp: "P"
  },
  {
    rawName: "SOURAV ROY",
    searchEmail: "sourav.roy@thapar.edu",
    searchName: "Sourav Roy",
    fallbackName: "Dr. Sourav Roy",
    fallbackEmail: "sourav.roy@thapar.edu",
    courseCode: "UCS503",
    courseName: "SOFTWARE ENGINEERING",
    ltp: "L"
  }
];

async function main() {
  try {
    console.log("Adding teachers and course offerings for batch 3C75...\n");

    for (const off of offerings3C75) {
      // 1. Find teacher by email or fuzzy name
      let teacherProfile = await prisma.teacherProfile.findFirst({
        where: {
          OR: [
            {
              user: {
                email: {
                  equals: off.searchEmail,
                  mode: 'insensitive'
                }
              }
            },
            {
              fullName: {
                contains: off.searchName,
                mode: 'insensitive'
              }
            }
          ]
        },
        include: { user: true }
      });

      // 2. If not existing, create User and TeacherProfile
      if (!teacherProfile) {
        console.log(`Teacher not found for [${off.rawName}]. Creating new account with email ${off.fallbackEmail}...`);
        const user = await prisma.user.create({
          data: {
            email: off.fallbackEmail,
            passwordHash: "PENDING",
            role: "TEACHER",
            isEmailVerified: true,
            isProfileComplete: true,
            teacherProfile: {
              create: {
                fullName: off.fallbackName,
                department: "Computer Science & Engineering",
                designation: "Faculty"
              }
            }
          },
          include: { teacherProfile: true }
        });
        teacherProfile = user.teacherProfile;
        console.log(`✓ Created TeacherProfile ID: ${teacherProfile.id} for "${off.fallbackName}"`);
      } else {
        console.log(`✓ Found existing TeacherProfile ID: ${teacherProfile.id} ("${teacherProfile.fullName}") for [${off.rawName}]`);
      }

      // 3. Check if CourseOffering already exists for batch 3C75
      const existingOffering = await prisma.courseOffering.findFirst({
        where: {
          teacherId: teacherProfile.id,
          courseCode: off.courseCode,
          batchTaught: "3C75",
          ltp: off.ltp
        }
      });

      if (!existingOffering) {
        const created = await prisma.courseOffering.create({
          data: {
            teacherId: teacherProfile.id,
            courseCode: off.courseCode,
            courseName: off.courseName,
            batchTaught: "3C75",
            branchTaught: "COE",
            academicYear: "2026-27-ODD",
            ltp: off.ltp
          }
        });
        console.log(`  -> Created CourseOffering ID: ${created.id} | ${off.courseCode} (${off.ltp}) - ${off.courseName} assigned to ${teacherProfile.fullName}`);
      } else {
        console.log(`  -> CourseOffering already exists for ${off.courseCode} (${off.ltp}) assigned to ${teacherProfile.fullName}`);
      }
    }

    console.log("\nFinished processing batch 3C75 successfully.");
  } catch (error) {
    console.error("Error running add_3c75 script:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

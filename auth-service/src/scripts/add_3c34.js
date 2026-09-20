import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../lib/prisma.js';

const newOfferings = [
  { name: "SHIVANI SHARMA", courseCode: "UCS510", courseName: "COMPUTER ARCHITECTURE AND ORGANIZATION", ltp: "L" },
  { name: "KANUPRIYA", courseCode: "UCS553", courseName: "ENTERPRISE WEB APPLICATION", ltp: "P" },
  { name: "JAYENDRA BARUA", courseCode: "UCS553", courseName: "ENTERPRISE WEB APPLICATION", ltp: "L" },
  { name: "ASHUTOSH KUMAR", courseCode: "UCS421", courseName: "ETHICS AND RISK MITIGATION IN AI", ltp: "L" },
  { name: "NITIGYA SAMBYAL", courseCode: "UCS615", courseName: "IMAGE PROCESSING", ltp: "L" },
  { name: "NITIGYA SAMBYAL", courseCode: "UCS615", courseName: "IMAGE PROCESSING", ltp: "P" },
  { name: "SWATI SHARMA", courseCode: "UML501", courseName: "MACHINE LEARNING", ltp: "L" },
  { name: "SHIWAM KUMAR", courseCode: "UML501", courseName: "MACHINE LEARNING", ltp: "P" },
  { name: "NISHA THAKUR", courseCode: "UCS503", courseName: "SOFTWARE ENGINEERING", ltp: "P" },
  { name: "TANYA GARG", courseCode: "UCS503", courseName: "SOFTWARE ENGINEERING", ltp: "L" },
];

async function main() {
  try {
    for (const off of newOfferings) {
      // Find teacher by fuzzy name match
      let teacherProfile = await prisma.teacherProfile.findFirst({
        where: {
          fullName: {
            contains: off.name,
            mode: 'insensitive'
          }
        }
      });

      if (!teacherProfile) {
        console.log("Teacher not found, creating: " + off.name);
        const email = off.name.toLowerCase().replace(/\s+/g, '.') + "@thapar.edu";
        
        const user = await prisma.user.create({
          data: {
            email: email,
            passwordHash: "PENDING",
            role: "TEACHER",
            isEmailVerified: true,
            isProfileComplete: true,
            teacherProfile: {
              create: {
                fullName: off.name,
                department: "Computer Science & Engineering",
                designation: "Faculty"
              }
            }
          },
          include: { teacherProfile: true }
        });
        teacherProfile = user.teacherProfile;
      } else {
        console.log("Found teacher: " + teacherProfile.fullName);
      }

      // Add course offering
      // Check if offering already exists
      const existingOffering = await prisma.courseOffering.findFirst({
        where: {
          teacherId: teacherProfile.id,
          courseCode: off.courseCode,
          batchTaught: "3C34",
          ltp: off.ltp
        }
      });

      if (!existingOffering) {
        await prisma.courseOffering.create({
          data: {
            teacherId: teacherProfile.id,
            courseCode: off.courseCode,
            courseName: off.courseName,
            batchTaught: "3C34",
            branchTaught: "COE",
            academicYear: "2026-27-ODD",
            ltp: off.ltp
          }
        });
        console.log("Created offering: " + off.courseCode + " " + off.ltp + " for " + off.name);
      } else {
        console.log("Offering already exists: " + off.courseCode + " " + off.ltp + " for " + off.name);
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();

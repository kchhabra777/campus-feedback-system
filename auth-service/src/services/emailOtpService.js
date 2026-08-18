import nodemailer from "nodemailer";
import prisma from "../lib/prisma.js";

let transporter = null;

const initTransporter = () => {
  if (!transporter && process.env.SMTP_HOST && process.env.SMTP_USER) {
    try {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_PORT === "465",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } catch (err) {
      console.warn("SMTP setup warning:", err.message);
    }
  }
  return transporter;
};

export const sendOtp = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Delete prior OTPs for this email to prevent collisions
  await prisma.otpVerification.deleteMany({
    where: { email: normalizedEmail }
  });

  // Store new OTP
  await prisma.otpVerification.create({
    data: {
      email: normalizedEmail,
      otp,
      expiresAt
    }
  });

  console.log(`\n========================================`);
  console.log(`✉️  [CAMPUS FEEDBACK OTP]`);
  console.log(`To: ${normalizedEmail}`);
  console.log(`Code: ${otp}`);
  console.log(`Valid until: ${expiresAt.toISOString()}`);
  console.log(`========================================\n`);

  const mailClient = initTransporter();
  if (mailClient) {
    try {
      await mailClient.sendMail({
        from: process.env.SMTP_FROM || "Thapar Feedback System <noreply@thapar.edu>",
        to: normalizedEmail,
        subject: "Your Campus Feedback Verification Code",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #1a1a1a;">
            <h2 style="color: #c93b2b;">Thapar Campus Feedback System</h2>
            <p>Hello,</p>
            <p>Your 6-digit verification code to complete your registration is:</p>
            <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #111; padding: 12px 0;">
              ${otp}
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p style="color: #666; font-size: 12px;">If you did not request this code, please ignore this email.</p>
          </div>
        `
      });
    } catch (err) {
      console.error("Failed to deliver SMTP email:", err.message);
    }
  }

  return { success: true, message: "OTP sent successfully" };
};

export const verifyOtp = async (email, otp) => {
  const normalizedEmail = email.trim().toLowerCase();

  const record = await prisma.otpVerification.findFirst({
    where: {
      email: normalizedEmail,
      otp: otp.trim(),
      expiresAt: {
        gt: new Date()
      }
    }
  });

  if (!record) {
    return false;
  }

  // Delete used OTP
  await prisma.otpVerification.delete({
    where: { id: record.id }
  });

  return true;
};

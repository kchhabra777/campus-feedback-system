import {
  checkEmailRole,
  registerUser,
  loginUser,
  getUserById
} from "../services/authService.js";
import { sendOtp as sendOtpService } from "../services/emailOtpService.js";
import { determineRoleFromEmail } from "../utils/roleDetector.js";
import prisma from "../lib/prisma.js";
import { generateToken } from "../utils/jwt.js";

export const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const result = await checkEmailRole(email);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const requestOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const roleInfo = determineRoleFromEmail(email);
    const result = await sendOtpService(roleInfo.email);

    return res.status(200).json({
      success: true,
      message: `Verification code sent to ${roleInfo.email}`,
      role: roleInfo.role,
      detectedBatch: roleInfo.batch
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const signup = async (req, res) => {
  try {
    const { email, password, otp } = req.body;

    if (!email || !password || !otp) {
      return res.status(400).json({ error: "Email, password, and 6-digit OTP code are required." });
    }

    const result = await registerUser({ email, password, otp });
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const result = await loginUser({ email, password });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch user details" });
  }
};

export const syncClerkUser = async (req, res) => {
  try {
    const { email, fullName, clerkId } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const roleInfo = determineRoleFromEmail(email);

    let user = await prisma.user.findUnique({
      where: { email: roleInfo.email },
      include: { studentProfile: true, teacherProfile: true }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: roleInfo.email,
          passwordHash: `CLERK_${clerkId || 'MANAGED'}`,
          role: roleInfo.role,
          detectedBatch: roleInfo.batch,
          isEmailVerified: true,
          isProfileComplete: false
        },
        include: { studentProfile: true, teacherProfile: true }
      });
    }

    const token = generateToken(user);
    return res.status(200).json({ user, token });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

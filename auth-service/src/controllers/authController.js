import {
  checkEmailRole,
  registerUser,
  loginUser,
  getUserById
} from "../services/authService.js";
import { sendOtp as sendOtpService } from "../services/emailOtpService.js";
import { determineRoleFromEmail } from "../utils/roleDetector.js";

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

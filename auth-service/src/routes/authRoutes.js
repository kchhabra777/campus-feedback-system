import express from "express";
import {
  checkEmail,
  requestOtp,
  signup,
  login,
  getMe,
  syncClerkUser
} from "../controllers/authController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/check-email", checkEmail);
router.post("/send-otp", requestOtp);
router.post("/signup", signup);
router.post("/login", login);
router.post("/clerk-sync", syncClerkUser);
router.get("/me", requireAuth, getMe);

export default router;

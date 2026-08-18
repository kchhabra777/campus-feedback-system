import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "thapar_campus_feedback_jwt_secret_key_2026";

export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

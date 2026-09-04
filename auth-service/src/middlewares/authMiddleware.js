import jwt from "jsonwebtoken";
import { verifyToken } from "../utils/jwt.js";
import prisma from "../lib/prisma.js";
import { determineRoleFromEmail } from "../utils/roleDetector.js";

export const requireAuth = async (req, res, next) => {
  try {
    // 1. Check if Gateway injected verified Clerk User headers
    const injectedUserId = req.headers["x-user-id"];
    const injectedEmail = req.headers["x-user-email"];

    if (injectedEmail || injectedUserId) {
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            ...(injectedEmail ? [{ email: injectedEmail.toLowerCase().trim() }] : []),
            ...(injectedUserId ? [{ passwordHash: `CLERK_${injectedUserId}` }] : []),
            ...(injectedUserId ? [{ id: injectedUserId }] : [])
          ]
        },
        include: {
          studentProfile: true,
          teacherProfile: true
        }
      });

      // If user authenticated via Clerk but record doesn't exist in DB yet, initialize on the fly
      if (!user && injectedEmail) {
        try {
          const roleInfo = determineRoleFromEmail(injectedEmail);
          user = await prisma.user.create({
            data: {
              email: roleInfo.email,
              passwordHash: `CLERK_${injectedUserId || 'MANAGED'}`,
              role: roleInfo.role,
              detectedBatch: roleInfo.batch,
              isEmailVerified: true,
              isProfileComplete: false
            },
            include: {
              studentProfile: true,
              teacherProfile: true
            }
          });
        } catch (initErr) {
          console.warn("On-the-fly user creation note:", initErr.message);
        }
      }

      if (user) {
        req.user = user;
        return next();
      }
    }

    // 2. Fallback to Local JWT or Clerk JWT Bearer Token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access denied. Authentication token is missing." });
    }

    const token = authHeader.split(" ")[1];

    // Attempt internal backend JWT verification
    try {
      const decoded = verifyToken(token);
      if (decoded && decoded.userId) {
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          include: {
            studentProfile: true,
            teacherProfile: true
          }
        });

        if (user) {
          req.user = user;
          return next();
        }
      }
    } catch (jwtErr) {
      // Local JWT signature verify failed; attempt fallback to Clerk JWT
    }

    // Attempt Clerk JWT payload decoding
    try {
      const rawDecoded = jwt.decode(token);
      if (rawDecoded && (rawDecoded.sub || rawDecoded.email)) {
        const clerkSub = rawDecoded.sub;
        const clerkEmail = rawDecoded.email;

        let user = await prisma.user.findFirst({
          where: {
            OR: [
              ...(clerkEmail ? [{ email: clerkEmail.toLowerCase().trim() }] : []),
              ...(clerkSub ? [{ passwordHash: `CLERK_${clerkSub}` }] : []),
              ...(clerkSub ? [{ id: clerkSub }] : [])
            ]
          },
          include: {
            studentProfile: true,
            teacherProfile: true
          }
        });

        if (user) {
          req.user = user;
          return next();
        }
      }
    } catch (clerkDecodeErr) {
      // Ignore decode error
    }

    return res.status(401).json({ error: "Invalid or expired session token." });
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired session token." });
  }
};

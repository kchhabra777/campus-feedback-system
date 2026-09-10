import { createClerkClient, verifyToken } from "@clerk/backend";

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY
});

// Cache user email addresses to minimize Clerk API calls
const userCache = new Map();

export const clerkAuthMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log(`[GW-AUTH] ${req.method} ${req.originalUrl} – No Bearer token`);
    return next();
  }

  const token = authHeader.split(" ")[1];
  try {
    const verified = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
      publishableKey: process.env.CLERK_PUBLISHABLE_KEY
    });

    if (verified && verified.sub) {
      req.headers["x-user-id"] = verified.sub;

      let email = verified.email;
      if (!email && userCache.has(verified.sub)) {
        email = userCache.get(verified.sub);
      }
      if (!email) {
        try {
          const userObj = await clerk.users.getUser(verified.sub);
          email = userObj.primaryEmailAddress?.emailAddress || userObj.emailAddresses?.[0]?.emailAddress;
          if (email) {
            userCache.set(verified.sub, email);
          }
        } catch (e) {
          // Ignore lookup error
        }
      }

      if (email) {
        req.headers["x-user-email"] = email;
      }
      console.log(`[GW-AUTH] ${req.method} ${req.originalUrl} – Clerk verified: sub=${verified.sub}, email=${email || '(none)'}`);
    }
  } catch (err) {
    // If not a Clerk token, decode local JWT payload
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        if (payload.userId || payload.sub) req.headers["x-user-id"] = payload.userId || payload.sub;
        if (payload.email) req.headers["x-user-email"] = payload.email;
        if (payload.role) req.headers["x-user-role"] = payload.role;
        console.log(`[GW-AUTH] ${req.method} ${req.originalUrl} – Local JWT decoded: sub=${payload.userId || payload.sub}, email=${payload.email}, role=${payload.role}`);
      }
    } catch (localErr) {
      console.log(`[GW-AUTH] ${req.method} ${req.originalUrl} – Failed to parse local JWT (${localErr.message})`);
    }
  }
  next();
};

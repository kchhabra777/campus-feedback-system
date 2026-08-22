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
    }
  } catch (err) {
    // If not a Clerk token, pass through for local JWT fallback
  }
  next();
};

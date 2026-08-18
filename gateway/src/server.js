import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 8000;

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:5001";
const FEEDBACK_SERVICE_URL = process.env.FEEDBACK_SERVICE_URL || "http://localhost:5000";

app.use(cors());

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "Campus Feedback API Gateway",
    services: {
      authService: AUTH_SERVICE_URL,
      feedbackService: FEEDBACK_SERVICE_URL
    }
  });
});

// Proxy /api/auth -> auth-service /auth
app.use(
  "/api/auth",
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      "^/api/auth": "/auth"
    }
  })
);

// Proxy /api/profiles -> auth-service /profiles
app.use(
  "/api/profiles",
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      "^/api/profiles": "/profiles"
    }
  })
);

// Proxy /api/courses -> auth-service /courses
app.use(
  "/api/courses",
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      "^/api/courses": "/courses"
    }
  })
);

// Proxy /api/reviews -> feedback-microservice /reviews
app.use(
  "/api/reviews",
  createProxyMiddleware({
    target: FEEDBACK_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      "^/api/reviews": "/reviews"
    }
  })
);

// Proxy /api/ratings -> feedback-microservice /ratings
app.use(
  "/api/ratings",
  createProxyMiddleware({
    target: FEEDBACK_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      "^/api/ratings": "/ratings"
    }
  })
);

app.listen(PORT, () => {
  console.log(`🌐 API Gateway listening on port ${PORT}`);
  console.log(`   Auth routes -> ${AUTH_SERVICE_URL}`);
  console.log(`   Feedback routes -> ${FEEDBACK_SERVICE_URL}`);
});

import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 8000;

const AUTH_SERVICE_URL = (process.env.AUTH_SERVICE_URL || "http://localhost:5001").replace(/\/$/, "");
const FEEDBACK_SERVICE_URL = (process.env.FEEDBACK_SERVICE_URL || "http://localhost:5000").replace(/\/$/, "");

app.use(cors());

// Root and Health Check
app.get(["/", "/health"], (req, res) => {
  res.json({
    status: "OK",
    service: "Campus Feedback API Gateway",
    services: {
      authService: AUTH_SERVICE_URL,
      feedbackService: FEEDBACK_SERVICE_URL
    }
  });
});

// Proxy /api/auth/* and /auth/* -> AUTH_SERVICE_URL/auth/*
app.use(
  ["/api/auth", "/auth"],
  createProxyMiddleware({
    target: `${AUTH_SERVICE_URL}/auth`,
    changeOrigin: true
  })
);

// Proxy /api/profiles/* and /profiles/* -> AUTH_SERVICE_URL/profiles/*
app.use(
  ["/api/profiles", "/profiles"],
  createProxyMiddleware({
    target: `${AUTH_SERVICE_URL}/profiles`,
    changeOrigin: true
  })
);

// Proxy /api/courses/* and /courses/* -> AUTH_SERVICE_URL/courses/*
app.use(
  ["/api/courses", "/courses"],
  createProxyMiddleware({
    target: `${AUTH_SERVICE_URL}/courses`,
    changeOrigin: true
  })
);

// Proxy /api/reviews/* and /reviews/* -> FEEDBACK_SERVICE_URL/reviews/*
app.use(
  ["/api/reviews", "/reviews"],
  createProxyMiddleware({
    target: `${FEEDBACK_SERVICE_URL}/reviews`,
    changeOrigin: true
  })
);

// Proxy /api/ratings/* and /ratings/* -> FEEDBACK_SERVICE_URL/ratings/*
app.use(
  ["/api/ratings", "/ratings"],
  createProxyMiddleware({
    target: `${FEEDBACK_SERVICE_URL}/ratings`,
    changeOrigin: true
  })
);

app.listen(PORT, () => {
  console.log(`🌐 API Gateway listening on port ${PORT}`);
  console.log(`   Auth routes     -> ${AUTH_SERVICE_URL}/auth`);
  console.log(`   Profiles routes -> ${AUTH_SERVICE_URL}/profiles`);
  console.log(`   Courses routes  -> ${AUTH_SERVICE_URL}/courses`);
  console.log(`   Reviews routes  -> ${FEEDBACK_SERVICE_URL}/reviews`);
  console.log(`   Ratings routes  -> ${FEEDBACK_SERVICE_URL}/ratings`);
});

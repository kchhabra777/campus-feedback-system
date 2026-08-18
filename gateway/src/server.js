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

// Proxy /api/auth/* -> http://localhost:5001/auth/*
app.use(
  "/api/auth",
  createProxyMiddleware({
    target: `${AUTH_SERVICE_URL}/auth`,
    changeOrigin: true
  })
);

// Proxy /api/profiles/* -> http://localhost:5001/profiles/*
app.use(
  "/api/profiles",
  createProxyMiddleware({
    target: `${AUTH_SERVICE_URL}/profiles`,
    changeOrigin: true
  })
);

// Proxy /api/courses/* -> http://localhost:5001/courses/*
app.use(
  "/api/courses",
  createProxyMiddleware({
    target: `${AUTH_SERVICE_URL}/courses`,
    changeOrigin: true
  })
);

// Proxy /api/reviews/* -> http://localhost:5000/reviews/*
app.use(
  "/api/reviews",
  createProxyMiddleware({
    target: `${FEEDBACK_SERVICE_URL}/reviews`,
    changeOrigin: true
  })
);

// Proxy /api/ratings/* -> http://localhost:5000/ratings/*
app.use(
  "/api/ratings",
  createProxyMiddleware({
    target: `${FEEDBACK_SERVICE_URL}/ratings`,
    changeOrigin: true
  })
);

app.listen(PORT, () => {
  console.log(`🌐 API Gateway listening on port ${PORT}`);
  console.log(`   Auth routes -> ${AUTH_SERVICE_URL}/auth`);
  console.log(`   Profiles routes -> ${AUTH_SERVICE_URL}/profiles`);
  console.log(`   Courses routes -> ${AUTH_SERVICE_URL}/courses`);
  console.log(`   Reviews routes -> ${FEEDBACK_SERVICE_URL}/reviews`);
  console.log(`   Ratings routes -> ${FEEDBACK_SERVICE_URL}/ratings`);
});

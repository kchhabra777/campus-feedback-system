import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[AUTH-SERVICE INCOMING] ${req.method} ${req.url}`);
  next();
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "Authentication & Profile Microservice",
    port: process.env.PORT || 5001
  });
});

app.use("/auth", authRoutes);
app.use("/profiles", profileRoutes);
app.use("/courses", courseRoutes);
app.use("/admin", adminRoutes);

// Catch JSON syntax errors or any unhandled body parsing errors so requests never hang
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    console.error(`[AUTH-SERVICE] Malformed JSON payload:`, err.message);
    return res.status(400).json({ error: "Invalid JSON format in request body" });
  }
  console.error(`[AUTH-SERVICE ERROR]:`, err.message);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

export default app;

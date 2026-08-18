import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

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

export default app;

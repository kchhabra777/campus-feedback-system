import express from "express";
import cors from "cors";

import reviewRoutes from "./routes/reviewRoutes.js";
import voteRoutes from "./routes/voteRoutes.js";
import flagRoutes from "./routes/flagRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        service: "Feedback Management Microservice"
    });
});

app.use("/reviews", reviewRoutes);

app.use("/reviews", voteRoutes);

app.use("/reviews", flagRoutes);

app.use("/ratings", ratingRoutes);

export default app;
import {
  createFlag as createFlagService,
  getAllFlags as getAllFlagsService
} from "../services/flagService.js";

export const flagReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { user, reason } = req.body;

    const reporterId = user?.userId || req.headers["x-user-id"];
    if (!reporterId) {
      return res.status(400).json({ error: "Reporter user ID is required" });
    }

    const flag = await createFlagService({
      reviewId: Number(id),
      reporterId,
      reason: reason || "Inappropriate content"
    });

    return res.status(201).json({
      success: true,
      message: "Review reported successfully.",
      flag
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to report review" });
  }
};

export const listFlags = async (req, res) => {
  try {
    const flags = await getAllFlagsService();
    return res.status(200).json({ flags });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch review flags" });
  }
};

export const resolveFlag = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body;
        const { resolveFlag: resolveFlagService } = await import("../services/flagService.js");
        const result = await resolveFlagService(id, action);
        return res.status(200).json({ success: true, flag: result });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to resolve flag" });
    }
};
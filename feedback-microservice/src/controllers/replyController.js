import {
    createReply as createReplyService,
    getRepliesByReview as getRepliesService
} from "../services/replyService.js";

export const createReply = async (req, res) => {
    try {
        const { id } = req.params; // reviewId
        const {
            authorId,
            authorRole,
            authorName,
            authorBadge,
            replyText
        } = req.body;

        if (!authorId) {
            return res.status(400).json({ error: "Author ID is required" });
        }

        if (!authorRole || !["STUDENT", "TEACHER"].includes(authorRole)) {
            return res.status(400).json({ error: "Valid author role (STUDENT or TEACHER) is required" });
        }

        if (!replyText || replyText.trim() === "") {
            return res.status(400).json({ error: "Reply text is required" });
        }

        const reply = await createReplyService({
            reviewId: Number(id),
            authorId,
            authorRole,
            authorName: authorName || (authorRole === "STUDENT" ? "Student" : "Faculty"),
            authorBadge: authorBadge || (authorRole === "STUDENT" ? "Verified Student" : "Faculty"),
            replyText: replyText.trim()
        });

        return res.status(201).json({ reply });
    } catch (error) {
        console.error("Failed to create reply:", error);
        return res.status(500).json({ error: "Failed to create reply" });
    }
};

export const getReplies = async (req, res) => {
    try {
        const { id } = req.params; // reviewId
        const replies = await getRepliesService(Number(id));
        return res.status(200).json({ replies });
    } catch (error) {
        console.error("Failed to fetch replies:", error);
        return res.status(500).json({ error: "Failed to fetch replies" });
    }
};

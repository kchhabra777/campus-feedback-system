import prisma from "../lib/prisma.js";

export const createFlag = async ({
    reviewId,
    reporterId,
    reason
}) => {
    const numReviewId = Number(reviewId);

    const flag = await prisma.reviewFlag.create({
        data: {
            reviewId: numReviewId,
            reporterId,
            reason: reason || "Inappropriate / abusive content"
        }
    });

    // Mark isFlagged on the review
    try {
        await prisma.review.update({
            where: { reviewId: numReviewId },
            data: { isFlagged: true }
        });
    } catch (e) {}

    return flag;
};

export const getAllFlags = async () => {
    const flags = await prisma.reviewFlag.findMany({
        include: {
            review: true
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    for (let flag of flags) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: flag.reporterId },
                include: { studentProfile: true, teacherProfile: true }
            });
            if (user) {
                flag.reporterDetails = {
                    email: user.email,
                    name: user.studentProfile?.fullName || user.teacherProfile?.fullName || "Admin",
                    rollNo: user.studentProfile?.rollNumber || null
                };
            }
        } catch (e) {}
    }

    return flags;
};

export const resolveFlag = async (flagId, action) => {
    const newStatus = action === 'delete_review' ? 'REMOVED' : 'DISMISSED';
    const flag = await prisma.reviewFlag.update({
        where: { flagId: Number(flagId) },
        data: { status: newStatus }
    });

    if (action === 'delete_review') {
        try {
            await prisma.review.delete({ where: { reviewId: flag.reviewId } });
        } catch(e) {}
    } else {
        try {
            await prisma.review.update({
                where: { reviewId: flag.reviewId },
                data: { isFlagged: false }
            });
        } catch(e) {}
    }
    return flag;
};
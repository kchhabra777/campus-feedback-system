import prisma from "../lib/prisma.js";


export const createFlag = async ({
    reviewId,
    reporterId,
    reason
}) => {

    return await prisma.reviewFlag.create({
        data: {
            reviewId,
            reporterId,
            reason
        }
    });

};
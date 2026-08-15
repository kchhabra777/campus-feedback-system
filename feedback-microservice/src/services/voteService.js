import prisma from "../lib/prisma.js";


export const voteReview = async ({
    reviewId,
    userId,
    voteType
}) => {


    const existingVote = await prisma.reviewVote.findUnique({
        where: {
            reviewId_userId: {
                reviewId,
                userId
            }
        }
    });


    // If user already voted → update vote
    if (existingVote) {

        return await prisma.reviewVote.update({
            where: {
                voteId: existingVote.voteId
            },
            data: {
                voteType
            }
        });

    }


    // If first time voting → create vote
    return await prisma.reviewVote.create({
        data: {
            reviewId,
            userId,
            voteType
        }
    });

};
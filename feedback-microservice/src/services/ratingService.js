import prisma from "../lib/prisma.js";


export const calculateRating = async (userId) => {

    const reviews = await prisma.review.findMany({
        where: {
            revieweeId: userId,
            isFlagged: false
        },
        orderBy: {
            createdAt: "desc"
        }
    });


    if (reviews.length === 0) {

        return {
            userId,
            overallRating: 0,
            recentRating: 0,
            totalReviews: 0
        };
    }


    const currentTime = new Date();

    let overallWeightedSum = 0;
    let overallWeightSum = 0;

    let recentWeightedSum = 0;
    let recentWeightSum = 0;


    for (const review of reviews) {

        const ageInMilliseconds =
            currentTime - new Date(review.createdAt);

        const ageInDays =
            ageInMilliseconds / (1000 * 60 * 60 * 24);


        // Older reviews get less importance
        const timeWeight =
            1 / (1 + ageInDays / 30);


        // Overall rating
        overallWeightedSum +=
            review.rating * timeWeight;

        overallWeightSum += timeWeight;


        // Recent rating: only reviews from last 6 months
        if (ageInDays <= 180) {

            recentWeightedSum +=
                review.rating * timeWeight;

            recentWeightSum += timeWeight;
        }
    }


    const overallRating =
        overallWeightedSum / overallWeightSum;


    let recentRating = 0;

    if (recentWeightSum > 0) {

        recentRating =
            recentWeightedSum / recentWeightSum;
    }


   const finalOverallRating =
    Number(overallRating.toFixed(2));

const finalRecentRating =
    Number(recentRating.toFixed(2));


const profileRating = await prisma.profileRating.upsert({

    where: {
        userId: userId
    },

    update: {
        overallRating: finalOverallRating,
        recentRating: finalRecentRating,
        totalReviews: reviews.length,
        calculatedAt: new Date()
    },

    create: {
        userId: userId,
        overallRating: finalOverallRating,
        recentRating: finalRecentRating,
        totalReviews: reviews.length
    }
});


return profileRating;
};
import { calculateRating } from "../services/ratingService.js";


export const getRating = async (req, res) => {

    try {

        const { userId } = req.params;


        if (!userId) {

            return res.status(400).json({
                error: "User ID is required"
            });
        }


        const rating =
            await calculateRating(userId);


        return res.status(200).json({
            rating
        });


    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: "Failed to calculate rating"
        });
    }
};
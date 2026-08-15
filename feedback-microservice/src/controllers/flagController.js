import { createFlag as createFlagService } from "../services/flagService.js";


export const flagReview = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            user,
            reason
        } = req.body;


        if (!user || !user.userId) {

            return res.status(400).json({
                error: "User is required"
            });

        }


        if (!reason || reason.trim() === "") {

            return res.status(400).json({
                error: "Reason is required"
            });

        }


        const flag = await createFlagService({

            reviewId: Number(id),

            reporterId: user.userId,

            reason

        });


        return res.status(201).json({
            flag
        });


    } catch(error) {

        console.log(error);

        return res.status(500).json({
            error: "Failed to report review"
        });

    }

};
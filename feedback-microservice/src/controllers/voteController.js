import { voteReview as voteReviewService } from "../services/voteService.js";


export const voteReview = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            user,
            vote
        } = req.body;


        if (!user || !user.userId) {
            return res.status(400).json({
                error: "User is required"
            });
        }


        if (!vote || !["UP", "DOWN"].includes(vote.type)) {
            return res.status(400).json({
                error: "Vote must be UP or DOWN"
            });
        }



        const result = await voteReviewService({

            reviewId: Number(id),

            userId: user.userId,

            voteType: vote.type

        });


        return res.status(201).json({
            vote: result
        });


    } catch(error) {

        console.log(error);

        return res.status(500).json({
            error:"Failed to vote"
        });

    }

};
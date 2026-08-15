import express from "express";

import {
    flagReview
} from "../controllers/flagController.js";


const router = express.Router();


router.post("/:id/flags", flagReview);


export default router;
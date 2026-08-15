import express from "express";

import {
    getRating
} from "../controllers/ratingController.js";


const router = express.Router();


router.get("/:userId", getRating);


export default router;
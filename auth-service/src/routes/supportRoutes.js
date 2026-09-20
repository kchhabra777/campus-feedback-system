import express from 'express';
import { getPosts, createPost, upvotePost, addComment } from '../controllers/supportController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes in this file
router.use(requireAuth);

router.get('/posts', getPosts);
router.post('/posts', createPost);
router.post('/posts/:id/upvote', upvotePost);
router.post('/posts/:id/comments', addComment);

export default router;

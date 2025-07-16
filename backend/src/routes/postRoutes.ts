// src/routes/postRoutes.ts
import express from 'express';
import { addPost, getAllPosts } from '../controllers/postController';

const router = express.Router();
router.get('/', getAllPosts);
router.post('/', addPost);
export default router;
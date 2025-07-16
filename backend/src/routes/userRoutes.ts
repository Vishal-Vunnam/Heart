// src/routes/postRoutes.ts
import express from 'express';
import {getAllUsers, addUser} from '../controllers/userController';

const router = express.Router();
router.get('/', getAllUsers);
router.post('/', addUser);
export default router;
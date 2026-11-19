
import { Router } from 'express';

import {
  getProfile,
  updateProfile,
} from '../controllers/profileController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Protect all profile routes
router.use(protect);

// Get logged-in user's profile
router.get('/', getProfile);

// Update logged-in user's profile
router.put('/', updateProfile);

export default router;

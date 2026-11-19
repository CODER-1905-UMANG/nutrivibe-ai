
import { Router } from 'express';

import {
  registerUser,
  loginUser,
} from '../controllers/authController.js';

import {
  registerValidator,
  loginValidator,
} from '../middleware/authValidator.js';

const router = Router();

// User registration
router.post('/register', registerValidator, registerUser);

// User login
router.post('/login', loginValidator, loginUser);

export default router;

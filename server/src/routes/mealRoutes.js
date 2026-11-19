
import { Router } from 'express';
import {
  createMeal,
  getMeals,
  getMealById,
  updateMeal,
  deleteMeal,
} from '../controllers/mealController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// All meal routes require a valid JWT
router.use(protect);

router.get('/', getMeals);
router.post('/', createMeal);
router.get('/:id', getMealById);
router.put('/:id', updateMeal);
router.delete('/:id', deleteMeal);

export default router;

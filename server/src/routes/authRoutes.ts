import { Router } from 'express';
import { signup, login, updatePassword } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.patch('/update-password', protect, updatePassword);
router.patch('/change-password', protect, updatePassword);

export default router;

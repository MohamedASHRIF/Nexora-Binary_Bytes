import { Router } from 'express';
import { signup, login, updatePassword } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.patch('/update-password', protect, updatePassword);
router.patch('/change-password', protect, updatePassword);
router.get('/me', protect, (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    faculty: req.user.faculty,
  });
});

export default router;

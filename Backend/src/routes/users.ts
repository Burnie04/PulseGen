import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

interface AuthRequest extends Request {
  user?: { id: string };
}

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      avatarUrl: user.avatarUrl,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

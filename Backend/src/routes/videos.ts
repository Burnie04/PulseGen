import { Router, Request } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { Video } from '../models/Video.js';
import { AppError } from '../middleware/errorHandler.js';

interface AuthRequest extends Request {
  user?: { id: string };
}

const router = Router();

router.post('/', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { title, fileUrl, isPublic } = req.body;

    if (!title || !fileUrl) {
      throw new AppError('Title and fileUrl are required', 400);
    }

    const video = await Video.create({
      title,
      fileUrl,
      isPublic: Boolean(isPublic),
      uploadedBy: req.user!.id,
    });

    res.status(201).json(video);
  } catch (error) {
    next(error);
  }
});

router.get('/public', async (req, res, next) => {
  try {
    const videos = await Video.find({ isPublic: true }).sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    next(error);
  }
});

export default router;

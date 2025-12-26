import { Router } from 'express';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';
import { Video } from '../models/Video.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

router.get('/:videoId', optionalAuthMiddleware, async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.videoId);
    if (!video) {
      throw new AppError('Video not found', 404);
    }

    if (!video.isPublic && !(req as any).user) {
      throw new AppError('Unauthorized access', 401);
    }

    res.json({
      id: video._id,
      title: video.title,
      fileUrl: video.fileUrl,
      isPublic: video.isPublic,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

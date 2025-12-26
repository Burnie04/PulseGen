import { Video } from '../models/Video.js';
import { VideoAccess } from '../models/VideoAccess.js';
import { AppError } from '../middleware/errorHandler.js';
import mongoose from 'mongoose';

export const createVideo = async ({
  title,
  fileUrl,
  uploadedBy,
  organizationId,
  isPublic = false,
}: {
  title: string;
  fileUrl: string;
  uploadedBy: mongoose.Types.ObjectId;
  organizationId?: mongoose.Types.ObjectId | null;
  isPublic?: boolean;
}) => {
  if (!title || !fileUrl) {
    throw new AppError('Title and fileUrl are required', 400);
  }

  const video = await Video.create({
    title,
    fileUrl,
    uploadedBy,
    organizationId,
    isPublic,
    processingStatus: 'pending',
  });

  return video;
};

export const checkVideoAccess = async (
  userId: mongoose.Types.ObjectId,
  videoId: mongoose.Types.ObjectId,
  requiredPermission: 'view' | 'edit' = 'view'
) => {
  const video = await Video.findById(videoId);

  if (!video) {
    throw new AppError('Video not found', 404);
  }

  if (video.isPublic && requiredPermission === 'view') {
    return video;
  }

  if (video.uploadedBy.equals(userId)) {
    return video;
  }
  const access = await VideoAccess.findOne({
    userId,
    videoId,
    permission: requiredPermission,
  });

  if (!access) {
    throw new AppError('Access denied', 403);
  }

  return video;
};

export const getPublicVideos = async () => {
  return Video.find({ isPublic: true }).sort({ createdAt: -1 });
};

export const deleteVideo = async (
  videoId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId
) => {
  const video = await Video.findById(videoId);

  if (!video) {
    throw new AppError('Video not found', 404);
  }

  if (!video.uploadedBy.equals(userId)) {
    throw new AppError('Only owner can delete video', 403);
  }

  await video.deleteOne();
};

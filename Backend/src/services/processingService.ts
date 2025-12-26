import { Video } from '../models/Video.js';
import { AppError } from '../middleware/errorHandler.js';
import { Types } from 'mongoose';

export type ProcessingStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

interface VideoDocument {
  _id: Types.ObjectId;
  processingStatus: ProcessingStatus;
  processingError?: string;
  save(): Promise<this>;
}

export const updateProcessingStatus = async (
  videoId: string,
  status: ProcessingStatus,
  errorMessage?: string
) => {
  const video = (await Video.findById(videoId)) as VideoDocument | null;

  if (!video) {
    throw new AppError('Video not found', 404);
  }

  if (video.processingStatus === 'completed') {
    throw new AppError('Processing already completed', 400);
  }

  video.processingStatus = status;

  if (status === 'failed' && errorMessage) {
    video.processingError = errorMessage;
  }

  await video.save();

  return video;
};

export const markProcessingStarted = async (videoId: string) => {
  return updateProcessingStatus(videoId, 'processing');
};

export const markProcessingCompleted = async (videoId: string) => {
  return updateProcessingStatus(videoId, 'completed');
};

export const markProcessingFailed = async (
  videoId: string,
  errorMessage: string
) => {
  return updateProcessingStatus(videoId, 'failed', errorMessage);
};

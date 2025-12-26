import mongoose, { Schema, Document } from 'mongoose';

export type VideoPermission = 'view' | 'edit';

export interface IVideoAccess extends Document {
  userId: mongoose.Types.ObjectId;
  videoId: mongoose.Types.ObjectId;
  permission: VideoPermission;
  createdAt?: Date;
  updatedAt?: Date;
}

const videoAccessSchema = new Schema<IVideoAccess>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    videoId: {
      type: Schema.Types.ObjectId,
      ref: 'Video',
      required: true,
      index: true,
    },
    permission: {
      type: String,
      enum: ['view', 'edit'],
      required: true,
    },
  },
  { timestamps: true }
);

videoAccessSchema.index(
  { userId: 1, videoId: 1 },
  { unique: true }
);

export const VideoAccess = mongoose.model<IVideoAccess>(
  'VideoAccess',
  videoAccessSchema
);

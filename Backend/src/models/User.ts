import mongoose, { Schema } from 'mongoose';
import bcryptjs from 'bcryptjs';

export type UserRole = 'viewer' | 'editor' | 'admin';

export interface IUser {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  organizationId?: mongoose.Types.ObjectId | null;
  avatarUrl?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[\w.-]+@[\w.-]+\.\w{2,}$/,
        'Please provide a valid email',
      ],
      index: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ['viewer', 'editor', 'admin'],
      default: 'viewer',
    },

    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
    },

    avatarUrl: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    this.password = await bcryptjs.hash(this.password, 10);
    next();
  } catch (error) {
    next(error as Error);
  }
});

userSchema.methods.comparePassword = function (
  password: string
): Promise<boolean> {
  return bcryptjs.compare(password, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);

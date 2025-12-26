import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const organizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Organization = mongoose.model<IOrganization>(
  'Organization',
  organizationSchema
);
export default Organization;
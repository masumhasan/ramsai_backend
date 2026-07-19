import mongoose, { Document, Schema } from 'mongoose';

export interface ILegalContent extends Document {
  type: 'privacy' | 'terms';
  title: string;
  content: string;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const legalContentSchema = new Schema<ILegalContent>(
  {
    type: {
      type: String,
      required: true,
      unique: true,
      enum: ['privacy', 'terms'],
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export const LegalContent = mongoose.model<ILegalContent>('LegalContent', legalContentSchema);

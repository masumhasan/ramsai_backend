import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  images: { type: [String], default: [] },
}, { timestamps: true });

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema);

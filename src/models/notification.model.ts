import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  imageUrl?: string;
  type: 'system' | 'reminder' | 'workout' | 'nutrition' | 'achievement' | 'subscription' | 'broadcast';
  isRead: boolean;
  isBroadcast?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    type: {
      type: String,
      enum: ['system', 'reminder', 'workout', 'nutrition', 'achievement', 'subscription', 'broadcast'],
      default: 'system',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isBroadcast: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);

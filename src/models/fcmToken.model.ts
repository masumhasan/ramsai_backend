import mongoose, { Schema, Document } from 'mongoose';

export interface IFcmToken extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  deviceType: 'android' | 'ios' | 'web';
  updatedAt: Date;
  createdAt: Date;
}

const FcmTokenSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    deviceType: {
      type: String,
      enum: ['android', 'ios', 'web'],
      default: 'android',
    },
  },
  { timestamps: true }
);

export default mongoose.model<IFcmToken>('FcmToken', FcmTokenSchema);

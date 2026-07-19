import mongoose, { Schema, Document } from 'mongoose';

export type PlanType = 'basic' | 'premium';

export interface ISubscriptionPlan extends Document {
  name: string;
  type: PlanType;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  dailyLimits: {
    foodScans: number; // -1 for unlimited
    productScans: number; // -1 for unlimited
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionPlanSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['basic', 'premium'], required: true, unique: true },
    price: { type: Number, required: true, default: 0.0 },
    billingCycle: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
    features: [{ type: String }],
    dailyLimits: {
      foodScans: { type: Number, default: 3 },
      productScans: { type: Number, default: 2 },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<ISubscriptionPlan>('SubscriptionPlan', SubscriptionPlanSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IBanner {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  link?: string;
  isActive: boolean;
}

export interface IAgeRange {
  id: string;
  name: string;
  minAge: number;
  maxAge: number;
  icon?: string;
}

export interface IAppConfig extends Document {
  banners: IBanner[];
  categories: string[];
  ageRanges: IAgeRange[];
  maintenanceMode: boolean;
  storeName: string;
  supportEmail: string;
  currency: string;
  shippingFee: number;
  freeShippingThreshold: number;
  taxRate: number;
}

const AgeRangeSchema = new Schema({
  name: { type: String, required: true },
  minAge: { type: Number, required: true },
  maxAge: { type: Number, required: true },
  icon: { type: String, default: 'baby-face-outline' }
});

const BannerSchema = new Schema({
  image: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String },
  link: { type: String },
  isActive: { type: Boolean, default: true },
  startDate: { type: Date },
  endDate: { type: Date }
});

const AppConfigSchema: Schema = new Schema({
  banners: [BannerSchema],
  categories: [{ type: String }],
  ageRanges: [AgeRangeSchema],
  maintenanceMode: { type: Boolean, default: false },
  storeName: { type: String, default: 'ToyBox Marketplace' },
  supportEmail: { type: String, default: 'support@toybox.com' },
  currency: { type: String, default: 'INR' },
  shippingFee: { type: Number, default: 99 },
  freeShippingThreshold: { type: Number, default: 999 },
  taxRate: { type: Number, default: 18 }
}, { timestamps: true });

export default mongoose.model<IAppConfig>('AppConfig', AppConfigSchema);

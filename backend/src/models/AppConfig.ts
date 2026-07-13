import mongoose, { Schema, Document } from 'mongoose';

export interface IBanner {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  link?: string;
  isActive: boolean;
}

export interface IAppConfig extends Document {
  banners: IBanner[];
  categories: string[];
  maintenanceMode: boolean;
  storeName: string;
  supportEmail: string;
  currency: string;
  shippingFee: number;
  freeShippingThreshold: number;
  taxRate: number;
}

const BannerSchema = new Schema({
  image: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String },
  link: { type: String },
  isActive: { type: Boolean, default: true }
});

const AppConfigSchema: Schema = new Schema({
  banners: [BannerSchema],
  categories: [{ type: String }],
  maintenanceMode: { type: Boolean, default: false },
  storeName: { type: String, default: 'ToyBox Marketplace' },
  supportEmail: { type: String, default: 'support@toybox.com' },
  currency: { type: String, default: 'INR' },
  shippingFee: { type: Number, default: 99 },
  freeShippingThreshold: { type: Number, default: 999 },
  taxRate: { type: Number, default: 18 }
}, { timestamps: true });

export default mongoose.model<IAppConfig>('AppConfig', AppConfigSchema);

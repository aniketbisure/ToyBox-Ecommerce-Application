import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  // 1. Basic Identity
  name: string;
  brand: string;
  manufacturer: string;
  modelNumber?: string;
  asin?: string;
  sku: string;
  countryOfOrigin: string;

  // 2. Classification
  mainCategory: string;
  subCategory: string;
  productType: string;

  // 3. Age & Safety
  minimumAge: number; // in months
  maximumAge?: number;
  ageRangeDescription: string;
  smallPartsWarning: boolean;
  safetyWarningText?: string;

  // 4. Images & Media
  image: string; // Main image
  images: string[]; // Up to 9 additional
  videoUrl?: string;

  // 5. Content
  description: string;
  bulletPoints: string[]; // Exactly 5
  aPlusContent?: string; // Rich media/HTML

  // 6. Physical Specs
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
  weight: {
    value: number;
    unit: 'kg' | 'lb';
  };
  batteriesRequired: boolean;
  batteryType?: string;
  batteryIncluded?: boolean;

  // 7. Pricing & Inventory
  listPrice: number; // MRP
  price: number; // Selling Price
  salePrice?: number;
  stock: number;
  isFBA: boolean; // Fulfillment by Amazon (Prime badge)

  // 8. Toy Specifics
  materialType: string;
  educationalObjective?: string;
  assemblyRequired: boolean;

  // 9. Compliance (Admin Only)
  cpcCertificateUrl?: string;
  testReportUrl?: string;
  rating: number;
  numReviews: number;
  reviews: IReview[];
  isDeleted: boolean; // Added for soft delete
}

export interface IReview {
  _id?: any;
  name: string;
  rating: number;
  comment: string;
  user: mongoose.Types.ObjectId;
}

const ReviewSchema: Schema = new Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
}, { timestamps: true });

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  manufacturer: { type: String, required: true },
  modelNumber: { type: String },
  asin: { type: String, unique: true, sparse: true },
  sku: { type: String, required: true, unique: true },
  countryOfOrigin: { type: String, required: true },

  mainCategory: { type: String, default: 'Toys & Games' },
  subCategory: { type: String, required: true },
  productType: { type: String, required: true },

  minimumAge: { type: Number, required: true },
  maximumAge: { type: Number },
  ageRangeDescription: { type: String },
  smallPartsWarning: { type: Boolean, default: false },
  safetyWarningText: { type: String },

  image: { type: String, required: true },
  images: [{ type: String }],
  videoUrl: { type: String },

  description: { type: String, required: true },
  bulletPoints: [{ type: String }],
  aPlusContent: { type: String },

  dimensions: {
    length: { type: Number },
    width: { type: Number },
    height: { type: Number },
    unit: { type: String, enum: ['cm', 'in'], default: 'cm' }
  },
  weight: {
    value: { type: Number },
    unit: { type: String, enum: ['kg', 'lb'], default: 'kg' }
  },
  batteriesRequired: { type: Boolean, default: false },
  batteryType: { type: String },
  batteryIncluded: { type: Boolean },

  listPrice: { type: Number, required: true },
  price: { type: Number, required: true },
  salePrice: { type: Number },
  stock: { type: Number, required: true, default: 0 },
  isFBA: { type: Boolean, default: true },

  materialType: { type: String },
  educationalObjective: { type: String },
  assemblyRequired: { type: Boolean, default: false },

  cpcCertificateUrl: { type: String },
  testReportUrl: { type: String },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  reviews: [ReviewSchema],
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

// Enterprise Ready: Database Indexing for High-Performance Queries
ProductSchema.index({ name: 'text', description: 'text', brand: 'text' }); // Text search
ProductSchema.index({ mainCategory: 1, subCategory: 1 }); // Category filtering
ProductSchema.index({ price: 1 }); // Price sorting/filtering
ProductSchema.index({ createdAt: -1 }); // Recently added

export default mongoose.model<IProduct>('Product', ProductSchema);

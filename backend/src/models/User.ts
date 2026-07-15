import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
}

export interface IAddress {
  id: string;
  label?: string; // Home, Office, etc.
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  refreshToken?: string;
  wishlist: mongoose.Types.ObjectId[];
  cart: ICartItem[];
  savedItems: ICartItem[];
  recentlyViewed: mongoose.Types.ObjectId[];
  fcmToken?: string;
  addresses: IAddress[];
  phoneNumbers: string[];
  paymentMethods: any[]; // Or define IPaymentMethod
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  refreshToken: { type: String },
  wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  cart: [{
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, default: 1 }
  }],
  savedItems: [{
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, default: 1 }
  }],
  recentlyViewed: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  fcmToken: { type: String },
  addresses: [{
    id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    label: { type: String },
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zip: { type: String },
    country: { type: String, default: 'India' },
  }],
  phoneNumbers: [{ type: String }],
  paymentMethods: [{
    id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    number: { type: String },
    holder: { type: String },
    expiry: { type: String },
    type: { type: String },
  }],
}, { timestamps: true });

UserSchema.index({ role: 1 });

UserSchema.pre('save', async function (this: any) {
  const user = this;
  if (!user.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
});

UserSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface ISupport extends Document {
  user: mongoose.Types.ObjectId;
  subject: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  response?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SupportSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: {
    type: String,
    enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
    default: 'OPEN'
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'MEDIUM'
  },
  response: { type: String },
}, { timestamps: true });

export default mongoose.model<ISupport>('Support', SupportSchema);

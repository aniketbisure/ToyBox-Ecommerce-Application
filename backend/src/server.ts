import 'dotenv/config';
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import userRoutes from './routes/userRoutes';
import configRoutes from './routes/configRoutes';
import orderRoutes from './routes/orderRoutes';
import { notFound, errorHandler } from './middleware/errorMiddleware';
import logger from './utils/logger';
import { initOrderReconciliationJob } from './jobs/reconcileJob';



const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/toybox';

// SECURITY FIX: Fail fast if critical secrets are missing
const REQUIRED_ENV = ['JWT_SECRET', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'];
REQUIRED_ENV.forEach((key) => {
  if (!process.env[key]) {
    logger.error(`ERROR: Missing critical environment variable ${key}`);
    process.exit(1);
  }
});

// Middleware
app.use(express.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf.toString();
  }
}));
app.use(cors());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api', limiter);

// Custom Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Database connection
mongoose.connect(MONGO_URI)
  .then(() => {
    logger.info('✅ MongoDB Connected');
    // 10/10 Logic: Start background jobs after DB is ready
    initOrderReconciliationJob();
  })
  .catch(err => logger.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/config', configRoutes);
app.use('/api/orders', orderRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});

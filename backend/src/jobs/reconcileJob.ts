import cron from 'node-cron';
import Order from '../models/Order';
import Product from '../models/Product';
import mongoose from 'mongoose';
import Razorpay from 'razorpay';
import logger from '../utils/logger';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

// Run every hour
export const initOrderReconciliationJob = () => {
  cron.schedule('0 * * * *', async () => {
    logger.info('Starting scheduled order reconciliation job...');

    try {
      // Find orders that are PENDING and older than 2 hours
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const staleOrders = await Order.find({
        status: 'PENDING',
        createdAt: { $lt: twoHoursAgo },
        razorpayOrderId: { $exists: true }
      });

      logger.info(`Found ${staleOrders.length} stale pending orders for check.`);

      for (const order of staleOrders) {
        try {
          const payments: any = await razorpay.orders.fetchPayments(order.razorpayOrderId!);
          const successfulPayment = payments.items.find((p: any) => p.status === 'captured');

          if (successfulPayment) {
            const session = await mongoose.startSession();
            session.startTransaction();
            try {
              order.isPaid = true;
              order.paidAt = new Date();
              order.status = 'PAID';
              order.paymentResult = {
                id: successfulPayment.id,
                status: 'captured',
                update_time: new Date().toISOString(),
                email_address: successfulPayment.email,
              };

              for (const item of order.orderItems) {
                await Product.findOneAndUpdate(
                  { _id: item.product, stock: { $gte: item.quantity } },
                  { $inc: { stock: -item.quantity } },
                  { session }
                );
              }
              await order.save({ session });
              await session.commitTransaction();
              logger.info(`Successfully reconciled order ${order._id}`);
            } catch (err: any) {
              await session.abortTransaction();
              logger.error(`Failed to reconcile order ${order._id}: ${err.message}`);
            } finally {
              session.endSession();
            }
          } else {
            // Optional: Mark as cancelled if very old and no payment found
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            if ((order as any).createdAt < oneDayAgo) {
              order.status = 'CANCELLED';
              await order.save();
              logger.info(`Cancelled expired unpaid order ${order._id}`);
            }
          }
        } catch (error: any) {
          logger.error(`Error checking Razorpay for order ${order._id}: ${error.message}`);
        }
      }
    } catch (error: any) {
      logger.error(`Cron job failed: ${error.message}`);
    }
  });
};

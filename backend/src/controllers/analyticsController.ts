import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import User from '../models/User';
import Product from '../models/Product';

// @desc    Get most viewed products across all users
// @route   GET /api/admin/analytics/most-viewed
// @access  Private/Admin
export const getMostViewedProducts = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find({}).select('recentlyViewed');
    const productViews: { [key: string]: number } = {};

    users.forEach(user => {
      user.recentlyViewed.forEach(prodId => {
        const id = prodId.toString();
        productViews[id] = (productViews[id] || 0) + 1;
      });
    });

    const sortedViews = Object.entries(productViews)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    const products = await Promise.all(
      sortedViews.map(async ([id, count]) => {
        const product = await Product.findById(id).select('name image price mainCategory subCategory');
        return { product, viewCount: count };
      })
    );

    res.json(products.filter(p => p.product));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching most viewed products', error });
  }
};

// @desc    Get products most saved for later
// @route   GET /api/admin/analytics/most-saved
// @access  Private/Admin
export const getMostSavedProducts = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find({}).select('savedItems');
    const productSaves: { [key: string]: number } = {};

    users.forEach(user => {
      user.savedItems.forEach(item => {
        const id = item.product.toString();
        productSaves[id] = (productSaves[id] || 0) + 1;
      });
    });

    const sortedSaves = Object.entries(productSaves)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    const products = await Promise.all(
      sortedSaves.map(async ([id, count]) => {
        const product = await Product.findById(id).select('name image price mainCategory subCategory');
        return { product, saveCount: count };
      })
    );

    res.json(products.filter(p => p.product));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching most saved products', error });
  }
};

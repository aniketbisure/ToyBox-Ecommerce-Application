import { Request, Response, NextFunction } from 'express';

export const validateProduct = (req: Request, res: Response, next: NextFunction) => {
  const { name, price, category, image, listPrice, sku } = req.body;

  if (!name || name.length < 3) {
    res.status(400).json({ message: 'Product name must be at least 3 characters' });
    return;
  }

  if (!price || price <= 0) {
    res.status(400).json({ message: 'Price must be a positive number' });
    return;
  }

  if (listPrice && listPrice < price) {
    res.status(400).json({ message: 'List price (MRP) cannot be less than selling price' });
    return;
  }

  if (!sku || sku.length < 5) {
    res.status(400).json({ message: 'Valid SKU is required' });
    return;
  }

  next();
};

export const validateAuth = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRegex.test(email)) {
    res.status(400).json({ message: 'Valid email address is required' });
    return;
  }

  if (!password || password.length < 6) {
    res.status(400).json({ message: 'Password must be at least 6 characters' });
    return;
  }

  next();
};

export const validateOrder = (req: Request, res: Response, next: NextFunction) => {
  const { orderItems, shippingAddress } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400).json({ message: 'Order must contain at least one item' });
    return;
  }

  if (!shippingAddress || !shippingAddress.address || !shippingAddress.city) {
    res.status(400).json({ message: 'Complete shipping address is required' });
    return;
  }

  next();
};

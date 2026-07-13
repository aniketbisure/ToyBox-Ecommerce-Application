import { Request, Response } from 'express';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/authMiddleware';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const pageSize = Number(req.query.pageSize) || 12;
    const page = Number(req.query.pageNumber) || 1;

    const keyword = req.query.keyword
      ? {
          $text: { $search: req.query.keyword.toString() },
          isDeleted: false,
        }
      : { isDeleted: false };

    const count = await Product.countDocuments(keyword);
    const products = await Product.find(keyword)
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({ products, page, pages: Math.ceil(count / pageSize), total: count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      name, brand, manufacturer, modelNumber, sku, countryOfOrigin,
      subCategory, productType, mainCategory,
      minimumAge, maximumAge, ageRangeDescription, smallPartsWarning, safetyWarningText,
      image, images, videoUrl,
      description, bulletPoints, aPlusContent,
      dimensions, weight, batteriesRequired, batteryType, batteryIncluded,
      listPrice, price, salePrice, stock,
      materialType, educationalObjective, assemblyRequired,
      cpcCertificateUrl, testReportUrl,
    } = req.body;

    const product = await Product.create({
      name, brand, manufacturer, modelNumber, sku, countryOfOrigin,
      subCategory, productType, mainCategory,
      minimumAge, maximumAge, ageRangeDescription, smallPartsWarning, safetyWarningText,
      image, images, videoUrl,
      description, bulletPoints, aPlusContent,
      dimensions, weight, batteriesRequired, batteryType, batteryIncluded,
      listPrice, price, salePrice, stock,
      materialType, educationalObjective, assemblyRequired,
      cpcCertificateUrl, testReportUrl,
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const {
      name, brand, manufacturer, modelNumber, sku, countryOfOrigin,
      subCategory, productType, mainCategory,
      minimumAge, maximumAge, ageRangeDescription, smallPartsWarning, safetyWarningText,
      image, images, videoUrl,
      description, bulletPoints, aPlusContent,
      dimensions, weight, batteriesRequired, batteryType, batteryIncluded,
      listPrice, price, salePrice, stock,
      materialType, educationalObjective, assemblyRequired,
      cpcCertificateUrl, testReportUrl,
    } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name, brand, manufacturer, modelNumber, sku, countryOfOrigin,
        subCategory, productType, mainCategory,
        minimumAge, maximumAge, ageRangeDescription, smallPartsWarning, safetyWarningText,
        image, images, videoUrl,
        description, bulletPoints, aPlusContent,
        dimensions, weight, batteriesRequired, batteryType, batteryIncluded,
        listPrice, price, salePrice, stock,
        materialType, educationalObjective, assemblyRequired,
        cpcCertificateUrl, testReportUrl,
      },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    // SECURITY FIX: Soft delete to preserve order history and data integrity
    const product = await Product.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product removed (soft deleted)' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error });
  }
};

export const createProductReview = async (req: AuthRequest, res: Response) => {
  const { rating, comment } = req.body;

  if (!rating || !comment?.trim()) {
    return res.status(400).json({ message: 'Rating and comment are required' });
  }

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user!.id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Product already reviewed' });
    }

    const review = {
      name: req.user!.name || 'User',
      rating: Number(rating),
      comment: comment.trim(),
      user: req.user!.id,
    };

    product.reviews.push(review as any);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error adding review' });
  }
};

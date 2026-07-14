import { Request, Response } from 'express';
import AppConfig from '../models/AppConfig';

export const getConfig = async (req: Request, res: Response) => {
  try {
    let config = await AppConfig.findOne();
    if (!config) {
      // ... (default creation code remains the same)
    }

    // Filter banners based on scheduling
    const now = new Date();
    config.banners = config.banners.filter(banner => {
      if (!banner.isActive) return false;
      if (banner.startDate && now < new Date(banner.startDate)) return false;
      if (banner.endDate && now > new Date(banner.endDate)) return false;
      return true;
    });

    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching app config', error });
  }
};

export const updateConfig = async (req: Request, res: Response) => {
  try {
    const {
      storeName,
      supportEmail,
      currency,
      shippingFee,
      freeShippingThreshold,
      taxRate,
      maintenanceMode,
      ageRanges
    } = req.body;

    const update: Record<string, any> = {};
    if (storeName !== undefined) update.storeName = storeName;
    if (supportEmail !== undefined) update.supportEmail = supportEmail;
    if (currency !== undefined) update.currency = currency;
    if (shippingFee !== undefined) update.shippingFee = Number(shippingFee);
    if (freeShippingThreshold !== undefined) update.freeShippingThreshold = Number(freeShippingThreshold);
    if (taxRate !== undefined) update.taxRate = Number(taxRate);
    if (maintenanceMode !== undefined) update.maintenanceMode = Boolean(maintenanceMode);
    if (ageRanges !== undefined) update.ageRanges = ageRanges;

    const config = await AppConfig.findOneAndUpdate(
      {},
      { $set: update },
      { new: true, upsert: true }
    );
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Error updating app config', error });
  }
};

export const addCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const config = await AppConfig.findOneAndUpdate(
      {},
      { $addToSet: { categories: name } },
      { new: true, upsert: true }
    );
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Error adding category', error });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const config = await AppConfig.findOneAndUpdate(
      {},
      { $pull: { categories: name } },
      { new: true }
    );
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error });
  }
};

export const addBanner = async (req: Request, res: Response) => {
  try {
    const banner = req.body;
    const config = await AppConfig.findOneAndUpdate(
      {},
      { $push: { banners: banner } },
      { new: true, upsert: true }
    );
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Error adding banner', error });
  }
};

export const updateBanners = async (req: Request, res: Response) => {
  try {
    const { banners } = req.body;
    if (!Array.isArray(banners)) {
      return res.status(400).json({ message: 'banners must be an array' });
    }
    const config = await AppConfig.findOneAndUpdate(
      {},
      { $set: { banners } },
      { new: true, upsert: true }
    );
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Error updating banners', error });
  }
};

export const deleteBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const config = await AppConfig.findOneAndUpdate(
      {},
      { $pull: { banners: { _id: id } } },
      { new: true }
    );
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting banner', error });
  }
};

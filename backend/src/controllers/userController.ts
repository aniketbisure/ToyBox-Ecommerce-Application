import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import User from '../models/User';

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id)
      .select('-password')
      .populate('wishlist')
      .populate('cart.product');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, address, fcmToken } = req.body;
    const update: any = {};
    if (name) update.name = name;
    if (email) update.email = email;
    if (address) update.address = address;
    if (fcmToken) update.fcmToken = fcmToken;

    const user = await User.findByIdAndUpdate(
      req.user?.id,
      update,
      { new: true }
    ).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error });
  }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};

export const deleteProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await User.findByIdAndDelete(req.user?.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting profile', error });
  }
};

export const updateWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const { wishlist } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user?.id,
      { wishlist },
      { new: true }
    ).populate('wishlist');
    res.json(user?.wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Error updating wishlist', error });
  }
};

export const updateCart = async (req: AuthRequest, res: Response) => {
  try {
    const { cart } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user?.id,
      { cart },
      { new: true }
    ).populate('cart.product');
    res.json(user?.cart);
  } catch (error) {
    res.status(500).json({ message: 'Error updating cart', error });
  }
};

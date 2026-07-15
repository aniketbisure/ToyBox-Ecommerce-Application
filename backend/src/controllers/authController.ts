import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Fix: remove fallback insecure defaults — server.ts already enforces these exist at startup
const generateTokens = (id: string, role: string, name: string) => {
  const accessToken = jwt.sign({ id, role, name }, process.env.JWT_SECRET!, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }
    const user = await User.create({ name, email, password });

    const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role, user.name);
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      token: accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    console.log(`[LOGIN_ATTEMPT] Email: ${email}`);

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log(`[LOGIN_FAILED] User not found: ${email}`);
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log(`[LOGIN_FAILED] Password mismatch for: ${email}`);
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role, user.name);
    user.refreshToken = refreshToken;
    await user.save();

    console.log(`[LOGIN_SUCCESS] User logged in: ${user.email} (${user.role})`);
    res.status(200).json({
      token: accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error: any) {
    console.error(`[LOGIN_ERROR] ${error.message}`);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(401).json({ message: 'Refresh token required' });
    return;
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      res.status(403).json({ message: 'Invalid refresh token' });
      return;
    }

    const tokens = generateTokens(user._id.toString(), user.role, user.name);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json({ token: tokens.accessToken, refreshToken: tokens.refreshToken });
  } catch (error) {
    res.status(403).json({ message: 'Token refresh failed' });
  }
};

export const verifyToken = async (req: any, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Verification failed' });
  }
};

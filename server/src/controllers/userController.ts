import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User, { IUser } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

// Generate JWT token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  } as jwt.SignOptions);
};

// @desc    Register user
// @route   POST /api/users/register
// @access  Public
export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  const { username, email, password, role = 'citizen', profile } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    res.status(400).json({
      success: false,
      error: 'User with this email or username already exists'
    });
    return;
  }

  // Create user
  const user = await User.create({
    username,
    email,
    password,
    role,
    profile: profile || {}
  });

  // Generate token
  const token = generateToken(user._id.toString());

  res.status(201).json({
    success: true,
    token,
    data: {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profile: user.profile,
      gamification: user.gamification,
      isVerified: user.isVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  });
});

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  const { email, password } = req.body;

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
    return;
  }

  // Check password
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
    return;
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = generateToken(user._id.toString());

  res.json({
    success: true,
    token,
    data: {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profile: user.profile,
      gamification: user.gamification,
      isVerified: user.isVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.lastLogin
    }
  });
});

// @desc    Get current user
// @route   GET /api/users/me
// @access  Private
export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!._id);

  res.json({
    success: true,
    data: user
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { profile, location } = req.body;

  const user = await User.findById(req.user!._id);

  if (!user) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }

  // Update profile
  if (profile) {
    user.profile = { ...user.profile, ...profile };
  }

  // Update location
  if (location && location.latitude && location.longitude) {
    user.location = {
      type: 'Point',
      coordinates: [parseFloat(location.longitude), parseFloat(location.latitude)]
    };
  }

  await user.save();

  res.json({
    success: true,
    data: user
  });
});

// @desc    Get leaderboard
// @route   GET /api/users/leaderboard
// @access  Public
export const getLeaderboard = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, timeframe = 'all' } = req.query;

  let dateFilter = {};
  
  if (timeframe === 'week') {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    dateFilter = { createdAt: { $gte: weekAgo } };
  } else if (timeframe === 'month') {
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    dateFilter = { createdAt: { $gte: monthAgo } };
  }

  const users = await User.find(dateFilter)
    .select('username profile.firstName profile.lastName profile.avatar gamification')
    .sort({ 'gamification.points': -1 })
    .limit(parseInt(limit as string))
    .skip((parseInt(page as string) - 1) * parseInt(limit as string));

  const total = await User.countDocuments(dateFilter);

  // Add rank to each user
  const leaderboard = users.map((user, index) => ({
    ...user.toObject(),
    rank: (parseInt(page as string) - 1) * parseInt(limit as string) + index + 1
  }));

  res.json({
    success: true,
    data: leaderboard,
    pagination: {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      total,
      pages: Math.ceil(total / parseInt(limit as string))
    }
  });
});

// @desc    Get user statistics
// @route   GET /api/users/:id/stats
// @access  Public
export const getUserStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = await User.findById(req.params.id)
    .select('username profile gamification createdAt');

  if (!user) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }

  // Get user's rank
  const usersWithHigherPoints = await User.countDocuments({
    'gamification.points': { $gt: user.gamification.points }
  });
  const rank = usersWithHigherPoints + 1;

  res.json({
    success: true,
    data: {
      ...user.toObject(),
      rank
    }
  });
});

// @desc    Award badge to user
// @route   POST /api/users/:id/badge
// @access  Private (Admin)
export const awardBadge = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { badge } = req.body;
  
  const user = await User.findById(req.params.id);
  
  if (!user) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }

  if (!user.gamification.badges.includes(badge)) {
    user.gamification.badges.push(badge);
    user.gamification.points += 50; // Bonus points for badge
    await user.save();
  }

  res.json({
    success: true,
    data: user
  });
});

// @desc    Get user activity
// @route   GET /api/users/:id/activity
// @access  Public
export const getUserActivity = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { page = 1, limit = 10 } = req.query;
  
  const user = await User.findById(req.params.id);
  
  if (!user) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }

  // This would typically involve aggregating data from issues, upvotes, etc.
  // For now, return basic user info
  res.json({
    success: true,
    data: {
      user: {
        username: user.username,
        profile: user.profile,
        gamification: user.gamification
      },
      activities: [] // Would be populated with actual activity data
    }
  });
});
import express from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import {
  verifyImage,
  verifyImages,
  submitMLFeedback,
  getMLHealth,
  getSupportedCategories,
  getMLStats,
  uploadImages
} from '../controllers/mlController';

const router = express.Router();

// Rate limiting for ML endpoints
const mlRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: {
    success: false,
    error: 'Too many ML verification requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for image verification
const imageVerificationRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Limit each IP to 20 image verifications per 5 minutes
  message: {
    success: false,
    error: 'Too many image verification requests, please try again in a few minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation middleware
const verifyImageValidation = [
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['road', 'waste', 'water', 'electricity', 'infrastructure', 'safety'])
    .withMessage('Invalid category'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters')
];

const feedbackValidation = [
  body('issueId')
    .optional()
    .isMongoId()
    .withMessage('Invalid issue ID'),
  body('actualCategory')
    .notEmpty()
    .withMessage('Actual category is required')
    .isIn(['road', 'waste', 'water', 'electricity', 'infrastructure', 'safety'])
    .withMessage('Invalid actual category'),
  body('userFeedback')
    .notEmpty()
    .withMessage('User feedback is required')
    .isIn(['correct', 'incorrect'])
    .withMessage('User feedback must be either "correct" or "incorrect"'),
  body('predictions')
    .isArray()
    .withMessage('Predictions must be an array'),
  body('imagePath')
    .optional()
    .isString()
    .withMessage('Image path must be a string')
];

// Routes

// @route   POST /api/ml/verify-image
// @desc    Verify single image against category
// @access  Public
router.post(
  '/verify-image',
  mlRateLimit,
  imageVerificationRateLimit,
  uploadImages,
  verifyImageValidation,
  verifyImage
);

// @route   POST /api/ml/verify-images
// @desc    Verify multiple images against category
// @access  Public
router.post(
  '/verify-images',
  mlRateLimit,
  imageVerificationRateLimit,
  uploadImages,
  verifyImageValidation,
  verifyImages
);

// @route   POST /api/ml/feedback
// @desc    Submit feedback for ML model improvement
// @access  Public
router.post(
  '/feedback',
  mlRateLimit,
  feedbackValidation,
  submitMLFeedback
);

// @route   GET /api/ml/health
// @desc    Get ML service health status
// @access  Public
router.get('/health', getMLHealth);

// @route   GET /api/ml/categories
// @desc    Get supported categories and their ML mappings
// @access  Public
router.get('/categories', getSupportedCategories);

// @route   GET /api/ml/stats
// @desc    Get ML verification statistics
// @access  Public
router.get('/stats', getMLStats);

export default router;
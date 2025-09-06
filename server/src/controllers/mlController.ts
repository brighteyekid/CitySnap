import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { asyncHandler } from '../middleware/errorHandler';
import { 
  verifyImageWithML, 
  verifyMultipleImages, 
  updateMLModelWithFeedback,
  getMLServiceHealth,
  ImageVerificationResult 
} from '../services/mlService';

// Configure multer for temporary image storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(process.cwd(), 'temp', 'ml-verification');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `ml-verify-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Max 5 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP) are allowed'));
    }
  }
});

// Middleware for handling file uploads
export const uploadImages = upload.array('images', 5);

// @desc    Verify single image against category
// @route   POST /api/ml/verify-image
// @access  Public
export const verifyImage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  const { category, description } = req.body;
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    res.status(400).json({ 
      success: false, 
      error: 'No image provided for verification' 
    });
    return;
  }

  try {
    const imagePath = files[0].path;
    
    // Verify image with ML
    const result = await verifyImageWithML(imagePath, category, description);
    
    // Clean up temporary file
    fs.unlink(imagePath, (err) => {
      if (err) console.error('Error deleting temp file:', err);
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error in image verification:', error);
    
    // Clean up any temporary files
    if (req.files) {
      (req.files as Express.Multer.File[]).forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Error deleting temp file:', err);
        });
      });
    }

    res.status(500).json({ 
      success: false, 
      error: 'Image verification failed' 
    });
  }
});

// @desc    Verify multiple images against category
// @route   POST /api/ml/verify-images
// @access  Public
export const verifyImages = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  const { category, description } = req.body;
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    res.status(400).json({ 
      success: false, 
      error: 'No images provided for verification' 
    });
    return;
  }

  try {
    const imagePaths = files.map(file => file.path);
    
    // Verify all images
    const results = await verifyMultipleImages(imagePaths, category, description);
    
    // Clean up temporary files
    imagePaths.forEach(imagePath => {
      fs.unlink(imagePath, (err) => {
        if (err) console.error('Error deleting temp file:', err);
      });
    });

    // Check if all images are valid
    const allValid = results.every(result => result.isValid);
    const validCount = results.filter(result => result.isValid).length;

    res.json({
      success: true,
      data: {
        allValid,
        validCount,
        totalCount: results.length,
        results,
        message: allValid 
          ? 'All images verified successfully!'
          : `${validCount} out of ${results.length} images verified. Please check the invalid images.`
      }
    });

  } catch (error) {
    console.error('Error in batch image verification:', error);
    
    // Clean up any temporary files
    if (req.files) {
      (req.files as Express.Multer.File[]).forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Error deleting temp file:', err);
        });
      });
    }

    res.status(500).json({ 
      success: false, 
      error: 'Batch image verification failed' 
    });
  }
});

// @desc    Submit feedback for ML model improvement
// @route   POST /api/ml/feedback
// @access  Public
export const submitMLFeedback = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  const { 
    issueId, 
    actualCategory, 
    userFeedback, 
    predictions,
    imagePath 
  } = req.body;

  try {
    await updateMLModelWithFeedback(
      imagePath,
      actualCategory,
      userFeedback,
      predictions
    );

    res.json({
      success: true,
      message: 'Feedback submitted successfully. Thank you for helping improve our system!'
    });

  } catch (error) {
    console.error('Error submitting ML feedback:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to submit feedback' 
    });
  }
});

// @desc    Get ML service health status
// @route   GET /api/ml/health
// @access  Public
export const getMLHealth = asyncHandler(async (req: Request, res: Response) => {
  try {
    const healthStatus = await getMLServiceHealth();
    
    res.json({
      success: true,
      data: healthStatus
    });

  } catch (error) {
    console.error('Error checking ML service health:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to check ML service health' 
    });
  }
});

// @desc    Get supported categories and their ML mappings
// @route   GET /api/ml/categories
// @access  Public
export const getSupportedCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = {
    'road': {
      description: 'Road-related issues',
      mlClasses: ['pothole', 'damaged_road', 'broken_sidewalk'],
      examples: ['Potholes', 'Cracked pavement', 'Damaged sidewalks']
    },
    'waste': {
      description: 'Waste and sanitation issues',
      mlClasses: ['garbage', 'illegal_dumping'],
      examples: ['Overflowing bins', 'Illegal dumping', 'Litter']
    },
    'water': {
      description: 'Water and drainage issues',
      mlClasses: ['water_leak', 'blocked_drain'],
      examples: ['Water leaks', 'Blocked drains', 'Flooding']
    },
    'electricity': {
      description: 'Electrical infrastructure issues',
      mlClasses: ['broken_streetlight'],
      examples: ['Broken streetlights', 'Damaged power lines']
    },
    'infrastructure': {
      description: 'General infrastructure issues',
      mlClasses: ['damaged_sign', 'broken_streetlight'],
      examples: ['Damaged signs', 'Broken infrastructure']
    },
    'safety': {
      description: 'Safety and security issues',
      mlClasses: ['graffiti'],
      examples: ['Vandalism', 'Safety hazards']
    }
  };

  res.json({
    success: true,
    data: categories
  });
});

// @desc    Get ML verification statistics
// @route   GET /api/ml/stats
// @access  Public
export const getMLStats = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Read feedback log to generate statistics
    const feedbackLogPath = path.join(process.cwd(), 'logs', 'ml-feedback.jsonl');
    let stats = {
      totalVerifications: 0,
      successfulVerifications: 0,
      failedVerifications: 0,
      accuracyRate: 0,
      categoryBreakdown: {} as Record<string, number>,
      lastUpdated: new Date().toISOString()
    };

    if (fs.existsSync(feedbackLogPath)) {
      const feedbackData = fs.readFileSync(feedbackLogPath, 'utf-8')
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter(data => data !== null);

      stats.totalVerifications = feedbackData.length;
      stats.successfulVerifications = feedbackData.filter(d => d.userFeedback === 'correct').length;
      stats.failedVerifications = feedbackData.filter(d => d.userFeedback === 'incorrect').length;
      stats.accuracyRate = stats.totalVerifications > 0 
        ? (stats.successfulVerifications / stats.totalVerifications) * 100 
        : 0;

      // Category breakdown
      feedbackData.forEach(data => {
        const category = data.actualCategory;
        stats.categoryBreakdown[category] = (stats.categoryBreakdown[category] || 0) + 1;
      });
    }

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error getting ML stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get ML statistics' 
    });
  }
});
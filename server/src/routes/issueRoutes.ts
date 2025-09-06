import express from 'express';
import { body } from 'express-validator';
import {
  reportIssue,
  getIssues,
  getIssue,
  updateIssueStatus,
  upvoteIssue,
  validateIssue,
  getIssueStats
} from '../controllers/issueController';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { uploadMultiple } from '../middleware/upload';

const router = express.Router();

// Validation rules
const reportValidation = [
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('category').isIn(['waste', 'road', 'water', 'electricity', 'safety', 'other']).withMessage('Invalid category'),
  body('location.latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('location.longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude')
];

const statusUpdateValidation = [
  body('status').isIn(['reported', 'in-progress', 'resolved']).withMessage('Invalid status')
];

// Routes
router.post('/report', uploadMultiple, reportValidation, optionalAuth, reportIssue);
router.get('/stats', getIssueStats);
router.get('/', getIssues);
router.get('/:id', getIssue);
router.patch('/:id/status', authenticate, authorize('authority', 'admin'), statusUpdateValidation, updateIssueStatus);
router.post('/:id/upvote', authenticate, upvoteIssue);
router.post('/:id/validate', authenticate, validateIssue);

export default router;
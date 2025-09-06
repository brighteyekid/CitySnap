import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getDashboardAnalytics,
  getAuthorityPerformance,
  getIssueHotspots,
  exportAnalytics
} from '../controllers/analyticsController';

const router = express.Router();

// All analytics routes require authentication and authority/admin role
router.use(authenticate);
router.use(authorize('authority', 'admin'));

// Routes
router.get('/dashboard', getDashboardAnalytics);
router.get('/authority-performance', getAuthorityPerformance);
router.get('/hotspots', getIssueHotspots);
router.get('/export', exportAnalytics);

export default router;
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import analyticsService from '../services/analyticsService';

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private (Authority/Admin)
export const getDashboardAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { timeframe = 'month' } = req.query;
  
  const analytics = await analyticsService.getDashboardAnalytics(timeframe as any);
  
  res.json({
    success: true,
    data: analytics
  });
});

// @desc    Get authority performance metrics
// @route   GET /api/analytics/authority-performance
// @access  Private (Authority/Admin)
export const getAuthorityPerformance = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { timeframe = 'month' } = req.query;
  
  const performance = await analyticsService.getAuthorityPerformance(timeframe as any);
  
  res.json({
    success: true,
    data: performance
  });
});

// @desc    Get issue hotspots
// @route   GET /api/analytics/hotspots
// @access  Private (Authority/Admin)
export const getIssueHotspots = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { radius = 500 } = req.query;
  
  const hotspots = await analyticsService.getIssueHotspots(parseInt(radius as string));
  
  res.json({
    success: true,
    data: hotspots
  });
});

// @desc    Export analytics data
// @route   GET /api/analytics/export
// @access  Private (Authority/Admin)
export const exportAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { timeframe = 'month', format = 'csv' } = req.query;
  
  if (format === 'csv') {
    const csvData = await analyticsService.exportAnalytics(timeframe as string);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=analytics-${timeframe}.csv`);
    res.send(csvData);
  } else {
    const analytics = await analyticsService.getDashboardAnalytics(timeframe as any);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=analytics-${timeframe}.json`);
    res.json(analytics);
  }
});
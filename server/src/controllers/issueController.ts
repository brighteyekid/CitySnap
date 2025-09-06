import { Response } from 'express';
import { validationResult } from 'express-validator';
import Issue, { IIssue } from '../models/Issue';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { processImages } from '../utils/imageUtils';
import { clusterIssue, calculatePriority, getClusteredIssues } from '../utils/clusteringUtils';

// @desc    Report a new issue
// @route   POST /api/issues/report
// @access  Public (with rate limiting)
export const reportIssue = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  const { title, description, category, location, address, isAreaReport } = req.body;
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    res.status(400).json({ success: false, error: 'At least one image is required' });
    return;
  }

  try {
    // Process images
    const processedImages = await processImages(files);
    
    if (processedImages.length === 0) {
      res.status(400).json({ success: false, error: 'No valid images could be processed' });
      return;
    }

    // Create anonymous user if not authenticated
    let reporterId;
    if (req.user) {
      reporterId = req.user._id;
      // Update user stats
      req.user.gamification.reportsSubmitted += 1;
      req.user.gamification.points += 10; // Base points for reporting
      await req.user.save();
    } else {
      // Create anonymous user
      const anonymousUser = new User({
        username: `anonymous_${Date.now()}`,
        email: `anonymous_${Date.now()}@temp.com`,
        password: 'temp123456',
        role: 'citizen'
      });
      await anonymousUser.save();
      reporterId = anonymousUser._id;
    }

    // Create new issue
    const newIssue = new Issue({
      title,
      description,
      category,
      location: {
        type: 'Point',
        coordinates: [parseFloat(location.longitude), parseFloat(location.latitude)]
      },
      address,
      images: processedImages.map(img => img.url),
      imageHashes: processedImages.map(img => img.hash),
      reportedBy: reporterId,
      isAreaReport: isAreaReport || false,
      priority: 1 // Will be recalculated
    });

    // Calculate initial priority
    newIssue.priority = calculatePriority(newIssue);

    // Save the issue
    await newIssue.save();

    // Try to cluster with existing issues
    const clusteredIssue = await clusterIssue(newIssue);

    // Populate the response
    const populatedIssue = await Issue.findById(clusteredIssue._id)
      .populate('reportedBy', 'username profile.firstName profile.lastName')
      .populate('upvotes', 'username')
      .populate('validations', 'username');

    res.status(201).json({
      success: true,
      data: populatedIssue,
      message: clusteredIssue._id.toString() !== newIssue._id.toString() 
        ? 'Issue reported and clustered with existing similar issue'
        : 'Issue reported successfully'
    });
  } catch (error) {
    console.error('Error reporting issue:', error);
    res.status(500).json({ success: false, error: 'Failed to report issue' });
  }
});

// @desc    Get all issues with filtering and pagination
// @route   GET /api/issues
// @access  Public
export const getIssues = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    page = 1,
    limit = 20,
    status,
    category,
    priority,
    lat,
    lng,
    radius = 5000, // 5km default
    sortBy = 'reportedAt',
    sortOrder = 'desc'
  } = req.query;

  const query: any = {};

  // Filter by status
  if (status) {
    query.status = status;
  }

  // Filter by category
  if (category) {
    query.category = category;
  }

  // Filter by priority
  if (priority) {
    query.priority = { $gte: parseInt(priority as string) };
  }

  // Geospatial filtering
  if (lat && lng) {
    query.location = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng as string), parseFloat(lat as string)]
        },
        $maxDistance: parseInt(radius as string)
      }
    };
  }

  const sortOptions: any = {};
  sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

  const issues = await Issue.find(query)
    .populate('reportedBy', 'username profile.firstName profile.lastName')
    .populate('assignedTo', 'username profile.firstName profile.lastName')
    .sort(sortOptions)
    .limit(parseInt(limit as string))
    .skip((parseInt(page as string) - 1) * parseInt(limit as string));

  const total = await Issue.countDocuments(query);

  res.json({
    success: true,
    data: issues,
    pagination: {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      total,
      pages: Math.ceil(total / parseInt(limit as string))
    }
  });
});

// @desc    Get single issue with clustered issues
// @route   GET /api/issues/:id
// @access  Public
export const getIssue = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const issue = await Issue.findById(req.params.id)
    .populate('reportedBy', 'username profile.firstName profile.lastName')
    .populate('assignedTo', 'username profile.firstName profile.lastName')
    .populate('upvotes', 'username')
    .populate('validations', 'username');

  if (!issue) {
    res.status(404).json({ success: false, error: 'Issue not found' });
    return;
  }

  // Get clustered issues
  const clusteredIssues = await getClusteredIssues(req.params.id);

  res.json({
    success: true,
    data: {
      ...issue.toObject(),
      clusteredIssues: clusteredIssues.filter(ci => ci._id.toString() !== issue._id.toString())
    }
  });
});

// @desc    Update issue status
// @route   PATCH /api/issues/:id/status
// @access  Private (Authority/Admin)
export const updateIssueStatus = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, estimatedResolutionTime, assignedTo } = req.body;
  
  const issue = await Issue.findById(req.params.id);
  
  if (!issue) {
    res.status(404).json({ success: false, error: 'Issue not found' });
    return;
  }

  // Update status
  issue.status = status;
  
  if (status === 'resolved') {
    issue.resolvedAt = new Date();
    
    // Award points to the authority who resolved it
    if (req.user && req.user.role === 'authority') {
      req.user.gamification.issuesResolved += 1;
      req.user.gamification.points += 20;
      await req.user.save();
    }
  }

  if (estimatedResolutionTime) {
    issue.estimatedResolutionTime = new Date(estimatedResolutionTime);
  }

  if (assignedTo) {
    issue.assignedTo = assignedTo;
  }

  await issue.save();

  // Update clustered issues with same status
  for (const clusteredId of issue.clusteredWith) {
    await Issue.findByIdAndUpdate(clusteredId, { 
      status,
      resolvedAt: status === 'resolved' ? new Date() : undefined,
      estimatedResolutionTime: estimatedResolutionTime ? new Date(estimatedResolutionTime) : undefined
    });
  }

  const updatedIssue = await Issue.findById(req.params.id)
    .populate('reportedBy', 'username profile.firstName profile.lastName')
    .populate('assignedTo', 'username profile.firstName profile.lastName');

  res.json({
    success: true,
    data: updatedIssue
  });
});

// @desc    Upvote an issue
// @route   POST /api/issues/:id/upvote
// @access  Private
export const upvoteIssue = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const issue = await Issue.findById(req.params.id);
  
  if (!issue) {
    res.status(404).json({ success: false, error: 'Issue not found' });
    return;
  }

  const userId = req.user!._id;
  
  // Check if user already upvoted
  if (issue.upvotes.includes(userId)) {
    // Remove upvote
    issue.upvotes = issue.upvotes.filter(id => id.toString() !== userId.toString());
  } else {
    // Add upvote
    issue.upvotes.push(userId);
    
    // Award points to the user who upvoted
    req.user!.gamification.validationsGiven += 1;
    req.user!.gamification.points += 2;
    await req.user!.save();
  }

  // Recalculate priority
  issue.priority = calculatePriority(issue);
  await issue.save();

  res.json({
    success: true,
    data: {
      upvotes: issue.upvotes.length,
      userUpvoted: issue.upvotes.includes(userId)
    }
  });
});

// @desc    Validate an issue
// @route   POST /api/issues/:id/validate
// @access  Private
export const validateIssue = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const issue = await Issue.findById(req.params.id);
  
  if (!issue) {
    res.status(404).json({ success: false, error: 'Issue not found' });
    return;
  }

  const userId = req.user!._id;
  
  // Check if user already validated
  if (issue.validations.includes(userId)) {
    res.status(400).json({ success: false, error: 'You have already validated this issue' });
    return;
  }

  // Add validation
  issue.validations.push(userId);
  
  // Award points
  req.user!.gamification.validationsGiven += 1;
  req.user!.gamification.points += 5;
  await req.user!.save();

  // Recalculate priority
  issue.priority = calculatePriority(issue);
  await issue.save();

  res.json({
    success: true,
    data: {
      validations: issue.validations.length
    }
  });
});

// @desc    Get issues statistics
// @route   GET /api/issues/stats
// @access  Public
export const getIssueStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const stats = await Issue.aggregate([
    {
      $group: {
        _id: null,
        totalIssues: { $sum: 1 },
        reportedIssues: { $sum: { $cond: [{ $eq: ['$status', 'reported'] }, 1, 0] } },
        inProgressIssues: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
        resolvedIssues: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } }
      }
    }
  ]);

  const categoryStats = await Issue.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      overview: stats[0] || {
        totalIssues: 0,
        reportedIssues: 0,
        inProgressIssues: 0,
        resolvedIssues: 0
      },
      byCategory: categoryStats
    }
  });
});
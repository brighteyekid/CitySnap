import { getDistance } from 'geolib';
import Issue, { IIssue } from '../models/Issue';
import { areImagesSimilar } from './imageUtils';

export interface ClusteringConfig {
  radiusMeters: number;
  imageThreshold: number;
  categoryWeight: number;
  timeWindowHours: number;
}

const DEFAULT_CONFIG: ClusteringConfig = {
  radiusMeters: 50, // 50 meters radius
  imageThreshold: 15, // Hamming distance threshold for image similarity
  categoryWeight: 0.8, // Weight for category matching
  timeWindowHours: 168 // 7 days
};

/**
 * Calculate similarity score between two issues
 */
export const calculateSimilarityScore = (
  issue1: IIssue,
  issue2: IIssue,
  config: ClusteringConfig = DEFAULT_CONFIG
): number => {
  let score = 0;

  // Geographic proximity (0-1)
  const distance = getDistance(
    { latitude: issue1.location.coordinates[1], longitude: issue1.location.coordinates[0] },
    { latitude: issue2.location.coordinates[1], longitude: issue2.location.coordinates[0] }
  );
  
  const geoScore = Math.max(0, 1 - (distance / config.radiusMeters));
  score += geoScore * 0.4;

  // Category matching (0-1)
  const categoryScore = issue1.category === issue2.category ? 1 : 0;
  score += categoryScore * config.categoryWeight * 0.3;

  // Image similarity (0-1)
  let imageScore = 0;
  if (issue1.imageHashes.length > 0 && issue2.imageHashes.length > 0) {
    let maxImageSimilarity = 0;
    for (const hash1 of issue1.imageHashes) {
      for (const hash2 of issue2.imageHashes) {
        if (areImagesSimilar(hash1, hash2, config.imageThreshold)) {
          maxImageSimilarity = Math.max(maxImageSimilarity, 0.8);
        }
      }
    }
    imageScore = maxImageSimilarity;
  }
  score += imageScore * 0.2;

  // Time proximity (0-1)
  const timeDiff = Math.abs(issue1.reportedAt.getTime() - issue2.reportedAt.getTime());
  const timeWindowMs = config.timeWindowHours * 60 * 60 * 1000;
  const timeScore = Math.max(0, 1 - (timeDiff / timeWindowMs));
  score += timeScore * 0.1;

  return score;
};

/**
 * Find potential duplicates for a new issue
 */
export const findPotentialDuplicates = async (
  newIssue: IIssue,
  config: ClusteringConfig = DEFAULT_CONFIG
): Promise<IIssue[]> => {
  const timeWindow = new Date(Date.now() - config.timeWindowHours * 60 * 60 * 1000);
  
  // Find nearby issues within the time window
  const nearbyIssues = await Issue.find({
    _id: { $ne: newIssue._id },
    category: newIssue.category,
    reportedAt: { $gte: timeWindow },
    status: { $ne: 'resolved' },
    location: {
      $near: {
        $geometry: newIssue.location,
        $maxDistance: config.radiusMeters
      }
    }
  }).populate('reportedBy', 'username');

  // Calculate similarity scores and filter
  const duplicates: IIssue[] = [];
  for (const issue of nearbyIssues) {
    const similarity = calculateSimilarityScore(newIssue, issue, config);
    if (similarity > 0.6) { // Threshold for considering as duplicate
      duplicates.push(issue);
    }
  }

  return duplicates;
};

/**
 * Cluster a new issue with existing ones
 */
export const clusterIssue = async (
  newIssue: IIssue,
  config: ClusteringConfig = DEFAULT_CONFIG
): Promise<IIssue> => {
  const duplicates = await findPotentialDuplicates(newIssue, config);
  
  if (duplicates.length === 0) {
    return newIssue;
  }

  // Find the best match (highest similarity)
  let bestMatch: IIssue | null = null;
  let bestScore = 0;

  for (const duplicate of duplicates) {
    const score = calculateSimilarityScore(newIssue, duplicate, config);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = duplicate;
    }
  }

  if (bestMatch && bestScore > 0.7) {
    // Cluster with the best match
    await clusterIssues(newIssue, bestMatch);
    return bestMatch;
  }

  return newIssue;
};

/**
 * Cluster two issues together
 */
export const clusterIssues = async (issue1: IIssue, issue2: IIssue): Promise<void> => {
  // Add each issue to the other's cluster
  if (!issue1.clusteredWith.includes(issue2._id)) {
    issue1.clusteredWith.push(issue2._id);
  }
  if (!issue2.clusteredWith.includes(issue1._id)) {
    issue2.clusteredWith.push(issue1._id);
  }

  // Merge upvotes and validations (avoid duplicates)
  const mergedUpvotes = [...new Set([...issue1.upvotes, ...issue2.upvotes])];
  const mergedValidations = [...new Set([...issue1.validations, ...issue2.validations])];

  issue1.upvotes = mergedUpvotes;
  issue2.upvotes = mergedUpvotes;
  issue1.validations = mergedValidations;
  issue2.validations = mergedValidations;

  // Update priority based on combined metrics
  const combinedPriority = calculatePriority(issue1, issue2);
  issue1.priority = combinedPriority;
  issue2.priority = combinedPriority;

  await issue1.save();
  await issue2.save();
};

/**
 * Calculate priority score for an issue
 */
export const calculatePriority = (issue: IIssue, clusteredIssue?: IIssue): number => {
  let priority = 1;

  // Base priority by category
  const categoryPriorities = {
    safety: 10,
    water: 8,
    electricity: 7,
    road: 6,
    waste: 4,
    other: 3
  };
  priority += categoryPriorities[issue.category] || 3;

  // Unique reporters (avoid counting same reporter multiple times)
  const uniqueReporters = new Set([issue.reportedBy]);
  if (clusteredIssue) {
    uniqueReporters.add(clusteredIssue.reportedBy);
  }
  priority += uniqueReporters.size * 2;

  // Validations from community
  priority += issue.validations.length * 1.5;

  // Time factor (older issues get higher priority)
  const daysSinceReport = (Date.now() - issue.reportedAt.getTime()) / (1000 * 60 * 60 * 24);
  priority += Math.min(daysSinceReport * 0.5, 5);

  // Area reports get higher priority
  if (issue.isAreaReport) {
    priority += 3;
  }

  return Math.min(Math.round(priority), 10);
};

/**
 * Get clustered issues for display
 */
export const getClusteredIssues = async (issueId: string): Promise<IIssue[]> => {
  const issue = await Issue.findById(issueId).populate('clusteredWith');
  if (!issue) return [];

  const clustered = [issue];
  for (const clusteredId of issue.clusteredWith) {
    const clusteredIssue = await Issue.findById(clusteredId);
    if (clusteredIssue) {
      clustered.push(clusteredIssue);
    }
  }

  return clustered;
};

/**
 * Recalculate priorities for all active issues
 */
export const recalculatePriorities = async (): Promise<void> => {
  const activeIssues = await Issue.find({ status: { $ne: 'resolved' } });
  
  for (const issue of activeIssues) {
    const newPriority = calculatePriority(issue);
    if (issue.priority !== newPriority) {
      issue.priority = newPriority;
      await issue.save();
    }
  }
};
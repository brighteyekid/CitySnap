import Issue from '../models/Issue';
import User from '../models/User';

interface AnalyticsData {
  totalIssues: number;
  resolvedIssues: number;
  averageResolutionTime: number;
  issuesByCategory: any[];
  issuesByStatus: any[];
  userEngagement: any;
  geographicDistribution: any[];
  trendData: any[];
}

class AnalyticsService {
  /**
   * Get comprehensive analytics dashboard data
   */
  async getDashboardAnalytics(timeframe: 'week' | 'month' | 'year' = 'month'): Promise<AnalyticsData> {
    const dateFilter = this.getDateFilter(timeframe);

    const [
      totalIssues,
      resolvedIssues,
      averageResolutionTime,
      issuesByCategory,
      issuesByStatus,
      userEngagement,
      geographicDistribution,
      trendData
    ] = await Promise.all([
      this.getTotalIssues(dateFilter),
      this.getResolvedIssues(dateFilter),
      this.getAverageResolutionTime(dateFilter),
      this.getIssuesByCategory(dateFilter),
      this.getIssuesByStatus(dateFilter),
      this.getUserEngagement(dateFilter),
      this.getGeographicDistribution(dateFilter),
      this.getTrendData(timeframe)
    ]);

    return {
      totalIssues,
      resolvedIssues,
      averageResolutionTime,
      issuesByCategory,
      issuesByStatus,
      userEngagement,
      geographicDistribution,
      trendData
    };
  }

  /**
   * Get date filter based on timeframe
   */
  private getDateFilter(timeframe: string): any {
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return { reportedAt: { $gte: startDate } };
  }

  /**
   * Get total issues count
   */
  private async getTotalIssues(dateFilter: any): Promise<number> {
    return Issue.countDocuments(dateFilter);
  }

  /**
   * Get resolved issues count
   */
  private async getResolvedIssues(dateFilter: any): Promise<number> {
    return Issue.countDocuments({ ...dateFilter, status: 'resolved' });
  }

  /**
   * Calculate average resolution time in hours
   */
  private async getAverageResolutionTime(dateFilter: any): Promise<number> {
    const resolvedIssues = await Issue.find({
      ...dateFilter,
      status: 'resolved',
      resolvedAt: { $exists: true }
    }).select('reportedAt resolvedAt');

    if (resolvedIssues.length === 0) return 0;

    const totalTime = resolvedIssues.reduce((sum, issue) => {
      const resolutionTime = issue.resolvedAt!.getTime() - issue.reportedAt.getTime();
      return sum + resolutionTime;
    }, 0);

    return Math.round(totalTime / resolvedIssues.length / (1000 * 60 * 60)); // Convert to hours
  }

  /**
   * Get issues grouped by category
   */
  private async getIssuesByCategory(dateFilter: any): Promise<any[]> {
    return Issue.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          reported: { $sum: { $cond: [{ $eq: ['$status', 'reported'] }, 1, 0] } }
        }
      },
      { $sort: { count: -1 } }
    ]);
  }

  /**
   * Get issues grouped by status
   */
  private async getIssuesByStatus(dateFilter: any): Promise<any[]> {
    return Issue.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
  }

  /**
   * Get user engagement metrics
   */
  private async getUserEngagement(dateFilter: any): Promise<any> {
    const [totalUsers, activeUsers, topReporters] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
      User.find()
        .sort({ 'gamification.reportsSubmitted': -1 })
        .limit(5)
        .select('username gamification.reportsSubmitted gamification.points')
    ]);

    return {
      totalUsers,
      activeUsers,
      topReporters
    };
  }

  /**
   * Get geographic distribution of issues
   */
  private async getGeographicDistribution(dateFilter: any): Promise<any[]> {
    // This is a simplified version - in production, you might want to use
    // more sophisticated geographic clustering
    return Issue.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            lat: { $round: [{ $arrayElemAt: ['$location.coordinates', 1] }, 2] },
            lng: { $round: [{ $arrayElemAt: ['$location.coordinates', 0] }, 2] }
          },
          count: { $sum: 1 },
          categories: { $addToSet: '$category' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 50 }
    ]);
  }

  /**
   * Get trend data over time
   */
  private async getTrendData(timeframe: string): Promise<any[]> {
    let groupBy: any;
    let dateFormat: string;

    switch (timeframe) {
      case 'week':
        groupBy = {
          year: { $year: '$reportedAt' },
          month: { $month: '$reportedAt' },
          day: { $dayOfMonth: '$reportedAt' }
        };
        dateFormat = '%Y-%m-%d';
        break;
      case 'month':
        groupBy = {
          year: { $year: '$reportedAt' },
          month: { $month: '$reportedAt' },
          day: { $dayOfMonth: '$reportedAt' }
        };
        dateFormat = '%Y-%m-%d';
        break;
      case 'year':
        groupBy = {
          year: { $year: '$reportedAt' },
          month: { $month: '$reportedAt' }
        };
        dateFormat = '%Y-%m';
        break;
      default:
        groupBy = {
          year: { $year: '$reportedAt' },
          month: { $month: '$reportedAt' },
          day: { $dayOfMonth: '$reportedAt' }
        };
        dateFormat = '%Y-%m-%d';
    }

    const dateFilter = this.getDateFilter(timeframe);

    return Issue.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: groupBy,
          reported: { $sum: { $cond: [{ $eq: ['$status', 'reported'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          total: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
  }

  /**
   * Get performance metrics for authorities
   */
  async getAuthorityPerformance(timeframe: 'week' | 'month' | 'year' = 'month'): Promise<any[]> {
    const dateFilter = this.getDateFilter(timeframe);

    return Issue.aggregate([
      {
        $match: {
          ...dateFilter,
          assignedTo: { $exists: true },
          status: 'resolved'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'assignedTo',
          foreignField: '_id',
          as: 'authority'
        }
      },
      { $unwind: '$authority' },
      {
        $group: {
          _id: '$assignedTo',
          authorityName: { $first: '$authority.username' },
          resolvedCount: { $sum: 1 },
          averageResolutionTime: {
            $avg: {
              $divide: [
                { $subtract: ['$resolvedAt', '$reportedAt'] },
                1000 * 60 * 60 // Convert to hours
              ]
            }
          },
          categories: { $addToSet: '$category' }
        }
      },
      { $sort: { resolvedCount: -1 } }
    ]);
  }

  /**
   * Get issue hotspots (areas with high issue density)
   */
  async getIssueHotspots(radius: number = 500): Promise<any[]> {
    // This is a simplified hotspot detection
    // In production, you might use more sophisticated clustering algorithms
    return Issue.aggregate([
      {
        $group: {
          _id: {
            lat: { $round: [{ $arrayElemAt: ['$location.coordinates', 1] }, 3] },
            lng: { $round: [{ $arrayElemAt: ['$location.coordinates', 0] }, 3] }
          },
          count: { $sum: 1 },
          unresolvedCount: { $sum: { $cond: [{ $ne: ['$status', 'resolved'] }, 1, 0] } },
          categories: { $addToSet: '$category' },
          avgPriority: { $avg: '$priority' }
        }
      },
      { $match: { count: { $gte: 3 } } }, // At least 3 issues to be considered a hotspot
      { $sort: { unresolvedCount: -1, count: -1 } },
      { $limit: 20 }
    ]);
  }

  /**
   * Export analytics data to CSV format
   */
  async exportAnalytics(timeframe: string): Promise<string> {
    const analytics = await this.getDashboardAnalytics(timeframe as any);
    
    // Convert to CSV format
    let csv = 'Metric,Value\n';
    csv += `Total Issues,${analytics.totalIssues}\n`;
    csv += `Resolved Issues,${analytics.resolvedIssues}\n`;
    csv += `Average Resolution Time (hours),${analytics.averageResolutionTime}\n`;
    
    csv += '\nCategory,Count,Resolved,In Progress,Reported\n';
    analytics.issuesByCategory.forEach(cat => {
      csv += `${cat._id},${cat.count},${cat.resolved},${cat.inProgress},${cat.reported}\n`;
    });

    return csv;
  }
}

export default new AnalyticsService();
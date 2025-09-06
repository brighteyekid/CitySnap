import User, { IUser } from '../models/User';
import notificationService from './notificationService';

interface BadgeConfig {
  name: string;
  description: string;
  condition: (user: IUser) => boolean;
  points: number;
}

class GamificationService {
  private badges: BadgeConfig[] = [
    {
      name: 'First Reporter',
      description: 'Report your first civic issue',
      condition: (user) => user.gamification.reportsSubmitted >= 1,
      points: 10
    },
    {
      name: 'Community Helper',
      description: 'Validate 10 issues from other citizens',
      condition: (user) => user.gamification.validationsGiven >= 10,
      points: 25
    },
    {
      name: 'Civic Champion',
      description: 'Report 25 civic issues',
      condition: (user) => user.gamification.reportsSubmitted >= 25,
      points: 50
    },
    {
      name: 'Problem Solver',
      description: 'Resolve 10 issues (for authorities)',
      condition: (user) => user.gamification.issuesResolved >= 10,
      points: 100
    },
    {
      name: 'Super Validator',
      description: 'Validate 50 issues from other citizens',
      condition: (user) => user.gamification.validationsGiven >= 50,
      points: 75
    },
    {
      name: 'Dedicated Reporter',
      description: 'Report 100 civic issues',
      condition: (user) => user.gamification.reportsSubmitted >= 100,
      points: 150
    },
    {
      name: 'Community Leader',
      description: 'Reach 1000 points',
      condition: (user) => user.gamification.points >= 1000,
      points: 200
    }
  ];

  /**
   * Award points to user
   */
  async awardPoints(userId: string, points: number, reason: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      const oldLevel = user.gamification.level;
      user.gamification.points += points;
      
      // Recalculate level
      const newLevel = this.calculateLevel(user.gamification.points);
      user.gamification.level = newLevel;

      await user.save();

      // Check for level up
      if (newLevel > oldLevel) {
        await notificationService.notifyLevelUp(userId, newLevel);
      }

      // Check for new badges
      await this.checkAndAwardBadges(user);

      console.log(`Awarded ${points} points to user ${userId} for: ${reason}`);
    } catch (error) {
      console.error('Error awarding points:', error);
    }
  }

  /**
   * Calculate user level based on points
   */
  private calculateLevel(points: number): number {
    return Math.floor(points / 100) + 1;
  }

  /**
   * Check and award badges to user
   */
  async checkAndAwardBadges(user: IUser): Promise<void> {
    const newBadges: string[] = [];

    for (const badge of this.badges) {
      if (!user.gamification.badges.includes(badge.name) && badge.condition(user)) {
        user.gamification.badges.push(badge.name);
        user.gamification.points += badge.points;
        newBadges.push(badge.name);
      }
    }

    if (newBadges.length > 0) {
      await user.save();
      
      // Send notifications for new badges
      for (const badge of newBadges) {
        await notificationService.notifyBadgeAwarded(user._id.toString(), badge);
      }
    }
  }

  /**
   * Get user's rank among all users
   */
  async getUserRank(userId: string): Promise<number> {
    const user = await User.findById(userId);
    if (!user) return 0;

    const usersWithHigherPoints = await User.countDocuments({
      'gamification.points': { $gt: user.gamification.points }
    });

    return usersWithHigherPoints + 1;
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(limit: number = 10, timeframe?: 'week' | 'month'): Promise<any[]> {
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
      .limit(limit);

    return users.map((user, index) => ({
      ...user.toObject(),
      rank: index + 1
    }));
  }

  /**
   * Award points for specific actions
   */
  async awardActionPoints(userId: string, action: string): Promise<void> {
    const pointsMap: { [key: string]: number } = {
      'report_issue': 10,
      'validate_issue': 5,
      'upvote_issue': 2,
      'resolve_issue': 20,
      'first_report': 15,
      'area_report': 15
    };

    const points = pointsMap[action] || 0;
    if (points > 0) {
      await this.awardPoints(userId, points, action.replace('_', ' '));
    }
  }

  /**
   * Get available badges
   */
  getBadges(): BadgeConfig[] {
    return this.badges;
  }

  /**
   * Get user's progress towards next badge
   */
  async getBadgeProgress(userId: string): Promise<any[]> {
    const user = await User.findById(userId);
    if (!user) return [];

    return this.badges.map(badge => ({
      name: badge.name,
      description: badge.description,
      earned: user.gamification.badges.includes(badge.name),
      progress: this.calculateBadgeProgress(user, badge)
    }));
  }

  /**
   * Calculate progress towards a specific badge
   */
  private calculateBadgeProgress(user: IUser, badge: BadgeConfig): number {
    // This is a simplified progress calculation
    // In a real implementation, you'd have more sophisticated progress tracking
    if (user.gamification.badges.includes(badge.name)) {
      return 100;
    }

    // Simple progress calculation based on badge requirements
    if (badge.name === 'Community Helper') {
      return Math.min((user.gamification.validationsGiven / 10) * 100, 100);
    }
    if (badge.name === 'Civic Champion') {
      return Math.min((user.gamification.reportsSubmitted / 25) * 100, 100);
    }
    if (badge.name === 'Problem Solver') {
      return Math.min((user.gamification.issuesResolved / 10) * 100, 100);
    }

    return 0;
  }

  /**
   * Reset user's gamification data (admin function)
   */
  async resetUserGamification(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      'gamification.points': 0,
      'gamification.level': 1,
      'gamification.badges': [],
      'gamification.reportsSubmitted': 0,
      'gamification.validationsGiven': 0,
      'gamification.issuesResolved': 0
    });
  }
}

export default new GamificationService();
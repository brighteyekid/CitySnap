import cron from 'node-cron';
import { recalculatePriorities } from '../utils/clusteringUtils';
import gamificationService from './gamificationService';
import User from '../models/User';
import Issue from '../models/Issue';

class CronService {
  /**
   * Initialize all cron jobs
   */
  init(): void {
    console.log('Initializing cron jobs...');

    // Recalculate issue priorities every hour
    cron.schedule('0 * * * *', async () => {
      console.log('Running priority recalculation...');
      try {
        await recalculatePriorities();
        console.log('Priority recalculation completed');
      } catch (error) {
        console.error('Error in priority recalculation:', error);
      }
    });

    // Check for badge awards every 6 hours
    cron.schedule('0 */6 * * *', async () => {
      console.log('Running badge check...');
      try {
        await this.checkAllUserBadges();
        console.log('Badge check completed');
      } catch (error) {
        console.error('Error in badge check:', error);
      }
    });

    // Clean up old anonymous users daily at 2 AM
    cron.schedule('0 2 * * *', async () => {
      console.log('Cleaning up old anonymous users...');
      try {
        await this.cleanupAnonymousUsers();
        console.log('Anonymous user cleanup completed');
      } catch (error) {
        console.error('Error in anonymous user cleanup:', error);
      }
    });

    // Generate daily analytics report at 3 AM
    cron.schedule('0 3 * * *', async () => {
      console.log('Generating daily analytics...');
      try {
        await this.generateDailyAnalytics();
        console.log('Daily analytics generation completed');
      } catch (error) {
        console.error('Error in daily analytics generation:', error);
      }
    });

    // Send weekly summary emails on Sundays at 9 AM
    cron.schedule('0 9 * * 0', async () => {
      console.log('Sending weekly summaries...');
      try {
        await this.sendWeeklySummaries();
        console.log('Weekly summaries sent');
      } catch (error) {
        console.error('Error sending weekly summaries:', error);
      }
    });

    console.log('All cron jobs initialized');
  }

  /**
   * Check badges for all users
   */
  private async checkAllUserBadges(): Promise<void> {
    const users = await User.find({ isActive: true });
    
    for (const user of users) {
      await gamificationService.checkAndAwardBadges(user);
    }
  }

  /**
   * Clean up old anonymous users (older than 30 days with no activity)
   */
  private async cleanupAnonymousUsers(): Promise<void> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Find anonymous users older than 30 days
    const anonymousUsers = await User.find({
      username: { $regex: /^anonymous_/ },
      createdAt: { $lt: thirtyDaysAgo },
      lastLogin: { $exists: false }
    });

    for (const user of anonymousUsers) {
      // Check if user has any issues
      const hasIssues = await Issue.exists({ reportedBy: user._id });
      
      if (!hasIssues) {
        await User.findByIdAndDelete(user._id);
      }
    }

    console.log(`Cleaned up ${anonymousUsers.length} anonymous users`);
  }

  /**
   * Generate daily analytics and store them
   */
  private async generateDailyAnalytics(): Promise<void> {
    // This would typically store analytics data in a separate collection
    // for historical tracking and reporting
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dailyStats = await Issue.aggregate([
      {
        $match: {
          reportedAt: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: null,
          totalReported: { $sum: 1 },
          byCategory: {
            $push: {
              category: '$category',
              status: '$status'
            }
          }
        }
      }
    ]);

    // In a real implementation, you would store this data
    console.log('Daily stats generated:', dailyStats);
  }

  /**
   * Send weekly summary emails to active users
   */
  private async sendWeeklySummaries(): Promise<void> {
    // This would integrate with an email service
    // For now, just log the action
    
    const activeUsers = await User.find({
      isActive: true,
      lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    console.log(`Would send weekly summaries to ${activeUsers.length} active users`);
    
    // In a real implementation:
    // - Generate personalized weekly reports
    // - Send emails with issue updates in user's area
    // - Include gamification progress
    // - Highlight community achievements
  }

  /**
   * Stop all cron jobs (useful for testing or shutdown)
   */
  stopAll(): void {
    cron.getTasks().forEach(task => task.stop());
    console.log('All cron jobs stopped');
  }
}

export default new CronService();
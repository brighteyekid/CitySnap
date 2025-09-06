import { NotificationPayload } from '../types';
import User from '../models/User';

class NotificationService {
  /**
   * Send notification to user
   */
  async sendNotification(payload: NotificationPayload): Promise<void> {
    try {
      // In a real implementation, this would integrate with:
      // - Push notification service (Firebase, OneSignal, etc.)
      // - WebSocket for real-time notifications
      // - Email service for important notifications
      
      console.log(`Notification sent to user ${payload.userId}:`, payload);
      
      // For now, just log the notification
      // In production, you would implement actual notification delivery
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  /**
   * Send notification when issue status changes
   */
  async notifyIssueStatusChange(issueId: string, newStatus: string, reporterId: string): Promise<void> {
    const statusMessages = {
      'in-progress': 'Your reported issue is now being addressed',
      'resolved': 'Your reported issue has been resolved'
    };

    if (statusMessages[newStatus as keyof typeof statusMessages]) {
      await this.sendNotification({
        userId: reporterId,
        type: 'issue_update',
        title: 'Issue Status Update',
        message: statusMessages[newStatus as keyof typeof statusMessages],
        data: { issueId, newStatus }
      });
    }
  }

  /**
   * Send notification when user earns a badge
   */
  async notifyBadgeAwarded(userId: string, badge: string): Promise<void> {
    await this.sendNotification({
      userId,
      type: 'badge_awarded',
      title: 'Badge Earned!',
      message: `Congratulations! You've earned the ${badge} badge`,
      data: { badge }
    });
  }

  /**
   * Send notification when user levels up
   */
  async notifyLevelUp(userId: string, newLevel: number): Promise<void> {
    await this.sendNotification({
      userId,
      type: 'level_up',
      title: 'Level Up!',
      message: `Congratulations! You've reached level ${newLevel}`,
      data: { level: newLevel }
    });
  }

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(notifications: NotificationPayload[]): Promise<void> {
    const promises = notifications.map(notification => this.sendNotification(notification));
    await Promise.allSettled(promises);
  }

  /**
   * Send notification to nearby users about new issues
   */
  async notifyNearbyUsers(issueLocation: [number, number], radius: number = 1000): Promise<void> {
    try {
      const nearbyUsers = await User.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: issueLocation
            },
            $maxDistance: radius
          }
        },
        isActive: true
      }).select('_id');

      const notifications = nearbyUsers.map(user => ({
        userId: user._id.toString(),
        type: 'issue_update' as const,
        title: 'New Issue Nearby',
        message: 'A new civic issue has been reported in your area',
        data: { location: issueLocation }
      }));

      await this.sendBulkNotifications(notifications);
    } catch (error) {
      console.error('Error notifying nearby users:', error);
    }
  }
}

export default new NotificationService();
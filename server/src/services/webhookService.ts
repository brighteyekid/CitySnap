import axios from 'axios';
import { WebhookPayload } from '../types';

interface WebhookConfig {
  url: string;
  secret?: string;
  events: string[];
  active: boolean;
}

class WebhookService {
  private webhooks: WebhookConfig[] = [];

  /**
   * Register a webhook
   */
  registerWebhook(config: WebhookConfig): void {
    this.webhooks.push(config);
    console.log(`Webhook registered for events: ${config.events.join(', ')}`);
  }

  /**
   * Send webhook notification
   */
  async sendWebhook(payload: WebhookPayload): Promise<void> {
    const relevantWebhooks = this.webhooks.filter(
      webhook => webhook.active && webhook.events.includes(payload.event)
    );

    const promises = relevantWebhooks.map(webhook => this.deliverWebhook(webhook, payload));
    await Promise.allSettled(promises);
  }

  /**
   * Deliver webhook to a specific endpoint
   */
  private async deliverWebhook(webhook: WebhookConfig, payload: WebhookPayload): Promise<void> {
    try {
      const headers: any = {
        'Content-Type': 'application/json',
        'User-Agent': 'CivicProblemSolver-Webhook/1.0'
      };

      // Add signature if secret is provided
      if (webhook.secret) {
        const crypto = require('crypto');
        const signature = crypto
          .createHmac('sha256', webhook.secret)
          .update(JSON.stringify(payload))
          .digest('hex');
        headers['X-Webhook-Signature'] = `sha256=${signature}`;
      }

      await axios.post(webhook.url, payload, {
        headers,
        timeout: 10000 // 10 second timeout
      });

      console.log(`Webhook delivered successfully to ${webhook.url}`);
    } catch (error) {
      console.error(`Failed to deliver webhook to ${webhook.url}:`, error);
      // In production, you might want to implement retry logic
    }
  }

  /**
   * Send issue created webhook
   */
  async sendIssueCreated(issueData: any): Promise<void> {
    await this.sendWebhook({
      event: 'issue.created',
      data: issueData,
      timestamp: new Date()
    });
  }

  /**
   * Send issue updated webhook
   */
  async sendIssueUpdated(issueData: any, changes: any): Promise<void> {
    await this.sendWebhook({
      event: 'issue.updated',
      data: {
        issue: issueData,
        changes
      },
      timestamp: new Date()
    });
  }

  /**
   * Send issue resolved webhook
   */
  async sendIssueResolved(issueData: any): Promise<void> {
    await this.sendWebhook({
      event: 'issue.resolved',
      data: issueData,
      timestamp: new Date()
    });
  }

  /**
   * Send user registered webhook
   */
  async sendUserRegistered(userData: any): Promise<void> {
    await this.sendWebhook({
      event: 'user.registered',
      data: userData,
      timestamp: new Date()
    });
  }

  /**
   * Send badge awarded webhook
   */
  async sendBadgeAwarded(userId: string, badge: string): Promise<void> {
    await this.sendWebhook({
      event: 'badge.awarded',
      data: {
        userId,
        badge
      },
      timestamp: new Date()
    });
  }

  /**
   * Get webhook statistics
   */
  getWebhookStats(): any {
    return {
      totalWebhooks: this.webhooks.length,
      activeWebhooks: this.webhooks.filter(w => w.active).length,
      eventTypes: [...new Set(this.webhooks.flatMap(w => w.events))]
    };
  }

  /**
   * Remove webhook
   */
  removeWebhook(url: string): boolean {
    const index = this.webhooks.findIndex(w => w.url === url);
    if (index > -1) {
      this.webhooks.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Test webhook delivery
   */
  async testWebhook(url: string): Promise<boolean> {
    try {
      await axios.post(url, {
        event: 'webhook.test',
        data: { message: 'This is a test webhook' },
        timestamp: new Date()
      }, {
        timeout: 5000
      });
      return true;
    } catch (error) {
      console.error(`Webhook test failed for ${url}:`, error);
      return false;
    }
  }
}

export default new WebhookService();
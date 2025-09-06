export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: any[];
  message?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface IssueFilters {
  status?: 'reported' | 'in-progress' | 'resolved';
  category?: 'waste' | 'road' | 'water' | 'electricity' | 'safety' | 'other';
  priority?: number;
  lat?: number;
  lng?: number;
  radius?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IssueStats {
  totalIssues: number;
  reportedIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
}

export interface CategoryStats {
  _id: string;
  count: number;
  resolved: number;
}

export interface LeaderboardEntry {
  _id: string;
  username: string;
  profile: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  gamification: {
    points: number;
    level: number;
    badges: string[];
    reportsSubmitted: number;
    validationsGiven: number;
    issuesResolved: number;
  };
  rank: number;
}

export interface NotificationPayload {
  userId: string;
  type: 'issue_update' | 'badge_awarded' | 'level_up' | 'issue_resolved';
  title: string;
  message: string;
  data?: any;
}

export interface EmailPayload {
  to: string;
  subject: string;
  template: string;
  data: any;
}

export interface WebhookPayload {
  event: string;
  data: any;
  timestamp: Date;
}
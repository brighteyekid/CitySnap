import { apiService } from './api';
import {
  User,
  RegisterData,
  LoginData,
  ApiResponse,
  PaginatedResponse,
  LeaderboardEntry
} from '../types';

export const userService = {
  // Register a new user
  async register(userData: RegisterData): Promise<ApiResponse<{ token: string; data: User }>> {
    return apiService.post('/users/register', userData);
  },

  // Login user
  async login(loginData: LoginData): Promise<ApiResponse<{ token: string; data: User }>> {
    return apiService.post('/users/login', loginData);
  },

  // Get current user profile
  async getProfile(): Promise<ApiResponse<User>> {
    return apiService.get('/users/me');
  },

  // Update user profile
  async updateProfile(profileData: Partial<User['profile']> & { location?: { latitude: number; longitude: number } }): Promise<ApiResponse<User>> {
    return apiService.put('/users/profile', { profile: profileData.profile, location: profileData.location });
  },

  // Get leaderboard
  async getLeaderboard(page: number = 1, limit: number = 20, timeframe: 'all' | 'week' | 'month' = 'all'): Promise<PaginatedResponse<LeaderboardEntry>> {
    return apiService.get('/users/leaderboard', { page, limit, timeframe });
  },

  // Get user statistics
  async getUserStats(userId: string): Promise<ApiResponse<User & { rank: number }>> {
    return apiService.get(`/users/${userId}/stats`);
  },

  // Get user activity
  async getUserActivity(userId: string, page: number = 1, limit: number = 10): Promise<ApiResponse<any>> {
    return apiService.get(`/users/${userId}/activity`, { page, limit });
  },

  // Award badge (admin only)
  async awardBadge(userId: string, badge: string): Promise<ApiResponse<User>> {
    return apiService.post(`/users/${userId}/badge`, { badge });
  }
};
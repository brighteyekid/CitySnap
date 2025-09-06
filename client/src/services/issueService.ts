import { apiService } from './api';
import {
  Issue,
  CreateIssueData,
  IssueFilters,
  ApiResponse,
  PaginatedResponse,
  IssueStats,
  UpdateStatusData
} from '../types';

export const issueService = {
  // Create a new issue report
  async createIssue(issueData: CreateIssueData, onProgress?: (progress: number) => void): Promise<ApiResponse<Issue>> {
    const formData = new FormData();
    
    formData.append('title', issueData.title);
    formData.append('description', issueData.description);
    formData.append('category', issueData.category);
    formData.append('location[latitude]', issueData.location.latitude.toString());
    formData.append('location[longitude]', issueData.location.longitude.toString());
    
    if (issueData.address) {
      formData.append('address', issueData.address);
    }
    
    if (issueData.isAreaReport) {
      formData.append('isAreaReport', 'true');
    }

    // Append images
    issueData.images.forEach((image) => {
      formData.append('images', image);
    });

    return apiService.uploadFiles('/issues/report', formData, onProgress);
  },

  // Get all issues with filters
  async getIssues(filters: IssueFilters = {}): Promise<PaginatedResponse<Issue>> {
    return apiService.get('/issues', filters);
  },

  // Get a single issue by ID
  async getIssue(id: string): Promise<ApiResponse<Issue>> {
    return apiService.get(`/issues/${id}`);
  },

  // Update issue status (for authorities)
  async updateIssueStatus(id: string, statusData: UpdateStatusData): Promise<ApiResponse<Issue>> {
    return apiService.patch(`/issues/${id}/status`, statusData);
  },

  // Upvote an issue
  async upvoteIssue(id: string): Promise<ApiResponse<{ upvotes: number; userUpvoted: boolean }>> {
    return apiService.post(`/issues/${id}/upvote`);
  },

  // Validate an issue
  async validateIssue(id: string): Promise<ApiResponse<{ validations: number }>> {
    return apiService.post(`/issues/${id}/validate`);
  },

  // Get issue statistics
  async getIssueStats(): Promise<ApiResponse<IssueStats>> {
    return apiService.get('/issues/stats');
  },

  // Get issues near a location
  async getNearbyIssues(lat: number, lng: number, radius: number = 5000): Promise<PaginatedResponse<Issue>> {
    return apiService.get('/issues', {
      lat,
      lng,
      radius,
      limit: 100
    });
  },

  // Search issues
  async searchIssues(query: string, filters: IssueFilters = {}): Promise<PaginatedResponse<Issue>> {
    return apiService.get('/issues', {
      ...filters,
      search: query
    });
  }
};
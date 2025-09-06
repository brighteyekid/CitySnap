import axios from 'axios';
import { MLPrediction, ImageVerificationResult, BatchVerificationResult } from '../hooks/useMLVerification';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface MLHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
  lastCheck: string;
}

export interface MLStats {
  totalVerifications: number;
  successfulVerifications: number;
  failedVerifications: number;
  accuracyRate: number;
  categoryBreakdown: Record<string, number>;
  lastUpdated: string;
}

export interface SupportedCategory {
  description: string;
  mlClasses: string[];
  examples: string[];
}

class MLService {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}/ml`;
  }

  /**
   * Verify a single image against a category
   */
  async verifyImage(
    image: File, 
    category: string, 
    description?: string
  ): Promise<ImageVerificationResult> {
    const formData = new FormData();
    formData.append('images', image);
    formData.append('category', category);
    if (description) {
      formData.append('description', description);
    }

    try {
      const response = await axios.post(`${this.baseURL}/verify-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Image verification failed');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          throw new Error('Too many verification requests. Please try again later.');
        } else if (error.response?.data?.error) {
          throw new Error(error.response.data.error);
        }
      }
      throw new Error('Image verification service is temporarily unavailable');
    }
  }

  /**
   * Verify multiple images against a category
   */
  async verifyImages(
    images: File[], 
    category: string, 
    description?: string
  ): Promise<BatchVerificationResult> {
    const formData = new FormData();
    images.forEach(image => {
      formData.append('images', image);
    });
    formData.append('category', category);
    if (description) {
      formData.append('description', description);
    }

    try {
      const response = await axios.post(`${this.baseURL}/verify-images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 second timeout for multiple images
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Batch image verification failed');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          throw new Error('Too many verification requests. Please try again later.');
        } else if (error.response?.data?.error) {
          throw new Error(error.response.data.error);
        }
      }
      throw new Error('Image verification service is temporarily unavailable');
    }
  }

  /**
   * Submit feedback for ML model improvement
   */
  async submitFeedback({
    issueId,
    actualCategory,
    userFeedback,
    predictions,
    imagePath
  }: {
    issueId?: string;
    actualCategory: string;
    userFeedback: 'correct' | 'incorrect';
    predictions: MLPrediction[];
    imagePath?: string;
  }): Promise<void> {
    try {
      const response = await axios.post(`${this.baseURL}/feedback`, {
        issueId,
        actualCategory,
        userFeedback,
        predictions,
        imagePath
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to submit feedback');
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to submit feedback');
    }
  }

  /**
   * Get ML service health status
   */
  async getHealth(): Promise<MLHealthStatus> {
    try {
      const response = await axios.get(`${this.baseURL}/health`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error('Failed to get ML service health');
      }
    } catch (error) {
      // Return unhealthy status if we can't reach the service
      return {
        status: 'unhealthy',
        message: 'Unable to connect to ML service',
        lastCheck: new Date().toISOString()
      };
    }
  }

  /**
   * Get supported categories and their ML mappings
   */
  async getSupportedCategories(): Promise<Record<string, SupportedCategory>> {
    try {
      const response = await axios.get(`${this.baseURL}/categories`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error('Failed to get supported categories');
      }
    } catch (error) {
      console.error('Error fetching ML categories:', error);
      // Return default categories as fallback
      return {
        'road': {
          description: 'Road-related issues',
          mlClasses: ['pothole', 'damaged_road'],
          examples: ['Potholes', 'Cracked pavement']
        },
        'waste': {
          description: 'Waste and sanitation issues',
          mlClasses: ['garbage', 'illegal_dumping'],
          examples: ['Overflowing bins', 'Illegal dumping']
        },
        'water': {
          description: 'Water and drainage issues',
          mlClasses: ['water_leak', 'blocked_drain'],
          examples: ['Water leaks', 'Blocked drains']
        },
        'electricity': {
          description: 'Electrical infrastructure issues',
          mlClasses: ['broken_streetlight'],
          examples: ['Broken streetlights']
        }
      };
    }
  }

  /**
   * Get ML verification statistics
   */
  async getStats(): Promise<MLStats> {
    try {
      const response = await axios.get(`${this.baseURL}/stats`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error('Failed to get ML statistics');
      }
    } catch (error) {
      console.error('Error fetching ML stats:', error);
      // Return default stats as fallback
      return {
        totalVerifications: 0,
        successfulVerifications: 0,
        failedVerifications: 0,
        accuracyRate: 0,
        categoryBreakdown: {},
        lastUpdated: new Date().toISOString()
      };
    }
  }
}

export const mlService = new MLService();
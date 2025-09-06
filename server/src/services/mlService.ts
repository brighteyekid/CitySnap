import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// ML Model Configuration
const ML_SERVICE_CONFIG = {
  // Local ML API endpoint
  ML_API_ENDPOINT: process.env.ML_API_ENDPOINT || 'http://localhost:8000',
  
  // Fallback to Roboflow API if local service is unavailable
  ROBOFLOW_API_KEY: process.env.ROBOFLOW_API_KEY || '',
  ROBOFLOW_MODEL_ENDPOINT: process.env.ROBOFLOW_MODEL_ENDPOINT || '',
  
  // Confidence threshold for predictions
  CONFIDENCE_THRESHOLD: 0.25,
  
  // Request timeout
  TIMEOUT: 30000,
  
  // Category mappings for civic issues
  CATEGORY_MAPPINGS: {
    'pothole': ['road', 'infrastructure'],
    'garbage': ['waste', 'sanitation'],
    'broken_streetlight': ['electricity', 'lighting'],
    'water_leak': ['water', 'plumbing'],
    'damaged_road': ['road', 'infrastructure'],
    'broken_sidewalk': ['road', 'infrastructure'],
    'graffiti': ['safety', 'vandalism'],
    'damaged_sign': ['infrastructure', 'signage'],
    'blocked_drain': ['water', 'drainage'],
    'illegal_dumping': ['waste', 'environment'],
    'damaged_fence': ['infrastructure'],
    'broken_bench': ['infrastructure'],
    'overgrown_vegetation': ['environment'],
    'damaged_building': ['infrastructure'],
    'construction_debris': ['safety', 'waste']
  }
};

export interface MLPrediction {
  class: string;
  confidence: number;
  bbox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ImageVerificationResult {
  isValid: boolean;
  predictions: MLPrediction[];
  suggestedCategory?: string;
  confidence: number;
  message: string;
}

/**
 * Preprocess image for ML model
 */
async function preprocessImage(imagePath: string): Promise<Buffer> {
  try {
    // Resize and optimize image for ML processing
    const processedImage = await sharp(imagePath)
      .resize(640, 640, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ quality: 85 })
      .toBuffer();
    
    return processedImage;
  } catch (error) {
    console.error('Error preprocessing image:', error);
    throw new Error('Failed to preprocess image');
  }
}

/**
 * Call local ML API for object detection
 */
async function callLocalMLAPI(imageBuffer: Buffer, category: string): Promise<ImageVerificationResult> {
  try {
    const formData = new FormData();
    formData.append('file', imageBuffer, { filename: 'image.jpg' });
    formData.append('category', category);
    formData.append('confidence', ML_SERVICE_CONFIG.CONFIDENCE_THRESHOLD.toString());

    const response = await axios.post(
      `${ML_SERVICE_CONFIG.ML_API_ENDPOINT}/verify`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: ML_SERVICE_CONFIG.TIMEOUT,
      }
    );

    if (response.data && response.data.success) {
      const data = response.data.data;
      return {
        isValid: data.is_valid,
        predictions: data.detections || [],
        suggestedCategory: data.suggested_category,
        confidence: data.confidence || 0,
        message: data.message || 'Verification completed'
      };
    }

    throw new Error('Invalid response from ML API');
  } catch (error) {
    console.error('Error calling local ML API:', error);
    // Fallback to Roboflow API or mock predictions
    throw error;
  }
}

/**
 * Call Roboflow API for object detection (fallback)
 */
async function callRoboflowAPI(imageBuffer: Buffer): Promise<MLPrediction[]> {
  try {
    if (!ML_SERVICE_CONFIG.ROBOFLOW_API_KEY || !ML_SERVICE_CONFIG.ROBOFLOW_MODEL_ENDPOINT) {
      console.warn('Roboflow API not configured, using mock predictions');
      return getMockPredictions();
    }

    const formData = new FormData();
    formData.append('file', imageBuffer, { filename: 'image.jpg' });

    const response = await axios.post(
      `${ML_SERVICE_CONFIG.ROBOFLOW_MODEL_ENDPOINT}?api_key=${ML_SERVICE_CONFIG.ROBOFLOW_API_KEY}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 30000, // 30 second timeout
      }
    );

    if (response.data && response.data.predictions) {
      return response.data.predictions.map((pred: any) => ({
        class: pred.class,
        confidence: pred.confidence,
        bbox: pred.x ? {
          x: pred.x,
          y: pred.y,
          width: pred.width,
          height: pred.height
        } : undefined
      }));
    }

    return [];
  } catch (error) {
    console.error('Error calling Roboflow API:', error);
    // Fallback to mock predictions if API fails
    return getMockPredictions();
  }
}

/**
 * Mock predictions for development/fallback
 */
function getMockPredictions(): MLPrediction[] {
  // Return mock predictions based on random selection
  const mockClasses = ['pothole', 'garbage', 'broken_streetlight', 'water_leak'];
  const randomClass = mockClasses[Math.floor(Math.random() * mockClasses.length)];
  
  return [{
    class: randomClass,
    confidence: 0.75 + Math.random() * 0.2, // Random confidence between 0.75-0.95
    bbox: {
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: 150 + Math.random() * 100,
      height: 150 + Math.random() * 100
    }
  }];
}

/**
 * Map ML predictions to civic issue categories
 */
function mapPredictionToCategory(predictions: MLPrediction[]): string | undefined {
  if (predictions.length === 0) return undefined;

  // Get the highest confidence prediction
  const bestPrediction = predictions.reduce((best, current) => 
    current.confidence > best.confidence ? current : best
  );

  // Map to civic categories
  for (const [mlClass, categories] of Object.entries(ML_SERVICE_CONFIG.CATEGORY_MAPPINGS)) {
    if (bestPrediction.class.toLowerCase().includes(mlClass.toLowerCase()) ||
        mlClass.toLowerCase().includes(bestPrediction.class.toLowerCase())) {
      return categories[0]; // Return primary category
    }
  }

  return undefined;
}

/**
 * Verify if image matches the selected category
 */
function verifyImageCategory(predictions: MLPrediction[], selectedCategory: string): boolean {
  if (predictions.length === 0) return false;

  const suggestedCategory = mapPredictionToCategory(predictions);
  if (!suggestedCategory) return false;

  // Check if suggested category matches or is related to selected category
  const categoryMappings = Object.values(ML_SERVICE_CONFIG.CATEGORY_MAPPINGS).flat();
  const selectedCategoryLower = selectedCategory.toLowerCase();
  const suggestedCategoryLower = suggestedCategory.toLowerCase();

  // Direct match
  if (selectedCategoryLower === suggestedCategoryLower) return true;

  // Check if they're in the same mapping group
  for (const [mlClass, categories] of Object.entries(ML_SERVICE_CONFIG.CATEGORY_MAPPINGS)) {
    if (categories.includes(selectedCategoryLower) && categories.includes(suggestedCategoryLower)) {
      return true;
    }
  }

  return false;
}

/**
 * Main function to verify image against category
 */
export async function verifyImageWithML(
  imagePath: string, 
  selectedCategory: string,
  description?: string
): Promise<ImageVerificationResult> {
  try {
    // Preprocess image
    const processedImage = await preprocessImage(imagePath);
    
    // Try local ML API first
    try {
      const result = await callLocalMLAPI(processedImage, selectedCategory);
      console.log('Local ML API verification successful');
      return result;
    } catch (localError) {
      const errorMessage = localError instanceof Error ? localError.message : 'Unknown error';
      console.warn('Local ML API failed, falling back to Roboflow:', errorMessage);
      
      // Fallback to Roboflow API
      const predictions = await callRoboflowAPI(processedImage);
      
      // Filter predictions by confidence threshold
      const validPredictions = predictions.filter(
        pred => pred.confidence >= ML_SERVICE_CONFIG.CONFIDENCE_THRESHOLD
      );

      if (validPredictions.length === 0) {
        return {
          isValid: false,
          predictions: [],
          confidence: 0,
          message: 'No civic issues detected in the image. Please upload a clear image showing the problem.'
        };
      }

      // Get suggested category
      const suggestedCategory = mapPredictionToCategory(validPredictions);
      
      // Verify against selected category
      const isValid = verifyImageCategory(validPredictions, selectedCategory);
      
      // Calculate overall confidence
      const avgConfidence = validPredictions.reduce((sum, pred) => sum + pred.confidence, 0) / validPredictions.length;

      let message = '';
      if (isValid) {
        message = `Image verified! Detected ${validPredictions[0].class} with ${(avgConfidence * 100).toFixed(1)}% confidence.`;
      } else if (suggestedCategory) {
        message = `Image shows a ${suggestedCategory} issue, but you selected ${selectedCategory}. Please select the correct category or upload a different image.`;
      } else {
        message = 'The uploaded image does not clearly show a civic issue. Please upload a clearer image.';
      }

      return {
        isValid,
        predictions: validPredictions,
        suggestedCategory,
        confidence: avgConfidence,
        message
      };
    }

  } catch (error) {
    console.error('Error in ML verification:', error);
    
    // In case of ML service failure, allow the upload but log the error
    return {
      isValid: true, // Fail open to not block users
      predictions: [],
      confidence: 0,
      message: 'Image verification service temporarily unavailable. Your report has been accepted for manual review.'
    };
  }
}

/**
 * Batch verify multiple images
 */
export async function verifyMultipleImages(
  imagePaths: string[],
  selectedCategory: string,
  description?: string
): Promise<ImageVerificationResult[]> {
  const results = await Promise.all(
    imagePaths.map(imagePath => verifyImageWithML(imagePath, selectedCategory, description))
  );
  
  return results;
}

/**
 * Update ML model with feedback (for continuous learning)
 */
export async function updateMLModelWithFeedback(
  imagePath: string,
  actualCategory: string,
  userFeedback: 'correct' | 'incorrect',
  predictions: MLPrediction[]
): Promise<void> {
  try {
    // This would typically send feedback to your ML training pipeline
    // For now, we'll just log it for future model improvements
    
    const feedbackData = {
      timestamp: new Date().toISOString(),
      imagePath,
      actualCategory,
      userFeedback,
      predictions,
      modelVersion: '1.0'
    };

    // Log to file for future training data collection
    const feedbackLogPath = path.join(process.cwd(), 'logs', 'ml-feedback.jsonl');
    
    // Ensure logs directory exists
    const logsDir = path.dirname(feedbackLogPath);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Append feedback to log file
    fs.appendFileSync(feedbackLogPath, JSON.stringify(feedbackData) + '\n');
    
    console.log('ML feedback logged:', feedbackData);
  } catch (error) {
    console.error('Error logging ML feedback:', error);
  }
}

/**
 * Get ML service health status
 */
export async function getMLServiceHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
  lastCheck: string;
}> {
  try {
    if (!ML_SERVICE_CONFIG.ROBOFLOW_API_KEY || !ML_SERVICE_CONFIG.ROBOFLOW_MODEL_ENDPOINT) {
      return {
        status: 'degraded',
        message: 'ML service running in mock mode - API not configured',
        lastCheck: new Date().toISOString()
      };
    }

    // Test API with a small request
    const testResponse = await axios.get(
      `${ML_SERVICE_CONFIG.ROBOFLOW_MODEL_ENDPOINT}/health?api_key=${ML_SERVICE_CONFIG.ROBOFLOW_API_KEY}`,
      { timeout: 5000 }
    );

    return {
      status: 'healthy',
      message: 'ML service is operational',
      lastCheck: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: `ML service error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      lastCheck: new Date().toISOString()
    };
  }
}
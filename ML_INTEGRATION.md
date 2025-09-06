# ML Integration for Civic Problem Solver

## Overview

The Civic Problem Solver platform now includes AI-powered image verification to ensure that uploaded images match the selected issue categories. This helps maintain report quality, reduces false reports, and improves the overall reliability of the platform.

## Features

### 🤖 AI Image Verification
- **Real-time Verification**: Images are automatically verified when users upload them
- **Category Matching**: Ensures uploaded images match the selected issue category
- **Confidence Scoring**: Provides confidence levels for predictions
- **Fallback Handling**: Gracefully handles ML service failures

### 🎯 Supported Categories
- **Road Issues**: Potholes, damaged roads, broken sidewalks
- **Waste Management**: Garbage, illegal dumping, overflowing bins
- **Water Issues**: Water leaks, blocked drains, flooding
- **Electrical**: Broken streetlights, damaged power infrastructure
- **Infrastructure**: Damaged signs, general infrastructure issues
- **Safety**: Vandalism, graffiti, safety hazards

### 📊 ML Dashboard
- **Verification Statistics**: Track total, successful, and failed verifications
- **Accuracy Metrics**: Monitor ML model performance
- **Category Breakdown**: See verification counts by issue category
- **System Health**: Real-time ML service status monitoring

## Technical Implementation

### Backend Components

#### ML Service (`/server/src/services/mlService.ts`)
- **Image Preprocessing**: Resizes and optimizes images for ML processing
- **API Integration**: Connects to Roboflow API for object detection
- **Category Mapping**: Maps ML predictions to civic issue categories
- **Feedback Collection**: Collects user feedback for model improvement

#### ML Controller (`/server/src/controllers/mlController.ts`)
- **Image Verification Endpoints**: Single and batch image verification
- **Feedback Submission**: Allows users to provide feedback on predictions
- **Health Monitoring**: Provides ML service health status
- **Statistics**: Generates verification statistics

#### ML Routes (`/server/src/routes/mlRoutes.ts`)
- **Rate Limited**: Prevents abuse with configurable rate limits
- **Validation**: Input validation for all endpoints
- **File Upload**: Secure file handling with size and type restrictions

### Frontend Components

#### ML Verification Component (`/client/src/components/MLImageVerification.tsx`)
- **Real-time Verification**: Automatically verifies images as they're uploaded
- **Visual Feedback**: Shows verification status with clear indicators
- **Detailed Results**: Displays prediction details and confidence scores
- **Error Handling**: Graceful error handling with retry options

#### ML Hooks (`/client/src/hooks/useMLVerification.ts`)
- **Verification Logic**: Handles single and batch image verification
- **State Management**: Manages verification state and results
- **Error Handling**: Provides error states and retry mechanisms

#### ML Service (`/client/src/services/mlService.ts`)
- **API Communication**: Handles all ML-related API calls
- **Error Handling**: Robust error handling with fallbacks
- **Type Safety**: Full TypeScript support

## API Endpoints

### Image Verification
```
POST /api/ml/verify-image
POST /api/ml/verify-images
```
- Verify single or multiple images against a category
- Returns verification results with confidence scores

### Feedback
```
POST /api/ml/feedback
```
- Submit feedback for model improvement
- Helps train the system over time

### Health & Stats
```
GET /api/ml/health
GET /api/ml/stats
GET /api/ml/categories
```
- Monitor system health and performance
- Get verification statistics
- List supported categories

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# ML Service Configuration
ROBOFLOW_API_KEY=your-roboflow-api-key-here
ROBOFLOW_MODEL_ENDPOINT=https://detect.roboflow.com/your-model-endpoint
```

### Roboflow Setup

1. **Create Account**: Sign up at [Roboflow](https://roboflow.com)
2. **Train Model**: Create a custom model for civic issue detection
3. **Get API Key**: Generate API key from your dashboard
4. **Configure Endpoint**: Set up your model endpoint URL

## Usage Flow

### For Users (Report Submission)

1. **Upload Images**: User selects images for their report
2. **Select Category**: User chooses the issue category
3. **Auto-Verification**: System automatically verifies images
4. **Review Results**: User sees verification status and details
5. **Submit Report**: Can only submit if images pass verification

### For Administrators

1. **Monitor Dashboard**: View ML verification statistics
2. **Review Feedback**: Check user feedback on predictions
3. **System Health**: Monitor ML service status
4. **Model Updates**: Use feedback data to improve models

## Error Handling

### Graceful Degradation
- **Service Unavailable**: Falls back to allowing submissions without verification
- **API Failures**: Shows warning but doesn't block users
- **Network Issues**: Provides retry options

### User Experience
- **Clear Messaging**: Informative error messages
- **Visual Indicators**: Color-coded status indicators
- **Help Text**: Guidance on how to resolve issues

## Performance Considerations

### Rate Limiting
- **Image Verification**: 20 requests per 5 minutes per IP
- **General ML Endpoints**: 50 requests per 15 minutes per IP

### Optimization
- **Image Compression**: Automatic image optimization before processing
- **Caching**: Results cached to avoid duplicate processing
- **Async Processing**: Non-blocking verification process

## Future Enhancements

### Planned Features
- **Custom Model Training**: Train models on platform-specific data
- **Advanced Analytics**: More detailed ML performance metrics
- **Multi-language Support**: Support for different languages
- **Edge Cases**: Better handling of edge cases and unusual images

### Model Improvements
- **Continuous Learning**: Automatic model updates based on feedback
- **Regional Adaptation**: Models adapted to specific geographic regions
- **Seasonal Adjustments**: Account for seasonal variations in issues

## Troubleshooting

### Common Issues

#### ML Service Not Working
1. Check environment variables are set correctly
2. Verify Roboflow API key is valid
3. Check network connectivity to Roboflow API
4. Review server logs for detailed error messages

#### Images Not Verifying
1. Ensure images are in supported formats (JPEG, PNG, WebP)
2. Check image file sizes (max 10MB)
3. Verify category is selected before uploading
4. Try refreshing the page and re-uploading

#### Poor Verification Accuracy
1. Submit feedback on incorrect predictions
2. Ensure images clearly show the reported issue
3. Use appropriate lighting and image quality
4. Consider retraining the model with more data

### Logs and Monitoring

#### Server Logs
- ML verification attempts logged in server console
- Feedback data stored in `/logs/ml-feedback.jsonl`
- Error logs include detailed stack traces

#### Client Monitoring
- Network requests logged in browser console
- Verification results stored in component state
- Error states displayed to users

## Security Considerations

### Data Privacy
- **Temporary Storage**: Images stored temporarily during processing
- **Automatic Cleanup**: Temporary files automatically deleted
- **No Persistent Storage**: ML service doesn't store user images

### API Security
- **Rate Limiting**: Prevents abuse and DoS attacks
- **Input Validation**: All inputs validated and sanitized
- **Error Handling**: Secure error messages without sensitive data

## Contributing

### Adding New Categories
1. Update category mappings in `mlService.ts`
2. Add category definitions in frontend constants
3. Update ML model to recognize new categories
4. Test thoroughly with sample images

### Improving Accuracy
1. Collect feedback data from users
2. Analyze common failure cases
3. Retrain models with additional data
4. Update confidence thresholds as needed

## Support

For issues related to ML integration:
1. Check this documentation first
2. Review server and client logs
3. Test with sample images
4. Submit feedback through the platform

The ML integration is designed to be robust and user-friendly while maintaining high accuracy for civic issue detection.
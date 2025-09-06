"""
FastAPI server for civic issue detection model
"""

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import io
import numpy as np
from PIL import Image
import logging
from typing import List, Optional
import os
from pathlib import Path
import json
import time
from datetime import datetime

from model import CivicIssueDetector

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Civic Issue Detection API",
    description="AI-powered civic issue detection and verification service",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model instance
detector = None
model_load_time = None

# Statistics tracking
stats = {
    'total_requests': 0,
    'successful_detections': 0,
    'failed_detections': 0,
    'category_counts': {},
    'start_time': datetime.now().isoformat()
}

def load_model():
    """Load the civic issue detection model"""
    global detector, model_load_time
    
    try:
        start_time = time.time()
        
        # Check for custom model weights
        model_path = os.getenv('MODEL_PATH', None)
        
        detector = CivicIssueDetector(model_path=model_path)
        model_load_time = time.time() - start_time
        
        logger.info(f"Model loaded successfully in {model_load_time:.2f} seconds")
        return True
        
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        return False

@app.on_event("startup")
async def startup_event():
    """Initialize the model on startup"""
    success = load_model()
    if not success:
        logger.error("Failed to load model on startup")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Civic Issue Detection API",
        "version": "1.0.0",
        "status": "running" if detector else "model not loaded"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    if detector is None:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "message": "Model not loaded",
                "timestamp": datetime.now().isoformat()
            }
        )
    
    return {
        "status": "healthy",
        "message": "Service is operational",
        "model_info": detector.get_model_info(),
        "load_time": model_load_time,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/stats")
async def get_stats():
    """Get API usage statistics"""
    return {
        "success": True,
        "data": {
            **stats,
            "uptime_seconds": (datetime.now() - datetime.fromisoformat(stats['start_time'])).total_seconds()
        }
    }

@app.post("/detect")
async def detect_issues(
    file: UploadFile = File(...),
    confidence: Optional[float] = Form(0.25),
    iou: Optional[float] = Form(0.45)
):
    """
    Detect civic issues in an uploaded image
    
    Args:
        file: Image file to analyze
        confidence: Confidence threshold (0.0-1.0)
        iou: IoU threshold for NMS (0.0-1.0)
    
    Returns:
        Detection results with bounding boxes and confidence scores
    """
    global stats
    stats['total_requests'] += 1
    
    if detector is None:
        stats['failed_detections'] += 1
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read and process image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Run detection
        detections = detector.detect(image, confidence=confidence, iou=iou)
        
        # Update statistics
        stats['successful_detections'] += 1
        for detection in detections:
            class_name = detection['class']
            stats['category_counts'][class_name] = stats['category_counts'].get(class_name, 0) + 1
        
        return {
            "success": True,
            "data": {
                "detections": detections,
                "count": len(detections),
                "image_size": {
                    "width": image.width,
                    "height": image.height
                },
                "processing_params": {
                    "confidence_threshold": confidence,
                    "iou_threshold": iou
                }
            }
        }
        
    except Exception as e:
        stats['failed_detections'] += 1
        logger.error(f"Detection error: {e}")
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")

@app.post("/verify")
async def verify_category(
    file: UploadFile = File(...),
    category: str = Form(...),
    description: Optional[str] = Form(None),
    confidence: Optional[float] = Form(0.25)
):
    """
    Verify if an image matches the expected civic issue category
    
    Args:
        file: Image file to verify
        category: Expected category (road, waste, water, electricity, etc.)
        description: Optional description of the issue
        confidence: Confidence threshold
    
    Returns:
        Verification result with validity and suggestions
    """
    global stats
    stats['total_requests'] += 1
    
    if detector is None:
        stats['failed_detections'] += 1
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Validate inputs
        valid_categories = ['road', 'waste', 'water', 'electricity', 'infrastructure', 'safety', 'environment']
        if category.lower() not in valid_categories:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid category. Must be one of: {', '.join(valid_categories)}"
            )
        
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read and process image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))
        
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Set confidence threshold
        detector.confidence_threshold = confidence
        
        # Run verification
        result = detector.verify_category(image, category.lower())
        
        # Update statistics
        if result['is_valid']:
            stats['successful_detections'] += 1
        else:
            stats['failed_detections'] += 1
        
        # Track category usage
        stats['category_counts'][category] = stats['category_counts'].get(category, 0) + 1
        
        return {
            "success": True,
            "data": {
                **result,
                "expected_category": category,
                "description": description,
                "image_size": {
                    "width": image.width,
                    "height": image.height
                }
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        stats['failed_detections'] += 1
        logger.error(f"Verification error: {e}")
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")

@app.post("/batch-verify")
async def batch_verify(
    files: List[UploadFile] = File(...),
    category: str = Form(...),
    confidence: Optional[float] = Form(0.25)
):
    """
    Verify multiple images against a category
    
    Args:
        files: List of image files to verify
        category: Expected category
        confidence: Confidence threshold
    
    Returns:
        Batch verification results
    """
    if detector is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    if len(files) > 10:  # Limit batch size
        raise HTTPException(status_code=400, detail="Maximum 10 files per batch")
    
    results = []
    valid_count = 0
    
    for i, file in enumerate(files):
        try:
            # Process each file
            image_data = await file.read()
            image = Image.open(io.BytesIO(image_data))
            
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            detector.confidence_threshold = confidence
            result = detector.verify_category(image, category.lower())
            
            result['file_index'] = i
            result['filename'] = file.filename
            results.append(result)
            
            if result['is_valid']:
                valid_count += 1
                
        except Exception as e:
            results.append({
                'file_index': i,
                'filename': file.filename,
                'is_valid': False,
                'confidence': 0.0,
                'message': f'Processing failed: {str(e)}',
                'detections': [],
                'suggested_category': None
            })
    
    return {
        "success": True,
        "data": {
            "results": results,
            "summary": {
                "total_files": len(files),
                "valid_files": valid_count,
                "invalid_files": len(files) - valid_count,
                "success_rate": valid_count / len(files) if files else 0
            }
        }
    }

@app.get("/categories")
async def get_categories():
    """Get supported categories and their descriptions"""
    categories = {
        'road': {
            'description': 'Road-related issues',
            'examples': ['Potholes', 'Damaged roads', 'Broken sidewalks'],
            'ml_classes': ['pothole', 'damaged_road', 'broken_sidewalk']
        },
        'waste': {
            'description': 'Waste and sanitation issues',
            'examples': ['Garbage accumulation', 'Illegal dumping', 'Overflowing bins'],
            'ml_classes': ['garbage', 'illegal_dumping']
        },
        'water': {
            'description': 'Water and drainage issues',
            'examples': ['Water leaks', 'Blocked drains', 'Flooding'],
            'ml_classes': ['water_leak', 'blocked_drain']
        },
        'electricity': {
            'description': 'Electrical infrastructure issues',
            'examples': ['Broken streetlights', 'Damaged power lines'],
            'ml_classes': ['broken_streetlight']
        },
        'infrastructure': {
            'description': 'General infrastructure issues',
            'examples': ['Damaged signs', 'Broken benches', 'Damaged buildings'],
            'ml_classes': ['damaged_sign', 'broken_bench', 'damaged_building', 'damaged_fence']
        },
        'safety': {
            'description': 'Safety and security issues',
            'examples': ['Graffiti', 'Construction debris', 'Safety hazards'],
            'ml_classes': ['graffiti', 'construction_debris']
        },
        'environment': {
            'description': 'Environmental issues',
            'examples': ['Overgrown vegetation', 'Environmental hazards'],
            'ml_classes': ['overgrown_vegetation']
        }
    }
    
    return {
        "success": True,
        "data": categories
    }

@app.post("/feedback")
async def submit_feedback(
    actual_category: str = Form(...),
    predicted_category: str = Form(...),
    is_correct: bool = Form(...),
    confidence: float = Form(...),
    image_id: Optional[str] = Form(None),
    comments: Optional[str] = Form(None)
):
    """
    Submit feedback for model improvement
    
    Args:
        actual_category: The actual category of the issue
        predicted_category: What the model predicted
        is_correct: Whether the prediction was correct
        confidence: Confidence score of the prediction
        image_id: Optional image identifier
        comments: Optional feedback comments
    
    Returns:
        Feedback submission confirmation
    """
    try:
        # Store feedback (in production, this would go to a database)
        feedback_data = {
            'timestamp': datetime.now().isoformat(),
            'actual_category': actual_category,
            'predicted_category': predicted_category,
            'is_correct': is_correct,
            'confidence': confidence,
            'image_id': image_id,
            'comments': comments
        }
        
        # Log feedback for now (in production, store in database)
        feedback_file = Path('feedback.jsonl')
        with open(feedback_file, 'a') as f:
            f.write(json.dumps(feedback_data) + '\n')
        
        logger.info(f"Feedback received: {feedback_data}")
        
        return {
            "success": True,
            "message": "Feedback submitted successfully",
            "data": {
                "feedback_id": f"fb_{int(time.time())}",
                "timestamp": feedback_data['timestamp']
            }
        }
        
    except Exception as e:
        logger.error(f"Feedback submission error: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit feedback")

@app.post("/reload-model")
async def reload_model():
    """Reload the model (admin endpoint)"""
    try:
        success = load_model()
        if success:
            return {
                "success": True,
                "message": "Model reloaded successfully",
                "load_time": model_load_time
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to reload model")
    except Exception as e:
        logger.error(f"Model reload error: {e}")
        raise HTTPException(status_code=500, detail=f"Model reload failed: {str(e)}")

if __name__ == "__main__":
    # Run the server
    uvicorn.run(
        "api:app",
        host="0.0.0.0",
        port=int(os.getenv("ML_PORT", 8000)),
        reload=os.getenv("ENVIRONMENT", "production") == "development"
    )
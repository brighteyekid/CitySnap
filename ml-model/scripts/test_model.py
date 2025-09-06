#!/usr/bin/env python3
"""
Test script for civic issue detection model
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

import requests
import json
from pathlib import Path
import logging
from PIL import Image, ImageDraw
import numpy as np
import cv2
import time

from model import CivicIssueDetector

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_test_image(issue_type: str = 'pothole', size: tuple = (640, 480)):
    """Create a synthetic test image for testing"""
    # Create a simple test image
    image = Image.new('RGB', size, color='lightgray')
    draw = ImageDraw.Draw(image)
    
    if issue_type == 'pothole':
        # Draw a dark circular area to simulate a pothole
        center_x, center_y = size[0] // 2, size[1] // 2
        radius = min(size) // 8
        draw.ellipse([
            center_x - radius, center_y - radius,
            center_x + radius, center_y + radius
        ], fill='darkgray', outline='black', width=3)
        
    elif issue_type == 'garbage':
        # Draw some rectangular shapes to simulate garbage
        for i in range(3):
            x = size[0] // 4 + i * 50
            y = size[1] // 2 + i * 20
            draw.rectangle([x, y, x + 40, y + 30], fill='brown', outline='black')
    
    elif issue_type == 'streetlight':
        # Draw a simple streetlight shape
        pole_x = size[0] // 2
        draw.rectangle([pole_x - 5, size[1] // 4, pole_x + 5, size[1] - 50], fill='gray')
        draw.ellipse([pole_x - 20, size[1] // 4 - 20, pole_x + 20, size[1] // 4 + 20], 
                    fill='yellow', outline='black')
    
    return image

def test_model_loading():
    """Test model loading"""
    logger.info("Testing model loading...")
    
    try:
        detector = CivicIssueDetector()
        info = detector.get_model_info()
        logger.info(f"✅ Model loaded successfully: {info}")
        return detector
    except Exception as e:
        logger.error(f"❌ Model loading failed: {e}")
        return None

def test_image_detection(detector, test_image_path: str = None):
    """Test image detection"""
    logger.info("Testing image detection...")
    
    if test_image_path and Path(test_image_path).exists():
        image = test_image_path
        logger.info(f"Using provided test image: {test_image_path}")
    else:
        # Create synthetic test image
        image = create_test_image('pothole')
        logger.info("Using synthetic test image")
    
    try:
        start_time = time.time()
        detections = detector.detect(image)
        inference_time = time.time() - start_time
        
        logger.info(f"✅ Detection completed in {inference_time:.3f}s")
        logger.info(f"Found {len(detections)} detections:")
        
        for i, detection in enumerate(detections):
            logger.info(f"  {i+1}. {detection['class']}: {detection['confidence']:.3f}")
        
        return detections
        
    except Exception as e:
        logger.error(f"❌ Detection failed: {e}")
        return []

def test_category_verification(detector):
    """Test category verification"""
    logger.info("Testing category verification...")
    
    test_cases = [
        ('pothole', 'road'),
        ('garbage', 'waste'),
        ('streetlight', 'electricity')
    ]
    
    for issue_type, category in test_cases:
        try:
            image = create_test_image(issue_type)
            result = detector.verify_category(image, category)
            
            status = "✅" if result['is_valid'] else "❌"
            logger.info(f"{status} {issue_type} -> {category}: {result['message']}")
            
        except Exception as e:
            logger.error(f"❌ Verification failed for {issue_type}: {e}")

def test_api_endpoints(base_url: str = "http://localhost:8000"):
    """Test API endpoints"""
    logger.info(f"Testing API endpoints at {base_url}...")
    
    # Test health endpoint
    try:
        response = requests.get(f"{base_url}/health", timeout=10)
        if response.status_code == 200:
            logger.info("✅ Health endpoint working")
            logger.info(f"   Status: {response.json()}")
        else:
            logger.error(f"❌ Health endpoint failed: {response.status_code}")
    except Exception as e:
        logger.error(f"❌ Health endpoint error: {e}")
        return False
    
    # Test categories endpoint
    try:
        response = requests.get(f"{base_url}/categories", timeout=10)
        if response.status_code == 200:
            categories = response.json()['data']
            logger.info(f"✅ Categories endpoint working ({len(categories)} categories)")
        else:
            logger.error(f"❌ Categories endpoint failed: {response.status_code}")
    except Exception as e:
        logger.error(f"❌ Categories endpoint error: {e}")
    
    # Test detection endpoint with synthetic image
    try:
        test_image = create_test_image('pothole')
        
        # Save image temporarily
        temp_path = Path('temp_test_image.jpg')
        test_image.save(temp_path)
        
        with open(temp_path, 'rb') as f:
            files = {'file': ('test.jpg', f, 'image/jpeg')}
            data = {'confidence': 0.25}
            
            response = requests.post(f"{base_url}/detect", files=files, data=data, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                detections = result['data']['detections']
                logger.info(f"✅ Detection endpoint working ({len(detections)} detections)")
            else:
                logger.error(f"❌ Detection endpoint failed: {response.status_code}")
                logger.error(f"   Response: {response.text}")
        
        # Clean up
        if temp_path.exists():
            temp_path.unlink()
            
    except Exception as e:
        logger.error(f"❌ Detection endpoint error: {e}")
    
    # Test verification endpoint
    try:
        test_image = create_test_image('pothole')
        temp_path = Path('temp_test_image.jpg')
        test_image.save(temp_path)
        
        with open(temp_path, 'rb') as f:
            files = {'file': ('test.jpg', f, 'image/jpeg')}
            data = {'category': 'road', 'confidence': 0.25}
            
            response = requests.post(f"{base_url}/verify", files=files, data=data, timeout=30)
            
            if response.status_code == 200:
                result = response.json()['data']
                logger.info(f"✅ Verification endpoint working (valid: {result['is_valid']})")
            else:
                logger.error(f"❌ Verification endpoint failed: {response.status_code}")
        
        # Clean up
        if temp_path.exists():
            temp_path.unlink()
            
    except Exception as e:
        logger.error(f"❌ Verification endpoint error: {e}")
    
    return True

def test_performance(detector, num_images: int = 10):
    """Test model performance"""
    logger.info(f"Testing performance with {num_images} images...")
    
    total_time = 0
    successful_detections = 0
    
    for i in range(num_images):
        try:
            # Create random test image
            issue_types = ['pothole', 'garbage', 'streetlight']
            issue_type = issue_types[i % len(issue_types)]
            image = create_test_image(issue_type)
            
            start_time = time.time()
            detections = detector.detect(image)
            inference_time = time.time() - start_time
            
            total_time += inference_time
            if len(detections) > 0:
                successful_detections += 1
                
        except Exception as e:
            logger.error(f"Performance test failed on image {i}: {e}")
    
    avg_time = total_time / num_images
    success_rate = successful_detections / num_images
    
    logger.info(f"Performance Results:")
    logger.info(f"  Average inference time: {avg_time:.3f}s")
    logger.info(f"  Throughput: {1/avg_time:.1f} images/second")
    logger.info(f"  Success rate: {success_rate:.1%}")

def create_visualization(detector, output_path: str = "test_results"):
    """Create visualization of test results"""
    logger.info("Creating test visualizations...")
    
    output_dir = Path(output_path)
    output_dir.mkdir(exist_ok=True)
    
    issue_types = ['pothole', 'garbage', 'streetlight']
    
    for issue_type in issue_types:
        try:
            # Create test image
            image = create_test_image(issue_type, size=(800, 600))
            
            # Run detection
            detections = detector.detect(image)
            
            # Create visualization
            vis_image = detector.visualize_detections(image, detections)
            
            # Save result
            output_file = output_dir / f"{issue_type}_detection.jpg"
            cv2.imwrite(str(output_file), cv2.cvtColor(vis_image, cv2.COLOR_RGB2BGR))
            
            logger.info(f"✅ Created visualization: {output_file}")
            
        except Exception as e:
            logger.error(f"❌ Visualization failed for {issue_type}: {e}")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Test civic issue detection model')
    parser.add_argument('--model-path', help='Path to model weights')
    parser.add_argument('--test-image', help='Path to test image')
    parser.add_argument('--api-url', default='http://localhost:8000', help='API base URL')
    parser.add_argument('--skip-api', action='store_true', help='Skip API tests')
    parser.add_argument('--performance', type=int, default=10, help='Number of images for performance test')
    parser.add_argument('--visualize', action='store_true', help='Create visualizations')
    
    args = parser.parse_args()
    
    logger.info("🚀 Starting civic issue detection model tests...")
    
    # Test model loading
    detector = test_model_loading()
    if detector is None:
        logger.error("Cannot proceed without a working model")
        return 1
    
    # Test image detection
    test_image_detection(detector, args.test_image)
    
    # Test category verification
    test_category_verification(detector)
    
    # Test performance
    if args.performance > 0:
        test_performance(detector, args.performance)
    
    # Test API endpoints
    if not args.skip_api:
        test_api_endpoints(args.api_url)
    
    # Create visualizations
    if args.visualize:
        create_visualization(detector)
    
    logger.info("🎉 All tests completed!")
    return 0

if __name__ == "__main__":
    exit(main())
"""
Civic Issue Detection Model
A YOLO-based model for detecting civic issues in images
"""

import torch
import torch.nn as nn
from ultralytics import YOLO
import cv2
import numpy as np
from PIL import Image
import os
from typing import List, Dict, Tuple, Optional
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CivicIssueDetector:
    """
    Main class for civic issue detection using YOLO
    """
    
    def __init__(self, model_path: Optional[str] = None, device: str = 'auto'):
        """
        Initialize the civic issue detector
        
        Args:
            model_path: Path to trained model weights
            device: Device to run inference on ('cpu', 'cuda', 'auto')
        """
        self.device = self._get_device(device)
        self.model = None
        self.class_names = self._get_class_names()
        self.confidence_threshold = 0.25
        self.iou_threshold = 0.45
        
        if model_path and os.path.exists(model_path):
            self.load_model(model_path)
        else:
            # Use pre-trained YOLO model as base
            self.model = YOLO('yolov8n.pt')
            logger.info("Loaded pre-trained YOLOv8 model")
    
    def _get_device(self, device: str) -> str:
        """Get the appropriate device for inference"""
        if device == 'auto':
            return 'cuda' if torch.cuda.is_available() else 'cpu'
        return device
    
    def _get_class_names(self) -> Dict[int, str]:
        """Define class names for civic issues"""
        return {
            0: 'pothole',
            1: 'garbage',
            2: 'broken_streetlight',
            3: 'water_leak',
            4: 'damaged_road',
            5: 'broken_sidewalk',
            6: 'graffiti',
            7: 'damaged_sign',
            8: 'blocked_drain',
            9: 'illegal_dumping',
            10: 'damaged_fence',
            11: 'broken_bench',
            12: 'overgrown_vegetation',
            13: 'damaged_building',
            14: 'construction_debris'
        }
    
    def load_model(self, model_path: str):
        """Load a trained model from file"""
        try:
            self.model = YOLO(model_path)
            logger.info(f"Loaded model from {model_path}")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise
    
    def preprocess_image(self, image_input) -> np.ndarray:
        """
        Preprocess image for inference
        
        Args:
            image_input: PIL Image, numpy array, or file path
            
        Returns:
            Preprocessed image as numpy array
        """
        if isinstance(image_input, str):
            # File path
            image = cv2.imread(image_input)
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        elif isinstance(image_input, Image.Image):
            # PIL Image
            image = np.array(image_input)
        elif isinstance(image_input, np.ndarray):
            # Numpy array
            image = image_input
        else:
            raise ValueError("Unsupported image input type")
        
        return image
    
    def detect(self, image_input, confidence: float = None, iou: float = None) -> List[Dict]:
        """
        Detect civic issues in an image
        
        Args:
            image_input: Image to analyze
            confidence: Confidence threshold (optional)
            iou: IoU threshold for NMS (optional)
            
        Returns:
            List of detections with bounding boxes and confidence scores
        """
        if self.model is None:
            raise ValueError("Model not loaded")
        
        # Use provided thresholds or defaults
        conf_thresh = confidence if confidence is not None else self.confidence_threshold
        iou_thresh = iou if iou is not None else self.iou_threshold
        
        # Preprocess image
        image = self.preprocess_image(image_input)
        
        # Run inference
        results = self.model(image, conf=conf_thresh, iou=iou_thresh, verbose=False)
        
        # Parse results
        detections = []
        for result in results:
            boxes = result.boxes
            if boxes is not None:
                for box in boxes:
                    # Extract box coordinates
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    confidence = box.conf[0].cpu().numpy()
                    class_id = int(box.cls[0].cpu().numpy())
                    
                    # Map class ID to class name
                    class_name = self.class_names.get(class_id, f'unknown_{class_id}')
                    
                    detection = {
                        'class': class_name,
                        'confidence': float(confidence),
                        'bbox': {
                            'x1': float(x1),
                            'y1': float(y1),
                            'x2': float(x2),
                            'y2': float(y2),
                            'width': float(x2 - x1),
                            'height': float(y2 - y1)
                        }
                    }
                    detections.append(detection)
        
        return detections
    
    def verify_category(self, image_input, expected_category: str) -> Dict:
        """
        Verify if an image matches the expected civic issue category
        
        Args:
            image_input: Image to verify
            expected_category: Expected category name
            
        Returns:
            Verification result with confidence and suggestions
        """
        detections = self.detect(image_input)
        
        if not detections:
            return {
                'is_valid': False,
                'confidence': 0.0,
                'message': 'No civic issues detected in the image',
                'detections': [],
                'suggested_category': None
            }
        
        # Find best matching detection
        best_detection = max(detections, key=lambda x: x['confidence'])
        detected_class = best_detection['class']
        
        # Category mapping for verification
        category_mappings = {
            'road': ['pothole', 'damaged_road', 'broken_sidewalk'],
            'waste': ['garbage', 'illegal_dumping'],
            'water': ['water_leak', 'blocked_drain'],
            'electricity': ['broken_streetlight'],
            'infrastructure': ['damaged_sign', 'damaged_fence', 'broken_bench', 'damaged_building'],
            'safety': ['graffiti', 'construction_debris'],
            'environment': ['overgrown_vegetation']
        }
        
        # Check if detected class matches expected category
        expected_classes = category_mappings.get(expected_category.lower(), [])
        is_valid = detected_class in expected_classes
        
        # Find suggested category if not valid
        suggested_category = None
        if not is_valid:
            for category, classes in category_mappings.items():
                if detected_class in classes:
                    suggested_category = category
                    break
        
        message = f"Detected {detected_class} with {best_detection['confidence']:.1%} confidence"
        if is_valid:
            message += f" - matches {expected_category} category"
        elif suggested_category:
            message += f" - suggests {suggested_category} category instead"
        else:
            message += " - no matching category found"
        
        return {
            'is_valid': is_valid,
            'confidence': best_detection['confidence'],
            'message': message,
            'detections': detections,
            'suggested_category': suggested_category
        }
    
    def batch_detect(self, image_paths: List[str]) -> List[List[Dict]]:
        """
        Detect civic issues in multiple images
        
        Args:
            image_paths: List of image file paths
            
        Returns:
            List of detection results for each image
        """
        results = []
        for image_path in image_paths:
            try:
                detections = self.detect(image_path)
                results.append(detections)
            except Exception as e:
                logger.error(f"Error processing {image_path}: {e}")
                results.append([])
        
        return results
    
    def visualize_detections(self, image_input, detections: List[Dict], save_path: str = None) -> np.ndarray:
        """
        Visualize detections on an image
        
        Args:
            image_input: Input image
            detections: List of detections
            save_path: Optional path to save the visualization
            
        Returns:
            Image with drawn bounding boxes
        """
        image = self.preprocess_image(image_input).copy()
        
        # Colors for different classes
        colors = [
            (255, 0, 0), (0, 255, 0), (0, 0, 255), (255, 255, 0),
            (255, 0, 255), (0, 255, 255), (128, 0, 0), (0, 128, 0),
            (0, 0, 128), (128, 128, 0), (128, 0, 128), (0, 128, 128),
            (192, 192, 192), (128, 128, 128), (255, 165, 0)
        ]
        
        for i, detection in enumerate(detections):
            bbox = detection['bbox']
            class_name = detection['class']
            confidence = detection['confidence']
            
            # Get color for this class
            color = colors[i % len(colors)]
            
            # Draw bounding box
            x1, y1 = int(bbox['x1']), int(bbox['y1'])
            x2, y2 = int(bbox['x2']), int(bbox['y2'])
            
            cv2.rectangle(image, (x1, y1), (x2, y2), color, 2)
            
            # Draw label
            label = f"{class_name}: {confidence:.2f}"
            label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2)[0]
            
            cv2.rectangle(image, (x1, y1 - label_size[1] - 10), 
                         (x1 + label_size[0], y1), color, -1)
            cv2.putText(image, label, (x1, y1 - 5), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
        
        if save_path:
            cv2.imwrite(save_path, cv2.cvtColor(image, cv2.COLOR_RGB2BGR))
        
        return image
    
    def get_model_info(self) -> Dict:
        """Get information about the loaded model"""
        if self.model is None:
            return {'status': 'No model loaded'}
        
        return {
            'status': 'Model loaded',
            'device': self.device,
            'classes': list(self.class_names.values()),
            'num_classes': len(self.class_names),
            'confidence_threshold': self.confidence_threshold,
            'iou_threshold': self.iou_threshold
        }


class ModelTrainer:
    """
    Class for training custom civic issue detection models
    """
    
    def __init__(self, data_path: str, model_name: str = 'yolov8n.pt'):
        """
        Initialize the model trainer
        
        Args:
            data_path: Path to training data directory
            model_name: Base model to use for training
        """
        self.data_path = Path(data_path)
        self.model_name = model_name
        self.model = YOLO(model_name)
        
    def prepare_dataset(self, train_ratio: float = 0.8, val_ratio: float = 0.1):
        """
        Prepare dataset for training
        
        Args:
            train_ratio: Ratio of data for training
            val_ratio: Ratio of data for validation (rest goes to test)
        """
        # This would implement dataset preparation logic
        # For now, we assume data is already in YOLO format
        logger.info(f"Dataset prepared at {self.data_path}")
    
    def train(self, epochs: int = 100, imgsz: int = 640, batch_size: int = 16, **kwargs):
        """
        Train the model
        
        Args:
            epochs: Number of training epochs
            imgsz: Image size for training
            batch_size: Batch size
            **kwargs: Additional training parameters
        """
        # Create data.yaml file
        data_yaml = self.data_path / 'data.yaml'
        
        if not data_yaml.exists():
            self._create_data_yaml()
        
        # Train the model
        results = self.model.train(
            data=str(data_yaml),
            epochs=epochs,
            imgsz=imgsz,
            batch=batch_size,
            **kwargs
        )
        
        return results
    
    def _create_data_yaml(self):
        """Create data.yaml file for training"""
        class_names = [
            'pothole', 'garbage', 'broken_streetlight', 'water_leak',
            'damaged_road', 'broken_sidewalk', 'graffiti', 'damaged_sign',
            'blocked_drain', 'illegal_dumping', 'damaged_fence', 'broken_bench',
            'overgrown_vegetation', 'damaged_building', 'construction_debris'
        ]
        
        data_yaml_content = f"""
# Civic Issue Detection Dataset
path: {self.data_path}
train: images/train
val: images/val
test: images/test

# Classes
nc: {len(class_names)}
names: {class_names}
"""
        
        with open(self.data_path / 'data.yaml', 'w') as f:
            f.write(data_yaml_content.strip())
        
        logger.info("Created data.yaml file")
    
    def validate(self):
        """Validate the trained model"""
        return self.model.val()
    
    def export(self, format: str = 'onnx'):
        """Export the model to different formats"""
        return self.model.export(format=format)


# Utility functions
def download_sample_data():
    """Download sample civic issue images for testing"""
    # This would implement downloading sample data
    # For now, we'll create placeholder directories
    
    data_dir = Path('data/civic_issues')
    for split in ['train', 'val', 'test']:
        (data_dir / 'images' / split).mkdir(parents=True, exist_ok=True)
        (data_dir / 'labels' / split).mkdir(parents=True, exist_ok=True)
    
    logger.info(f"Created data directories at {data_dir}")
    return data_dir


if __name__ == "__main__":
    # Example usage
    detector = CivicIssueDetector()
    
    # Print model info
    print("Model Info:", detector.get_model_info())
    
    # Example detection (would need actual image)
    # detections = detector.detect('path/to/image.jpg')
    # print("Detections:", detections)
    
    # Example verification
    # result = detector.verify_category('path/to/image.jpg', 'road')
    # print("Verification:", result)
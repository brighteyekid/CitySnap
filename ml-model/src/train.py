"""
Training script for civic issue detection model
"""

import argparse
import os
import yaml
from pathlib import Path
import logging
from datetime import datetime
import json

from model import ModelTrainer, download_sample_data
from data_preparation import DatasetPreparer

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_training_config():
    """Create default training configuration"""
    config = {
        'model': {
            'base_model': 'yolov8n.pt',  # Can be yolov8n.pt, yolov8s.pt, yolov8m.pt, yolov8l.pt, yolov8x.pt
            'input_size': 640,
            'confidence_threshold': 0.25,
            'iou_threshold': 0.45
        },
        'training': {
            'epochs': 100,
            'batch_size': 16,
            'learning_rate': 0.01,
            'patience': 50,  # Early stopping patience
            'save_period': 10,  # Save model every N epochs
            'workers': 8,
            'device': 'auto'  # 'cpu', 'cuda', or 'auto'
        },
        'data': {
            'train_ratio': 0.8,
            'val_ratio': 0.1,
            'test_ratio': 0.1,
            'augmentation': True,
            'cache': True
        },
        'classes': [
            'pothole',
            'garbage',
            'broken_streetlight',
            'water_leak',
            'damaged_road',
            'broken_sidewalk',
            'graffiti',
            'damaged_sign',
            'blocked_drain',
            'illegal_dumping',
            'damaged_fence',
            'broken_bench',
            'overgrown_vegetation',
            'damaged_building',
            'construction_debris'
        ]
    }
    return config

def setup_training_environment(data_path: str, output_path: str):
    """Set up the training environment"""
    data_path = Path(data_path)
    output_path = Path(output_path)
    
    # Create directories
    output_path.mkdir(parents=True, exist_ok=True)
    (output_path / 'runs').mkdir(exist_ok=True)
    (output_path / 'models').mkdir(exist_ok=True)
    (output_path / 'logs').mkdir(exist_ok=True)
    
    # Create training config
    config = create_training_config()
    config_path = output_path / 'training_config.yaml'
    
    with open(config_path, 'w') as f:
        yaml.dump(config, f, default_flow_style=False)
    
    logger.info(f"Training environment set up at {output_path}")
    logger.info(f"Configuration saved to {config_path}")
    
    return config_path

def train_model(data_path: str, config_path: str, output_path: str):
    """Train the civic issue detection model"""
    
    # Load configuration
    with open(config_path, 'r') as f:
        config = yaml.safe_load(f)
    
    data_path = Path(data_path)
    output_path = Path(output_path)
    
    # Initialize trainer
    trainer = ModelTrainer(
        data_path=str(data_path),
        model_name=config['model']['base_model']
    )
    
    # Prepare dataset if needed
    if not (data_path / 'data.yaml').exists():
        logger.info("Preparing dataset...")
        trainer.prepare_dataset(
            train_ratio=config['data']['train_ratio'],
            val_ratio=config['data']['val_ratio']
        )
    
    # Training parameters
    train_params = {
        'epochs': config['training']['epochs'],
        'imgsz': config['model']['input_size'],
        'batch': config['training']['batch_size'],
        'lr0': config['training']['learning_rate'],
        'patience': config['training']['patience'],
        'save_period': config['training']['save_period'],
        'workers': config['training']['workers'],
        'device': config['training']['device'],
        'project': str(output_path / 'runs'),
        'name': f'civic_detection_{datetime.now().strftime("%Y%m%d_%H%M%S")}',
        'exist_ok': True,
        'pretrained': True,
        'optimizer': 'SGD',
        'verbose': True,
        'seed': 42,
        'deterministic': True,
        'single_cls': False,
        'rect': False,
        'cos_lr': False,
        'close_mosaic': 10,
        'resume': False,
        'amp': True,  # Automatic Mixed Precision
        'fraction': 1.0,
        'profile': False,
        'freeze': None,
        'multi_scale': False,
        'overlap_mask': True,
        'mask_ratio': 4,
        'dropout': 0.0,
        'val': True,
        'split': 'val',
        'save_json': True,
        'save_hybrid': False,
        'conf': None,
        'iou': 0.6,
        'max_det': 300,
        'half': False,
        'dnn': False,
        'plots': True,
        'source': None,
        'vid_stride': 1,
        'stream_buffer': False,
        'visualize': False,
        'augment': False,
        'agnostic_nms': False,
        'classes': None,
        'retina_masks': False,
        'boxes': True,
        'format': 'torchscript',
        'keras': False,
        'optimize': False,
        'int8': False,
        'dynamic': False,
        'simplify': False,
        'opset': None,
        'workspace': 4,
        'nms': False,
        'lr0': config['training']['learning_rate'],
        'lrf': 0.01,
        'momentum': 0.937,
        'weight_decay': 0.0005,
        'warmup_epochs': 3.0,
        'warmup_momentum': 0.8,
        'warmup_bias_lr': 0.1,
        'box': 7.5,
        'cls': 0.5,
        'dfl': 1.5,
        'pose': 12.0,
        'kobj': 1.0,
        'label_smoothing': 0.0,
        'nbs': 64,
        'hsv_h': 0.015,
        'hsv_s': 0.7,
        'hsv_v': 0.4,
        'degrees': 0.0,
        'translate': 0.1,
        'scale': 0.5,
        'shear': 0.0,
        'perspective': 0.0,
        'flipud': 0.0,
        'fliplr': 0.5,
        'mosaic': 1.0,
        'mixup': 0.0,
        'copy_paste': 0.0
    }
    
    logger.info("Starting training...")
    logger.info(f"Training parameters: {json.dumps(train_params, indent=2)}")
    
    # Start training
    try:
        results = trainer.train(**train_params)
        logger.info("Training completed successfully!")
        
        # Validate the model
        logger.info("Running validation...")
        val_results = trainer.validate()
        
        # Export the model
        logger.info("Exporting model...")
        export_results = trainer.export(format='onnx')
        
        # Save training summary
        summary = {
            'training_completed': datetime.now().isoformat(),
            'config': config,
            'training_params': train_params,
            'results': str(results),
            'validation_results': str(val_results),
            'export_results': str(export_results)
        }
        
        summary_path = output_path / 'training_summary.json'
        with open(summary_path, 'w') as f:
            json.dump(summary, f, indent=2)
        
        logger.info(f"Training summary saved to {summary_path}")
        
        return results
        
    except Exception as e:
        logger.error(f"Training failed: {e}")
        raise

def evaluate_model(model_path: str, test_data_path: str):
    """Evaluate the trained model"""
    from model import CivicIssueDetector
    
    logger.info(f"Evaluating model: {model_path}")
    
    # Load the model
    detector = CivicIssueDetector(model_path=model_path)
    
    # Run evaluation on test data
    test_path = Path(test_data_path)
    test_images = list(test_path.glob('**/*.jpg')) + list(test_path.glob('**/*.png'))
    
    if not test_images:
        logger.warning("No test images found")
        return
    
    logger.info(f"Found {len(test_images)} test images")
    
    # Run batch detection
    results = detector.batch_detect([str(img) for img in test_images[:10]])  # Limit for demo
    
    # Calculate metrics
    total_detections = sum(len(result) for result in results)
    avg_detections = total_detections / len(results) if results else 0
    
    logger.info(f"Evaluation completed:")
    logger.info(f"  - Total images processed: {len(results)}")
    logger.info(f"  - Total detections: {total_detections}")
    logger.info(f"  - Average detections per image: {avg_detections:.2f}")
    
    return results

def main():
    parser = argparse.ArgumentParser(description='Train civic issue detection model')
    parser.add_argument('--data', type=str, required=True, help='Path to training data')
    parser.add_argument('--output', type=str, default='./output', help='Output directory')
    parser.add_argument('--config', type=str, help='Path to training config file')
    parser.add_argument('--download-sample', action='store_true', help='Download sample data')
    parser.add_argument('--evaluate', type=str, help='Path to model for evaluation')
    parser.add_argument('--test-data', type=str, help='Path to test data for evaluation')
    
    args = parser.parse_args()
    
    try:
        if args.download_sample:
            logger.info("Downloading sample data...")
            data_path = download_sample_data()
            logger.info(f"Sample data downloaded to {data_path}")
            return
        
        if args.evaluate:
            if not args.test_data:
                logger.error("Test data path required for evaluation")
                return
            evaluate_model(args.evaluate, args.test_data)
            return
        
        # Set up training environment
        if not args.config:
            config_path = setup_training_environment(args.data, args.output)
        else:
            config_path = args.config
        
        # Train the model
        train_model(args.data, config_path, args.output)
        
        logger.info("Training pipeline completed successfully!")
        
    except Exception as e:
        logger.error(f"Training pipeline failed: {e}")
        raise

if __name__ == "__main__":
    main()
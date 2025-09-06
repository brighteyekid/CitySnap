#!/usr/bin/env python3
"""
Download pre-trained models for civic issue detection
"""

import os
import requests
from pathlib import Path
import logging
from tqdm import tqdm
import hashlib

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Model configurations
MODELS = {
    'yolov8n': {
        'url': 'https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.pt',
        'filename': 'yolov8n.pt',
        'size': '6.2MB',
        'description': 'Nano model - fastest inference, lowest accuracy'
    },
    'yolov8s': {
        'url': 'https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8s.pt',
        'filename': 'yolov8s.pt',
        'size': '21.5MB',
        'description': 'Small model - good balance of speed and accuracy'
    },
    'yolov8m': {
        'url': 'https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8m.pt',
        'filename': 'yolov8m.pt',
        'size': '49.7MB',
        'description': 'Medium model - higher accuracy, slower inference'
    },
    'yolov8l': {
        'url': 'https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8l.pt',
        'filename': 'yolov8l.pt',
        'size': '83.7MB',
        'description': 'Large model - high accuracy, slow inference'
    },
    'yolov8x': {
        'url': 'https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8x.pt',
        'filename': 'yolov8x.pt',
        'size': '136.7MB',
        'description': 'Extra large model - highest accuracy, slowest inference'
    }
}

def download_file(url: str, filepath: Path, description: str = ""):
    """Download a file with progress bar"""
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        total_size = int(response.headers.get('content-length', 0))
        
        with open(filepath, 'wb') as f, tqdm(
            desc=description,
            total=total_size,
            unit='B',
            unit_scale=True,
            unit_divisor=1024,
        ) as pbar:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
                    pbar.update(len(chunk))
        
        logger.info(f"Downloaded {filepath.name} successfully")
        return True
        
    except Exception as e:
        logger.error(f"Failed to download {url}: {e}")
        if filepath.exists():
            filepath.unlink()
        return False

def verify_file(filepath: Path, expected_size: str = None):
    """Verify downloaded file"""
    if not filepath.exists():
        return False
    
    file_size = filepath.stat().st_size
    logger.info(f"File size: {file_size / (1024*1024):.1f}MB")
    
    # Basic verification - file exists and has reasonable size
    if file_size < 1024 * 1024:  # Less than 1MB is suspicious
        logger.warning(f"File {filepath.name} seems too small")
        return False
    
    return True

def download_models(models_to_download: list = None, models_dir: str = "models"):
    """Download specified models or all models"""
    models_dir = Path(models_dir)
    models_dir.mkdir(exist_ok=True)
    
    if models_to_download is None:
        models_to_download = ['yolov8n']  # Default to nano model
    
    success_count = 0
    
    for model_name in models_to_download:
        if model_name not in MODELS:
            logger.error(f"Unknown model: {model_name}")
            continue
        
        model_info = MODELS[model_name]
        filepath = models_dir / model_info['filename']
        
        logger.info(f"Downloading {model_name} ({model_info['size']})")
        logger.info(f"Description: {model_info['description']}")
        
        # Skip if already exists and valid
        if filepath.exists() and verify_file(filepath):
            logger.info(f"{model_name} already exists and appears valid")
            success_count += 1
            continue
        
        # Download the model
        if download_file(model_info['url'], filepath, f"Downloading {model_name}"):
            if verify_file(filepath, model_info['size']):
                success_count += 1
                logger.info(f"✅ {model_name} downloaded and verified")
            else:
                logger.error(f"❌ {model_name} download verification failed")
        else:
            logger.error(f"❌ {model_name} download failed")
    
    logger.info(f"Downloaded {success_count}/{len(models_to_download)} models successfully")
    return success_count == len(models_to_download)

def create_model_info():
    """Create model information file"""
    info = {
        'models': MODELS,
        'usage': {
            'yolov8n': 'Best for real-time applications, mobile deployment',
            'yolov8s': 'Good balance for most applications',
            'yolov8m': 'Better accuracy for server deployment',
            'yolov8l': 'High accuracy applications',
            'yolov8x': 'Maximum accuracy, research use'
        },
        'recommendations': {
            'development': 'yolov8n',
            'production_fast': 'yolov8s',
            'production_accurate': 'yolov8m',
            'research': 'yolov8x'
        }
    }
    
    import json
    with open('models/model_info.json', 'w') as f:
        json.dump(info, f, indent=2)
    
    logger.info("Created model_info.json")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Download pre-trained YOLO models')
    parser.add_argument('--models', nargs='+', choices=list(MODELS.keys()), 
                       default=['yolov8n'], help='Models to download')
    parser.add_argument('--all', action='store_true', help='Download all models')
    parser.add_argument('--dir', default='models', help='Directory to save models')
    
    args = parser.parse_args()
    
    if args.all:
        models_to_download = list(MODELS.keys())
    else:
        models_to_download = args.models
    
    logger.info("Starting model download...")
    logger.info(f"Models to download: {', '.join(models_to_download)}")
    
    success = download_models(models_to_download, args.dir)
    
    # Create model info file
    create_model_info()
    
    if success:
        logger.info("🎉 All models downloaded successfully!")
        logger.info("You can now start training or use the models for inference")
    else:
        logger.error("❌ Some models failed to download")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
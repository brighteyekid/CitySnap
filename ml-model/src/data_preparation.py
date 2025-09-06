"""
Data preparation utilities for civic issue detection
"""

import os
import json
import shutil
import random
from pathlib import Path
from typing import List, Dict, Tuple
import logging
import requests
from PIL import Image
import cv2
import numpy as np
from tqdm import tqdm
import xml.etree.ElementTree as ET

logger = logging.getLogger(__name__)

class DatasetPreparer:
    """
    Utility class for preparing civic issue detection datasets
    """
    
    def __init__(self, output_dir: str):
        self.output_dir = Path(output_dir)
        self.classes = [
            'pothole', 'garbage', 'broken_streetlight', 'water_leak',
            'damaged_road', 'broken_sidewalk', 'graffiti', 'damaged_sign',
            'blocked_drain', 'illegal_dumping', 'damaged_fence', 'broken_bench',
            'overgrown_vegetation', 'damaged_building', 'construction_debris'
        ]
        self.class_to_id = {cls: i for i, cls in enumerate(self.classes)}
        
    def create_directory_structure(self):
        """Create YOLO dataset directory structure"""
        for split in ['train', 'val', 'test']:
            (self.output_dir / 'images' / split).mkdir(parents=True, exist_ok=True)
            (self.output_dir / 'labels' / split).mkdir(parents=True, exist_ok=True)
        
        logger.info(f"Created directory structure at {self.output_dir}")
    
    def create_data_yaml(self):
        """Create data.yaml file for YOLO training"""
        data_yaml = {
            'path': str(self.output_dir.absolute()),
            'train': 'images/train',
            'val': 'images/val',
            'test': 'images/test',
            'nc': len(self.classes),
            'names': self.classes
        }
        
        with open(self.output_dir / 'data.yaml', 'w') as f:
            import yaml
            yaml.dump(data_yaml, f, default_flow_style=False)
        
        logger.info("Created data.yaml file")
    
    def convert_coco_to_yolo(self, coco_json_path: str, images_dir: str, split: str = 'train'):
        """
        Convert COCO format annotations to YOLO format
        
        Args:
            coco_json_path: Path to COCO annotations JSON file
            images_dir: Directory containing images
            split: Dataset split (train/val/test)
        """
        with open(coco_json_path, 'r') as f:
            coco_data = json.load(f)
        
        # Create category mapping
        coco_categories = {cat['id']: cat['name'] for cat in coco_data['categories']}
        
        # Process annotations
        image_annotations = {}
        for ann in coco_data['annotations']:
            image_id = ann['image_id']
            if image_id not in image_annotations:
                image_annotations[image_id] = []
            image_annotations[image_id].append(ann)
        
        # Process images
        for img_info in tqdm(coco_data['images'], desc=f"Converting {split} images"):
            image_id = img_info['id']
            filename = img_info['file_name']
            width = img_info['width']
            height = img_info['height']
            
            # Copy image
            src_path = Path(images_dir) / filename
            dst_path = self.output_dir / 'images' / split / filename
            
            if src_path.exists():
                shutil.copy2(src_path, dst_path)
                
                # Create YOLO annotation
                yolo_annotations = []
                if image_id in image_annotations:
                    for ann in image_annotations[image_id]:
                        category_name = coco_categories[ann['category_id']]
                        if category_name in self.class_to_id:
                            class_id = self.class_to_id[category_name]
                            
                            # Convert bbox to YOLO format
                            x, y, w, h = ann['bbox']
                            x_center = (x + w/2) / width
                            y_center = (y + h/2) / height
                            w_norm = w / width
                            h_norm = h / height
                            
                            yolo_annotations.append(f"{class_id} {x_center} {y_center} {w_norm} {h_norm}")
                
                # Save YOLO annotation file
                label_path = self.output_dir / 'labels' / split / f"{Path(filename).stem}.txt"
                with open(label_path, 'w') as f:
                    f.write('\n'.join(yolo_annotations))
        
        logger.info(f"Converted {len(coco_data['images'])} images for {split} split")
    
    def convert_pascal_voc_to_yolo(self, annotations_dir: str, images_dir: str, split: str = 'train'):
        """
        Convert Pascal VOC format annotations to YOLO format
        
        Args:
            annotations_dir: Directory containing XML annotation files
            images_dir: Directory containing images
            split: Dataset split (train/val/test)
        """
        annotations_dir = Path(annotations_dir)
        images_dir = Path(images_dir)
        
        xml_files = list(annotations_dir.glob('*.xml'))
        
        for xml_file in tqdm(xml_files, desc=f"Converting {split} annotations"):
            tree = ET.parse(xml_file)
            root = tree.getroot()
            
            # Get image info
            filename = root.find('filename').text
            size = root.find('size')
            width = int(size.find('width').text)
            height = int(size.find('height').text)
            
            # Copy image
            src_path = images_dir / filename
            dst_path = self.output_dir / 'images' / split / filename
            
            if src_path.exists():
                shutil.copy2(src_path, dst_path)
                
                # Process objects
                yolo_annotations = []
                for obj in root.findall('object'):
                    class_name = obj.find('name').text
                    if class_name in self.class_to_id:
                        class_id = self.class_to_id[class_name]
                        
                        # Get bounding box
                        bbox = obj.find('bndbox')
                        xmin = int(bbox.find('xmin').text)
                        ymin = int(bbox.find('ymin').text)
                        xmax = int(bbox.find('xmax').text)
                        ymax = int(bbox.find('ymax').text)
                        
                        # Convert to YOLO format
                        x_center = (xmin + xmax) / 2 / width
                        y_center = (ymin + ymax) / 2 / height
                        w_norm = (xmax - xmin) / width
                        h_norm = (ymax - ymin) / height
                        
                        yolo_annotations.append(f"{class_id} {x_center} {y_center} {w_norm} {h_norm}")
                
                # Save YOLO annotation file
                label_path = self.output_dir / 'labels' / split / f"{Path(filename).stem}.txt"
                with open(label_path, 'w') as f:
                    f.write('\n'.join(yolo_annotations))
        
        logger.info(f"Converted {len(xml_files)} annotations for {split} split")
    
    def split_dataset(self, images_dir: str, train_ratio: float = 0.8, val_ratio: float = 0.1):
        """
        Split dataset into train/val/test sets
        
        Args:
            images_dir: Directory containing all images
            train_ratio: Ratio for training set
            val_ratio: Ratio for validation set (rest goes to test)
        """
        images_dir = Path(images_dir)
        all_images = list(images_dir.glob('*.jpg')) + list(images_dir.glob('*.png'))
        
        # Shuffle images
        random.shuffle(all_images)
        
        # Calculate split indices
        total = len(all_images)
        train_end = int(total * train_ratio)
        val_end = train_end + int(total * val_ratio)
        
        # Split images
        train_images = all_images[:train_end]
        val_images = all_images[train_end:val_end]
        test_images = all_images[val_end:]
        
        splits = {
            'train': train_images,
            'val': val_images,
            'test': test_images
        }
        
        for split, images in splits.items():
            logger.info(f"Moving {len(images)} images to {split} split")
            for img_path in tqdm(images, desc=f"Moving {split} images"):
                # Copy image
                dst_img = self.output_dir / 'images' / split / img_path.name
                shutil.copy2(img_path, dst_img)
                
                # Copy corresponding label if exists
                label_path = img_path.parent / 'labels' / f"{img_path.stem}.txt"
                if label_path.exists():
                    dst_label = self.output_dir / 'labels' / split / f"{img_path.stem}.txt"
                    shutil.copy2(label_path, dst_label)
    
    def augment_dataset(self, split: str = 'train', augmentation_factor: int = 2):
        """
        Apply data augmentation to increase dataset size
        
        Args:
            split: Dataset split to augment
            augmentation_factor: How many augmented versions to create per image
        """
        import albumentations as A
        
        # Define augmentation pipeline
        transform = A.Compose([
            A.HorizontalFlip(p=0.5),
            A.RandomBrightnessContrast(p=0.3),
            A.RandomGamma(p=0.3),
            A.GaussNoise(p=0.2),
            A.Blur(blur_limit=3, p=0.2),
            A.RandomRotate90(p=0.2),
            A.ShiftScaleRotate(shift_limit=0.1, scale_limit=0.1, rotate_limit=15, p=0.3),
        ], bbox_params=A.BboxParams(format='yolo', label_fields=['class_labels']))
        
        images_dir = self.output_dir / 'images' / split
        labels_dir = self.output_dir / 'labels' / split
        
        image_files = list(images_dir.glob('*.jpg')) + list(images_dir.glob('*.png'))
        
        for img_path in tqdm(image_files, desc=f"Augmenting {split} images"):
            # Load image
            image = cv2.imread(str(img_path))
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Load corresponding label
            label_path = labels_dir / f"{img_path.stem}.txt"
            bboxes = []
            class_labels = []
            
            if label_path.exists():
                with open(label_path, 'r') as f:
                    for line in f:
                        parts = line.strip().split()
                        if len(parts) == 5:
                            class_id = int(parts[0])
                            x_center, y_center, width, height = map(float, parts[1:])
                            bboxes.append([x_center, y_center, width, height])
                            class_labels.append(class_id)
            
            # Generate augmented versions
            for i in range(augmentation_factor):
                try:
                    # Apply augmentation
                    augmented = transform(image=image, bboxes=bboxes, class_labels=class_labels)
                    aug_image = augmented['image']
                    aug_bboxes = augmented['bboxes']
                    aug_labels = augmented['class_labels']
                    
                    # Save augmented image
                    aug_img_name = f"{img_path.stem}_aug_{i}{img_path.suffix}"
                    aug_img_path = images_dir / aug_img_name
                    
                    aug_image_bgr = cv2.cvtColor(aug_image, cv2.COLOR_RGB2BGR)
                    cv2.imwrite(str(aug_img_path), aug_image_bgr)
                    
                    # Save augmented labels
                    aug_label_path = labels_dir / f"{img_path.stem}_aug_{i}.txt"
                    with open(aug_label_path, 'w') as f:
                        for bbox, label in zip(aug_bboxes, aug_labels):
                            x_center, y_center, width, height = bbox
                            f.write(f"{label} {x_center} {y_center} {width} {height}\n")
                
                except Exception as e:
                    logger.warning(f"Failed to augment {img_path}: {e}")
        
        logger.info(f"Augmentation completed for {split} split")
    
    def validate_dataset(self):
        """Validate the prepared dataset"""
        issues = []
        
        for split in ['train', 'val', 'test']:
            images_dir = self.output_dir / 'images' / split
            labels_dir = self.output_dir / 'labels' / split
            
            image_files = list(images_dir.glob('*.jpg')) + list(images_dir.glob('*.png'))
            label_files = list(labels_dir.glob('*.txt'))
            
            logger.info(f"{split} split: {len(image_files)} images, {len(label_files)} labels")
            
            # Check for missing labels
            for img_path in image_files:
                label_path = labels_dir / f"{img_path.stem}.txt"
                if not label_path.exists():
                    issues.append(f"Missing label for {img_path}")
            
            # Check for invalid annotations
            for label_path in label_files:
                try:
                    with open(label_path, 'r') as f:
                        for line_num, line in enumerate(f, 1):
                            parts = line.strip().split()
                            if len(parts) != 5:
                                issues.append(f"Invalid annotation in {label_path}:{line_num}")
                                continue
                            
                            class_id = int(parts[0])
                            coords = list(map(float, parts[1:]))
                            
                            if class_id < 0 or class_id >= len(self.classes):
                                issues.append(f"Invalid class ID {class_id} in {label_path}:{line_num}")
                            
                            if any(c < 0 or c > 1 for c in coords):
                                issues.append(f"Invalid coordinates in {label_path}:{line_num}")
                
                except Exception as e:
                    issues.append(f"Error reading {label_path}: {e}")
        
        if issues:
            logger.warning(f"Found {len(issues)} validation issues:")
            for issue in issues[:10]:  # Show first 10 issues
                logger.warning(f"  - {issue}")
            if len(issues) > 10:
                logger.warning(f"  ... and {len(issues) - 10} more issues")
        else:
            logger.info("Dataset validation passed!")
        
        return len(issues) == 0

def download_sample_civic_data():
    """Download sample civic issue images for training"""
    # This is a placeholder - in practice, you would download from actual sources
    # For now, we'll create a sample structure
    
    output_dir = Path('data/civic_issues_sample')
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Create sample directory structure
    for category in ['potholes', 'garbage', 'streetlights', 'water_leaks']:
        (output_dir / category).mkdir(exist_ok=True)
    
    logger.info(f"Sample data structure created at {output_dir}")
    logger.info("Note: This is a placeholder. In practice, you would:")
    logger.info("1. Collect real civic issue images")
    logger.info("2. Annotate them with bounding boxes")
    logger.info("3. Convert to YOLO format")
    
    return output_dir

if __name__ == "__main__":
    # Example usage
    preparer = DatasetPreparer('data/civic_detection_dataset')
    preparer.create_directory_structure()
    preparer.create_data_yaml()
    
    # Download sample data
    sample_data = download_sample_civic_data()
    
    logger.info("Data preparation utilities ready!")
    logger.info("To use:")
    logger.info("1. Collect and annotate your civic issue images")
    logger.info("2. Use convert_coco_to_yolo() or convert_pascal_voc_to_yolo()")
    logger.info("3. Run augment_dataset() to increase data size")
    logger.info("4. Run validate_dataset() to check for issues")
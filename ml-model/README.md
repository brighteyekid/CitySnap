# Civic Issue Detection ML Model

This directory contains the machine learning model for detecting civic issues in images. The model is based on YOLOv8 and can detect various types of civic problems like potholes, garbage, broken streetlights, water leaks, and more.

## Features

- **Real-time Detection**: Fast inference using YOLOv8
- **Multiple Issue Types**: Detects 15+ different civic issue categories
- **Category Verification**: Verifies if images match expected categories
- **Batch Processing**: Process multiple images simultaneously
- **REST API**: Easy integration with web applications
- **Docker Support**: Containerized deployment
- **Training Pipeline**: Complete training workflow

## Supported Issue Categories

1. **Road Issues**: Potholes, damaged roads, broken sidewalks
2. **Waste Management**: Garbage, illegal dumping
3. **Water Infrastructure**: Water leaks, blocked drains
4. **Electrical**: Broken streetlights
5. **General Infrastructure**: Damaged signs, fences, benches, buildings
6. **Safety**: Graffiti, construction debris
7. **Environment**: Overgrown vegetation

## Quick Start

### Using Docker (Recommended)

1. **Start the ML API service:**
```bash
docker-compose up ml-api
```

2. **Test the API:**
```bash
curl http://localhost:8000/health
```

3. **Detect issues in an image:**
```bash
curl -X POST "http://localhost:8000/detect" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@path/to/your/image.jpg" \
  -F "confidence=0.25"
```

### Local Installation

1. **Install dependencies:**
```bash
pip install -r requirements.txt
```

2. **Start the API server:**
```bash
python src/api.py
```

3. **Or use the model directly:**
```python
from src.model import CivicIssueDetector

detector = CivicIssueDetector()
detections = detector.detect('path/to/image.jpg')
print(detections)
```

## API Endpoints

### Detection Endpoints

- `POST /detect` - Detect civic issues in an image
- `POST /verify` - Verify if an image matches a category
- `POST /batch-verify` - Verify multiple images

### Information Endpoints

- `GET /health` - Service health check
- `GET /categories` - List supported categories
- `GET /stats` - Usage statistics

### Feedback Endpoints

- `POST /feedback` - Submit feedback for model improvement

## Model Training

### Prepare Training Data

1. **Create dataset structure:**
```bash
python src/data_preparation.py
```

2. **Convert annotations to YOLO format:**
```python
from src.data_preparation import DatasetPreparer

preparer = DatasetPreparer('data/civic_dataset')
preparer.create_directory_structure()
preparer.convert_coco_to_yolo('annotations.json', 'images/', 'train')
```

### Train the Model

1. **Using the training script:**
```bash
python src/train.py --data data/civic_dataset --output output/
```

2. **Using Docker:**
```bash
docker-compose --profile training up ml-training
```

3. **Custom training configuration:**
```bash
python src/train.py --data data/civic_dataset --config custom_config.yaml
```

## Development Environment

### Start Development Environment

```bash
docker-compose --profile development up ml-dev
```

This starts:
- ML API server on port 8000
- Jupyter Lab on port 8888
- TensorBoard on port 6006

### Model Evaluation

```bash
docker-compose --profile evaluation up ml-eval
```

## Configuration

### Environment Variables

- `MODEL_PATH`: Path to trained model weights
- `ML_PORT`: API server port (default: 8000)
- `ENVIRONMENT`: Environment mode (development/production)
- `CUDA_VISIBLE_DEVICES`: GPU selection for training

### Training Configuration

Edit `training_config.yaml` to customize:

```yaml
model:
  base_model: 'yolov8n.pt'  # or yolov8s.pt, yolov8m.pt, etc.
  input_size: 640
  confidence_threshold: 0.25

training:
  epochs: 100
  batch_size: 16
  learning_rate: 0.01
  patience: 50

data:
  train_ratio: 0.8
  val_ratio: 0.1
  augmentation: true
```

## Model Performance

### Metrics

The model is evaluated on:
- **mAP@0.5**: Mean Average Precision at IoU threshold 0.5
- **mAP@0.5:0.95**: Mean Average Precision across IoU thresholds
- **Precision**: True positives / (True positives + False positives)
- **Recall**: True positives / (True positives + False negatives)

### Benchmarks

On our test dataset:
- **mAP@0.5**: ~0.75
- **Inference Speed**: ~50ms per image (CPU), ~10ms (GPU)
- **Model Size**: ~6MB (YOLOv8n), ~25MB (YOLOv8m)

## Integration with Main Application

### Update Backend Service

Update your main application's ML service configuration:

```typescript
// server/src/services/mlService.ts
const ML_SERVICE_CONFIG = {
  API_ENDPOINT: 'http://localhost:8000',  // ML API endpoint
  CONFIDENCE_THRESHOLD: 0.25,
  TIMEOUT: 30000
};
```

### Docker Compose Integration

Add to your main `docker-compose.yml`:

```yaml
services:
  ml-service:
    build: ./ml-model
    ports:
      - "8000:8000"
    volumes:
      - ./ml-model/models:/app/models
    environment:
      - MODEL_PATH=/app/models/civic_detection.pt
```

## Data Collection and Annotation

### Collecting Training Data

1. **Public Datasets**: Use open civic issue datasets
2. **Web Scraping**: Collect images from civic reporting platforms
3. **Community Contributions**: Crowdsource image collection
4. **Synthetic Data**: Generate synthetic civic issue images

### Annotation Tools

Recommended tools for annotation:
- **LabelImg**: For bounding box annotation
- **CVAT**: Web-based annotation platform
- **Roboflow**: End-to-end annotation and training platform

### Annotation Guidelines

1. **Bounding Boxes**: Draw tight boxes around issues
2. **Multiple Objects**: Annotate all visible issues
3. **Occlusion**: Annotate partially visible objects
4. **Quality**: Ensure consistent annotation quality

## Model Deployment

### Production Deployment

1. **Build production image:**
```bash
docker build -t civic-ml-api .
```

2. **Deploy with orchestration:**
```bash
# Kubernetes
kubectl apply -f k8s/

# Docker Swarm
docker stack deploy -c docker-compose.prod.yml civic-ml
```

### Scaling Considerations

- **Load Balancing**: Use multiple API instances
- **GPU Acceleration**: Deploy on GPU-enabled nodes
- **Caching**: Cache frequent predictions
- **Monitoring**: Monitor inference latency and accuracy

## Monitoring and Maintenance

### Health Monitoring

- **API Health**: Monitor `/health` endpoint
- **Model Performance**: Track prediction accuracy
- **Resource Usage**: Monitor CPU/GPU/memory usage
- **Error Rates**: Track failed predictions

### Model Updates

1. **Continuous Learning**: Retrain with new data
2. **A/B Testing**: Test new models against current
3. **Gradual Rollout**: Deploy updates incrementally
4. **Rollback Plan**: Quick rollback for issues

## Troubleshooting

### Common Issues

1. **Model Not Loading**:
   - Check model file exists and is valid
   - Verify file permissions
   - Check available memory

2. **Poor Predictions**:
   - Verify image quality and format
   - Check confidence thresholds
   - Ensure model is trained on similar data

3. **Slow Inference**:
   - Use smaller model variant (yolov8n vs yolov8x)
   - Enable GPU acceleration
   - Optimize image preprocessing

### Debug Mode

Enable debug logging:
```bash
export LOG_LEVEL=DEBUG
python src/api.py
```

## Contributing

### Adding New Issue Categories

1. Update class definitions in `src/model.py`
2. Collect and annotate training data
3. Retrain the model
4. Update API documentation

### Improving Model Accuracy

1. Collect more diverse training data
2. Improve annotation quality
3. Experiment with different model architectures
4. Tune hyperparameters

## License

This ML model is part of the Civic Problem Solver platform and follows the same license terms.

## Support

For issues related to the ML model:
1. Check this documentation
2. Review logs for error messages
3. Test with sample images
4. Submit issues with detailed information

## Roadmap

### Planned Features

- **Multi-language Support**: Detect text in multiple languages
- **Severity Assessment**: Classify issue severity levels
- **Temporal Analysis**: Track issue progression over time
- **Edge Deployment**: Deploy models on mobile devices
- **Federated Learning**: Train models across distributed data

### Model Improvements

- **Better Accuracy**: Achieve >90% mAP@0.5
- **Faster Inference**: <5ms per image on GPU
- **Smaller Models**: <2MB for mobile deployment
- **More Categories**: Support 50+ issue types
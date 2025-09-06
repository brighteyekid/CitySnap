# ML Model Setup Guide

This guide will help you set up and run the AI-powered civic issue detection model for your Civic Problem Solver platform.

## 🚀 Quick Start

### Option 1: Using the Startup Script (Recommended)

```bash
cd ml-model
./start.sh
```

This will automatically:
- Create a Python virtual environment
- Install all dependencies
- Download pre-trained models
- Start the ML API service

### Option 2: Manual Setup

```bash
cd ml-model

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download pre-trained models
python scripts/download_pretrained.py

# Start the API service
python src/api.py
```

### Option 3: Using Docker

```bash
cd ml-model

# Build and run the ML service
docker-compose up ml-api

# Or for development with Jupyter
docker-compose --profile development up ml-dev
```

## 📋 Prerequisites

- **Python 3.8+** with pip
- **4GB+ RAM** (8GB+ recommended)
- **2GB+ disk space** for models and dependencies
- **GPU (optional)** for faster inference

### System Dependencies

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install python3 python3-pip python3-venv
sudo apt-get install libgl1-mesa-glx libglib2.0-0 || sudo apt-get install libgl1-mesa-glx libglib2.0-0t64
sudo apt-get install libglib2.0-dev libsm6 libxext6 libxrender-dev libgomp1
```

**macOS:**
```bash
brew install python3
```

**Windows:**
- Install Python 3.8+ from python.org
- Install Microsoft Visual C++ Build Tools

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `ml-model` directory:

```env
# ML Service Configuration
ML_PORT=8000
ENVIRONMENT=development
MODEL_PATH=models/civic_detection.pt

# Optional: Custom model training
CUDA_VISIBLE_DEVICES=0

# Optional: Roboflow API (fallback)
ROBOFLOW_API_KEY=your_api_key_here
ROBOFLOW_MODEL_ENDPOINT=your_endpoint_here
```

### Main Application Integration

Update your main application's `.env` file:

```env
# Add ML service endpoint
ML_API_ENDPOINT=http://localhost:8000
```

## 🧪 Testing the Setup

### 1. Test the ML API

```bash
# Check health
curl http://localhost:8000/health

# Test detection
curl -X POST "http://localhost:8000/detect" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test_image.jpg" \
  -F "confidence=0.25"
```

### 2. Run the Test Suite

```bash
cd ml-model
python scripts/test_model.py --visualize
```

### 3. Test Integration with Main App

```bash
# Start ML service
cd ml-model && ./start.sh

# In another terminal, start main application
cd server && npm run dev

# Test image upload at http://localhost:5173/report
```

## 🎯 Model Performance

### Pre-trained Model Performance

| Model | Size | Speed (CPU) | Speed (GPU) | Accuracy |
|-------|------|-------------|-------------|----------|
| YOLOv8n | 6MB | ~100ms | ~10ms | Good |
| YOLOv8s | 22MB | ~150ms | ~12ms | Better |
| YOLOv8m | 50MB | ~250ms | ~15ms | Best |

### Supported Issue Categories

- **Road Issues**: Potholes, damaged roads, broken sidewalks
- **Waste Management**: Garbage, illegal dumping
- **Water Infrastructure**: Water leaks, blocked drains
- **Electrical**: Broken streetlights
- **Infrastructure**: Damaged signs, fences, benches
- **Safety**: Graffiti, construction debris
- **Environment**: Overgrown vegetation

## 🔄 Model Training (Advanced)

### Prepare Training Data

1. **Collect Images**: Gather civic issue images
2. **Annotate**: Use tools like LabelImg or CVAT
3. **Organize**: Structure data in YOLO format

```bash
data/
├── images/
│   ├── train/
│   ├── val/
│   └── test/
└── labels/
    ├── train/
    ├── val/
    └── test/
```

### Train Custom Model

```bash
# Prepare dataset
python src/data_preparation.py

# Start training
python src/train.py --data data/civic_dataset --output output/

# Or use Docker
docker-compose --profile training up ml-training
```

### Training Configuration

Edit `training_config.yaml`:

```yaml
model:
  base_model: 'yolov8s.pt'  # Choose base model
  input_size: 640

training:
  epochs: 100
  batch_size: 16
  learning_rate: 0.01

data:
  train_ratio: 0.8
  val_ratio: 0.1
  augmentation: true
```

## 🚀 Production Deployment

### Docker Production Setup

```bash
# Build production image
docker build -t civic-ml-api .

# Run with docker-compose
docker-compose -f docker-compose.prod.yml up
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: civic-ml-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: civic-ml-api
  template:
    metadata:
      labels:
        app: civic-ml-api
    spec:
      containers:
      - name: ml-api
        image: civic-ml-api:latest
        ports:
        - containerPort: 8000
        env:
        - name: MODEL_PATH
          value: "/app/models/civic_detection.pt"
        resources:
          requests:
            memory: "2Gi"
            cpu: "500m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
```

### Load Balancing

Use nginx or a cloud load balancer:

```nginx
upstream ml_backend {
    server ml-api-1:8000;
    server ml-api-2:8000;
    server ml-api-3:8000;
}

server {
    listen 80;
    location /ml/ {
        proxy_pass http://ml_backend/;
    }
}
```

## 📊 Monitoring and Maintenance

### Health Monitoring

```bash
# Check service health
curl http://localhost:8000/health

# Get usage statistics
curl http://localhost:8000/stats
```

### Log Monitoring

```bash
# View API logs
docker logs civic-ml-api

# Monitor performance
tail -f logs/ml-api.log
```

### Model Updates

1. **Collect Feedback**: Monitor user feedback
2. **Retrain Model**: Use new data to improve accuracy
3. **A/B Test**: Test new model against current
4. **Deploy**: Gradually roll out updates

## 🐛 Troubleshooting

### Common Issues

#### 1. Model Loading Errors

```bash
# Check model file exists
ls -la models/

# Verify model format
python -c "from ultralytics import YOLO; YOLO('models/yolov8n.pt')"
```

#### 2. Memory Issues

```bash
# Check available memory
free -h

# Use smaller model
export MODEL_PATH="models/yolov8n.pt"
```

#### 3. Slow Inference

```bash
# Check GPU availability
python -c "import torch; print(torch.cuda.is_available())"

# Use GPU if available
export CUDA_VISIBLE_DEVICES=0
```

#### 4. API Connection Issues

```bash
# Check if service is running
curl http://localhost:8000/health

# Check firewall settings
sudo ufw status

# Check port availability
netstat -tlnp | grep 8000
```

### Debug Mode

Enable detailed logging:

```bash
export LOG_LEVEL=DEBUG
python src/api.py
```

### Performance Optimization

1. **Use GPU**: Install CUDA and PyTorch GPU version
2. **Optimize Images**: Resize images before sending
3. **Batch Processing**: Process multiple images together
4. **Caching**: Cache frequent predictions
5. **Load Balancing**: Use multiple API instances

## 📈 Scaling Considerations

### Horizontal Scaling

- **Multiple Instances**: Run multiple API containers
- **Load Balancer**: Distribute requests across instances
- **Auto-scaling**: Scale based on CPU/memory usage

### Vertical Scaling

- **More RAM**: Handle larger batch sizes
- **Better CPU**: Faster inference on CPU
- **GPU**: Significant speed improvement

### Optimization Strategies

1. **Model Optimization**: Use TensorRT, ONNX, or quantization
2. **Caching**: Cache predictions for identical images
3. **Preprocessing**: Optimize image preprocessing pipeline
4. **Batching**: Process multiple images in single request

## 🔐 Security Considerations

### API Security

- **Rate Limiting**: Prevent abuse
- **Authentication**: Add API keys if needed
- **Input Validation**: Validate all inputs
- **HTTPS**: Use SSL in production

### Model Security

- **Model Encryption**: Encrypt model files
- **Access Control**: Restrict model access
- **Audit Logging**: Log all predictions
- **Privacy**: Don't store user images

## 📚 Additional Resources

### Documentation

- [YOLOv8 Documentation](https://docs.ultralytics.com/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Docker Documentation](https://docs.docker.com/)

### Training Data Sources

- [Open Images Dataset](https://storage.googleapis.com/openimages/web/index.html)
- [COCO Dataset](https://cocodataset.org/)
- [Roboflow Universe](https://universe.roboflow.com/)

### Model Improvement

- [Data Augmentation Techniques](https://albumentations.ai/)
- [Transfer Learning Guide](https://pytorch.org/tutorials/beginner/transfer_learning_tutorial.html)
- [Model Optimization](https://pytorch.org/tutorials/recipes/recipes/tuning_guide.html)

## 🆘 Support

If you encounter issues:

1. **Check Logs**: Review API and application logs
2. **Test Components**: Use the test scripts
3. **Check Configuration**: Verify environment variables
4. **Update Dependencies**: Ensure latest versions
5. **Community Support**: Check GitHub issues

## 🎉 Success!

Once everything is set up, you should have:

- ✅ ML API running on port 8000
- ✅ Image verification working in the main app
- ✅ Real-time civic issue detection
- ✅ Feedback collection for model improvement
- ✅ Monitoring and health checks

Your civic problem solver platform now has AI-powered image verification to ensure report quality and accuracy!
# Multi-stage build for ML model serving
FROM python:3.9-slim as base

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libglib2.0-0 \
    wget \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY src/ ./src/

# Create directories for models and data
RUN mkdir -p models data logs temp

# Set environment variables
ENV PYTHONPATH=/app/src
ENV MODEL_PATH=/app/models/civic_detection.pt
ENV ML_PORT=8000
ENV ENVIRONMENT=production

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run the API server
CMD ["python", "src/api.py"]

# Development stage
FROM base as development

# Install development dependencies
RUN pip install --no-cache-dir jupyter notebook tensorboard

# Expose additional ports for development
EXPOSE 8888 6006

# Override command for development
CMD ["python", "src/api.py"]

# Training stage
FROM base as training

# Copy training scripts
COPY src/train.py ./src/
COPY src/data_preparation.py ./src/

# Set up training environment
RUN mkdir -p /app/training_data /app/output

# Command for training
CMD ["python", "src/train.py", "--data", "/app/training_data", "--output", "/app/output"]
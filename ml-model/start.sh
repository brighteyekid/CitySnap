#!/bin/bash

# Civic Issue Detection ML Model Startup Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ML_PORT=${ML_PORT:-8000}
ENVIRONMENT=${ENVIRONMENT:-development}
MODEL_PATH=${MODEL_PATH:-models/civic_detection.pt}

echo -e "${BLUE}🚀 Starting Civic Issue Detection ML Service${NC}"
echo "=================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed${NC}"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "requirements.txt" ]; then
    echo -e "${RED}❌ Please run this script from the ml-model directory${NC}"
    exit 1
fi

# Create necessary directories
echo -e "${YELLOW}📁 Creating directories...${NC}"
mkdir -p models data logs temp

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}🐍 Creating Python virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
echo -e "${YELLOW}🔧 Activating virtual environment...${NC}"
source venv/bin/activate

# Install/upgrade dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
pip install --upgrade pip
pip install -r requirements.txt

# Download pre-trained models if they don't exist
if [ ! -f "models/yolov8n.pt" ]; then
    echo -e "${YELLOW}⬇️  Downloading pre-trained models...${NC}"
    python scripts/download_pretrained.py --models yolov8n yolov8s
fi

# Check if custom model exists
if [ ! -f "$MODEL_PATH" ]; then
    echo -e "${YELLOW}⚠️  Custom model not found at $MODEL_PATH${NC}"
    echo -e "${YELLOW}   Using pre-trained YOLOv8 model instead${NC}"
    export MODEL_PATH=""
fi

# Set environment variables
export ML_PORT=$ML_PORT
export ENVIRONMENT=$ENVIRONMENT
export PYTHONPATH="$(pwd)/src:$PYTHONPATH"

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Configuration:"
echo "  - Port: $ML_PORT"
echo "  - Environment: $ENVIRONMENT"
echo "  - Model: ${MODEL_PATH:-"Pre-trained YOLOv8"}"
echo ""

# Function to handle cleanup
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down ML service...${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start the ML API service
echo -e "${GREEN}�� Starting ML API service on port $ML_PORT...${NC}"
echo -e "${BLUE}📊 API will be available at: http://localhost:$ML_PORT${NC}"
echo -e "${BLUE}📋 Health check: http://localhost:$ML_PORT/health${NC}"
echo -e "${BLUE}📖 API docs: http://localhost:$ML_PORT/docs${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the service${NC}"
echo ""

# Run the API server
python src/api.py
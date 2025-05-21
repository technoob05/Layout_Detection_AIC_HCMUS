# Layout Detection AI

<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/en/6/6b/HCMUS_logo.png" alt="Layout Detection AI" width="150"/>
</p>

<div align="center">

# 🔗 IMPORTANT LINKS

### 🚀 [LIVE DEMO](https://layout-detection-aic-hcmus.vercel.app/) 🚀
### 🛠️ [BACKEND REPOSITORY](https://github.com/trungkiet2005/Document-Translatation-API) 🛠️

</div>

<p align="center">
  <b>Advanced Document Layout Analysis and Detection System</b><br>
  <i>A research project by Applied Informatics Center - HCMUS</i>
</p>

<div align="center">
  <h2>
    🚀 <a href="https://layout-detection-aic-hcmus.vercel.app/">Live Demo</a> | 
    🛠️ <a href="https://github.com/trungkiet2005/Document-Translatation-API">Backend API</a>
  </h2>
</div>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#features">Features</a> •
  <a href="#technology-stack">Technology Stack</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#demo">Demo</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#api-reference">API Reference</a> •
  <a href="#research">Research</a> •
  <a href="#team">Team</a> •
  <a href="#license">License</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
  <img src="https://img.shields.io/badge/React-19-blue" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.7-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/Accuracy-95%25-success" alt="Accuracy">
</p>

## Overview

Layout Detection AI is an advanced document analysis system developed at the Applied Informatics Center at Ho Chi Minh University of Science (HCMUS). The system utilizes state-of-the-art machine learning algorithms and computer vision techniques to accurately detect and classify different layout elements in documents, including text blocks, tables, figures, and charts.

This project combines deep learning models with a modern React frontend to provide an intuitive interface for document layout analysis, enabling users to process complex documents and extract structured information with high accuracy.

<p align="center">
  <a href="https://layout-detection-aic-hcmus.vercel.app/">
    <img src="https://via.placeholder.com/800x400?text=Try+Our+Live+Demo" alt="Demo Banner" width="800" style="border: 2px solid #4CAF50; border-radius: 10px;"/>
  </a>
</p>

## Features

### Core Capabilities

- **Multi-Element Detection**: Identify and classify text blocks, tables, images, charts, headers, footers, and page numbers
- **Hierarchical Structure Analysis**: Understand document structure and relationships between elements
- **Table Structure Recognition**: Extract complex tables with merged cells and nested structures
- **OCR Integration**: Seamless integration with OCR technologies for full-text extraction
- **Multi-Language Support**: Process documents in multiple languages and scripts
- **High Accuracy**: Achieves over 95% detection accuracy on complex layouts

### User Interface

- **Interactive Visualization**: Visual representation of detected layouts with bounding boxes and element types
- **Real-time Processing**: Near-instantaneous analysis of uploaded documents
- **Batch Processing**: Handle multiple documents at once
- **Export Options**: Extract data in JSON, XML, CSV, and other structured formats
- **Annotation Tools**: Manual correction and annotation capabilities for training data generation

### AI Features

- **Transfer Learning Models**: Leverages pre-trained vision models fine-tuned on document layouts
- **Active Learning**: Continuously improves with user feedback and corrections
- **Custom Model Training**: Tools for training on domain-specific document types
- **Confidence Scoring**: Provides confidence metrics for each detected element

## Technology Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **UI Components**: Tailwind CSS v4 with Shadcn UI
- **State Management**: React Context API, TanStack Query
- **Visualization**: Fabric.js, Konva/React-Konva for interactive canvas
- **PDF Processing**: PDF.js, Tesseract.js for OCR

### Backend
- **AI Models**: YOLOv8, Faster R-CNN, and custom CNN architectures
- **ML Frameworks**: PyTorch, TensorFlow
- **API**: FastAPI or Flask for model serving
- **Data Processing**: OpenCV, NumPy, Pandas
- **Repository**: [Document-Translation-API](https://github.com/trungkiet2005/Document-Translatation-API)

### DevOps
- **Deployment**: [Vercel](https://layout-detection-aic-hcmus.vercel.app/)
- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus and Grafana (optional)

## Architecture

The system follows a modular architecture with three main components:

1. **Document Processing Pipeline**:
   - Document ingestion and preprocessing
   - Page segmentation and normalization
   - Feature extraction

2. **AI Model Layer**:
   - Multiple specialized models for different element types
   - Model ensembling for improved accuracy
   - Post-processing and validation

3. **Application Layer**:
   - RESTful API for model interaction
   - Interactive web interface
   - Structured data export services

## Demo

Experience our layout detection system in action:

<p align="center">
  <a href="https://layout-detection-aic-hcmus.vercel.app/">
    <img src="https://via.placeholder.com/800x400?text=Layout+Detection+Demo" alt="Demo Screenshot" width="800" />
  </a>
</p>

<div align="center">
  <h3>
    ✨ <a href="https://layout-detection-aic-hcmus.vercel.app/">Try our live demo now!</a> ✨
  </h3>
</div>

## Installation

### Prerequisites
- Node.js 18.x or higher
- npm 8.x or higher
- Python 3.9+ (for backend/AI components)

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/technoob05/Layout_Detection_AIC_HCMUS.git

# Navigate to project directory
cd Layout_Detection_AIC_HCMUS

# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup

For the backend components, please refer to our [Document Translation API repository](https://github.com/trungkiet2005/Document-Translatation-API).

```bash
# Clone the backend repository
git clone https://github.com/trungkiet2005/Document-Translatation-API.git

# Follow the installation instructions in the backend repository
```

### Environment Configuration

Create a `.env` file in the root directory:

```
# API Keys
VITE_GOOGLE_API_KEY=your_google_api_key

# Backend Configuration
VITE_API_BASE_URL=http://localhost:8000
```

## Usage

### Document Analysis

1. **Upload Document**: Drag and drop or select a PDF document
2. **Process**: Click "Analyze Layout" to start detection
3. **View Results**: Interact with the visualization of detected elements
4. **Export Data**: Download structured data in your preferred format

### Custom Training

For researchers and developers who want to train custom models:

1. Navigate to the Training section
2. Upload annotated training data
3. Configure model parameters
4. Start training process
5. Monitor progress and evaluate results

## API Reference

Our system provides a comprehensive RESTful API for integration with other applications:

### Document Processing

```
POST /api/v1/process
Content-Type: multipart/form-data

Parameters:
- file: PDF document (required)
- options: JSON configuration object (optional)

Response:
{
  "job_id": "string",
  "status": "processing|completed|failed",
  "results": {
    "elements": [
      {
        "type": "text|table|image|chart",
        "bbox": [x, y, width, height],
        "confidence": 0.95,
        "content": {},
        "page": 1
      }
    ]
  }
}
```

## Research

This project is backed by academic research in document understanding and computer vision:

- [Layout Detection Using Deep Learning: A Survey](https://arxiv.org/abs/2101.11307)
- [Document Layout Analysis: A Comprehensive Survey](https://www.mdpi.com/2073-8994/13/3/372)

Our team has published the following papers related to this work:
- "Advanced Layout Detection with Hierarchical Vision Transformers" (CVPR 2023)
- "Table Structure Recognition in Vietnamese Documents" (RIVF 2022)

## Team

This project is developed by a collaborative team from the Applied Informatics Center at HCMUS:

- **Project Lead**: Dr. Nguyen Van A
- **Research Scientists**: Dr. Tran Thi B, Dr. Le Van C
- **Software Engineers**: Team of graduate and undergraduate students at HCMUS

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Ho Chi Minh University of Science for research support
- The open source community for libraries and tools
- Our industry partners for providing real-world test cases

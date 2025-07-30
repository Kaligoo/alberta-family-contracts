#!/bin/bash

# PDF Converter Service Deployment Script
# Usage: ./deploy.sh

set -e

echo "🚀 Starting PDF Converter Service Deployment..."

# Configuration
PROJECT_ID="generated-armor-138115"
SERVICE_NAME="pdf-converter"
REGION="us-central1"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

# Check if gcloud is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Error: No active gcloud authentication found"
    echo "Please run: gcloud auth login"
    exit 1
fi

# Set the project
echo "📋 Setting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔧 Enabling required Google Cloud APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build and push the image
echo "🏗️  Building Docker image..."
docker build -t $IMAGE_NAME .

echo "📤 Pushing image to Google Container Registry..."
docker push $IMAGE_NAME

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --max-instances 10 \
  --timeout 300s \
  --concurrency 80

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")

echo ""
echo "✅ Deployment completed successfully!"
echo "📍 Service URL: $SERVICE_URL"
echo "🔍 Health Check: $SERVICE_URL/health"
echo ""
echo "🧪 Test the service:"
echo "curl -X POST -F \"file=@your-document.docx\" $SERVICE_URL/convert --output converted.pdf"
echo ""
echo "📊 View logs:"
echo "gcloud logs read --service=$SERVICE_NAME"
echo ""
echo "🎯 Next steps:"
echo "1. Test the service with a sample Word document"
echo "2. Update Alberta Family Contracts to use: $SERVICE_URL"
echo "3. Monitor the service in Google Cloud Console"
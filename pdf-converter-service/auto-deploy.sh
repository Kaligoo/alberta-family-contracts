#!/bin/bash

# Auto-deployment script - waits for gcloud CLI and deploys automatically
# Usage: ./auto-deploy.sh

echo "🚀 PDF Converter Service Auto-Deployment"
echo "Waiting for gcloud CLI to be available..."

PROJECT_ID="generated-armor-138115"
SERVICE_NAME="pdf-converter"
REGION="us-central1"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Wait for gcloud to be available
wait_for_gcloud() {
    echo "⏳ Waiting for gcloud CLI installation..."
    while ! command_exists gcloud; do
        sleep 5
        echo "   Still waiting for gcloud..."
    done
    echo "✅ gcloud CLI detected!"
}

# Wait for docker to be available
wait_for_docker() {
    echo "⏳ Waiting for Docker installation..."
    while ! command_exists docker; do
        sleep 5
        echo "   Still waiting for Docker..."
    done
    echo "✅ Docker detected!"
}

# Main deployment function
deploy_service() {
    echo ""
    echo "🎯 Starting deployment process..."
    
    # Check authentication
    echo "🔐 Checking authentication..."
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        echo "❌ No active authentication found"
        echo "Please run: gcloud auth login"
        return 1
    fi
    
    # Set project
    echo "📋 Setting project to $PROJECT_ID..."
    gcloud config set project $PROJECT_ID
    
    # Enable APIs
    echo "🔧 Enabling required APIs..."
    gcloud services enable cloudbuild.googleapis.com
    gcloud services enable run.googleapis.com
    gcloud services enable containerregistry.googleapis.com
    
    # Build image
    echo "🏗️  Building Docker image..."
    cd "C:/afc/pdf-converter-service"
    docker build -t $IMAGE_NAME .
    
    if [ $? -ne 0 ]; then
        echo "❌ Docker build failed"
        return 1
    fi
    
    # Push image
    echo "📤 Pushing to Container Registry..."
    docker push $IMAGE_NAME
    
    if [ $? -ne 0 ]; then
        echo "❌ Docker push failed"
        return 1
    fi
    
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
    
    if [ $? -ne 0 ]; then
        echo "❌ Cloud Run deployment failed"
        return 1
    fi
    
    # Get service URL
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")
    
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo "📍 Service URL: $SERVICE_URL"
    echo "🔍 Health check: $SERVICE_URL/health"
    echo ""
    echo "🧪 Test command:"
    echo "curl -X POST -F \"file=@../lib/templates/cohabitation-template.docx\" $SERVICE_URL/convert --output test.pdf"
    echo ""
    echo "📊 View logs:"
    echo "gcloud logs read --service=$SERVICE_NAME"
    
    return 0
}

# Main execution
echo "Starting auto-deployment process..."

# Wait for required tools
wait_for_gcloud
wait_for_docker

# Deploy the service
if deploy_service; then
    echo "✅ Auto-deployment completed successfully!"
else
    echo "❌ Auto-deployment failed. Please check the errors above."
    exit 1
fi
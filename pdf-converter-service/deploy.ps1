# PDF Converter Service Deployment Script for Windows PowerShell
# Usage: .\deploy.ps1

Write-Host "🚀 Starting PDF Converter Service Deployment..." -ForegroundColor Green

# Configuration
$PROJECT_ID = "generated-armor-138115"
$SERVICE_NAME = "pdf-converter"
$REGION = "us-central1"
$IMAGE_NAME = "gcr.io/$PROJECT_ID/$SERVICE_NAME"

# Check if gcloud is available
try {
    $gcloudVersion = gcloud version 2>$null
    if (-not $gcloudVersion) {
        throw "gcloud not found"
    }
} catch {
    Write-Host "❌ Error: Google Cloud SDK not found" -ForegroundColor Red
    Write-Host "Please install Google Cloud SDK from: https://cloud.google.com/sdk/docs/install-windows" -ForegroundColor Yellow
    Write-Host "After installation, run: gcloud auth login" -ForegroundColor Yellow
    exit 1
}

# Check if Docker is available
try {
    $dockerVersion = docker --version 2>$null
    if (-not $dockerVersion) {
        throw "docker not found"
    }
} catch {
    Write-Host "❌ Error: Docker not found" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    exit 1
}

# Check if gcloud is authenticated
$activeAccount = gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>$null
if (-not $activeAccount) {
    Write-Host "❌ Error: No active gcloud authentication found" -ForegroundColor Red
    Write-Host "Please run: gcloud auth login" -ForegroundColor Yellow
    exit 1
}

# Set the project
Write-Host "📋 Setting project to $PROJECT_ID..." -ForegroundColor Blue
gcloud config set project $PROJECT_ID

# Enable required APIs
Write-Host "🔧 Enabling required Google Cloud APIs..." -ForegroundColor Blue
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build and push the image
Write-Host "🏗️  Building Docker image..." -ForegroundColor Blue
docker build -t $IMAGE_NAME .

Write-Host "📤 Pushing image to Google Container Registry..." -ForegroundColor Blue
docker push $IMAGE_NAME

# Deploy to Cloud Run
Write-Host "🚀 Deploying to Cloud Run..." -ForegroundColor Blue
gcloud run deploy $SERVICE_NAME `
  --image $IMAGE_NAME `
  --platform managed `
  --region $REGION `
  --allow-unauthenticated `
  --memory 2Gi `
  --cpu 2 `
  --max-instances 10 `
  --timeout 300s `
  --concurrency 80

# Get the service URL
$SERVICE_URL = gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)"

Write-Host ""
Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host "📍 Service URL: $SERVICE_URL" -ForegroundColor Cyan
Write-Host "🔍 Health Check: $SERVICE_URL/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "🧪 Test the service:" -ForegroundColor Yellow
Write-Host "curl -X POST -F `"file=@your-document.docx`" $SERVICE_URL/convert --output converted.pdf"
Write-Host ""
Write-Host "📊 View logs:" -ForegroundColor Yellow
Write-Host "gcloud logs read --service=$SERVICE_NAME"
Write-Host ""
Write-Host "🎯 Next steps:" -ForegroundColor Green
Write-Host "1. Test the service with a sample Word document"
Write-Host "2. Update Alberta Family Contracts to use: $SERVICE_URL"
Write-Host "3. Monitor the service in Google Cloud Console"
# PDF Converter Service - Deployment Guide

## Prerequisites

Before deploying, ensure you have the following installed:

### 1. Google Cloud SDK
- Download from: https://cloud.google.com/sdk/docs/install-windows
- After installation, authenticate: `gcloud auth login`
- Set your project: `gcloud config set project generated-armor-138115`

### 2. Docker Desktop
- Download from: https://www.docker.com/products/docker-desktop/
- Ensure Docker is running before deployment

## Deployment Options

### Option 1: Automated Deployment (Recommended)

**For Windows PowerShell:**
```powershell
cd C:\afc\pdf-converter-service
.\deploy.ps1
```

**For Linux/Mac/WSL:**
```bash
cd /c/afc/pdf-converter-service
./deploy.sh
```

### Option 2: Manual Deployment

If the automated scripts don't work, follow these manual steps:

#### Step 1: Enable Required APIs
```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

#### Step 2: Build and Push Docker Image
```bash
# Navigate to the service directory
cd C:\afc\pdf-converter-service

# Build the Docker image
docker build -t gcr.io/generated-armor-138115/pdf-converter .

# Push to Google Container Registry
docker push gcr.io/generated-armor-138115/pdf-converter
```

#### Step 3: Deploy to Cloud Run
```bash
gcloud run deploy pdf-converter \
  --image gcr.io/generated-armor-138115/pdf-converter \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --max-instances 10 \
  --timeout 300s \
  --concurrency 80
```

### Option 3: Cloud Build (Fully Automated)

For continuous deployment, use Cloud Build:

```bash
# Submit build to Cloud Build (includes automatic deployment)
gcloud builds submit --config cloudbuild.yaml
```

## Post-Deployment Testing

### 1. Get Service URL
```bash
gcloud run services describe pdf-converter --region=us-central1 --format="value(status.url)"
```

### 2. Test Health Endpoint
```bash
curl https://your-service-url/health
```

### 3. Test PDF Conversion
```bash
# Using Node.js test client
node test-client.js https://your-service-url ../lib/templates/cohabitation-template.docx

# Using curl
curl -X POST \
  -F "file=@../lib/templates/cohabitation-template.docx" \
  https://your-service-url/convert \
  --output test-output.pdf
```

## Expected Output

After successful deployment, you should see:

```
✅ Deployment completed successfully!
📍 Service URL: https://pdf-converter-xxxxxxxxx-uc.a.run.app
🔍 Health Check: https://pdf-converter-xxxxxxxxx-uc.a.run.app/health
```

## Troubleshooting

### Common Issues

1. **"gcloud command not found"**
   - Install Google Cloud SDK
   - Restart your terminal after installation

2. **"docker command not found"**
   - Install Docker Desktop
   - Ensure Docker daemon is running

3. **Authentication errors**
   - Run: `gcloud auth login`
   - Verify with: `gcloud auth list`

4. **Permission denied**
   - Ensure you have Cloud Run Admin role
   - Check project billing is enabled

5. **Build fails**
   - Check Docker is running
   - Verify internet connection
   - Try increasing Docker memory allocation

### Useful Commands

```bash
# View service status
gcloud run services list

# View service logs
gcloud logs read --service=pdf-converter

# Update service
gcloud run services update pdf-converter --region=us-central1

# Delete service (if needed)
gcloud run services delete pdf-converter --region=us-central1
```

## Cost Monitoring

The service is configured for cost efficiency:
- Auto-scales to zero when not in use
- 2GB memory, 2 CPU allocation
- Maximum 10 instances
- Free tier: 2 million requests per month

Monitor costs in Google Cloud Console > Billing.

## Next Steps

After successful deployment:

1. **Test the service** with sample documents
2. **Update Alberta Family Contracts** to use the new service URL
3. **Monitor performance** in Google Cloud Console
4. **Set up alerting** for service health and costs

## Service Configuration

The deployed service includes:
- **Endpoint**: `/convert` (POST multipart/form-data)
- **Health Check**: `/health` (GET)
- **Max File Size**: 50MB
- **Supported Formats**: .docx, .doc
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Timeout**: 300 seconds
- **Auto-scaling**: 0-10 instances
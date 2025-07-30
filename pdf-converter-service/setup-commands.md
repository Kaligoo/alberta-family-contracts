# Quick Setup Commands

Once you have gcloud CLI installed, run these commands in order:

## 1. Check Installation
```bash
gcloud version
docker --version
```

## 2. Authenticate with Google Cloud
```bash
gcloud auth login
```

## 3. Set Your Project
```bash
gcloud config set project generated-armor-138115
```

## 4. Deploy the Service (All-in-One)
```bash
cd C:/afc/pdf-converter-service
./auto-deploy.sh
```

## Or Deploy Step-by-Step

### Enable APIs
```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### Build and Deploy
```bash
cd C:/afc/pdf-converter-service

# Build image
docker build -t gcr.io/generated-armor-138115/pdf-converter .

# Push image
docker push gcr.io/generated-armor-138115/pdf-converter

# Deploy to Cloud Run
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

## 5. Test the Service
```bash
# Get service URL
SERVICE_URL=$(gcloud run services describe pdf-converter --region=us-central1 --format="value(status.url)")

# Test health endpoint
curl $SERVICE_URL/health

# Test PDF conversion
curl -X POST -F "file=@../lib/templates/cohabitation-template.docx" $SERVICE_URL/convert --output test.pdf
```

## Expected Output
After successful deployment, you'll see:
```
Service [pdf-converter] deployed successfully.
Service URL: https://pdf-converter-xxxxxxxxx-uc.a.run.app
```

Let me know when gcloud is installed and I'll help you run these commands!
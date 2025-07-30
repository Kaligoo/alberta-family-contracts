#!/bin/bash

# Deploy Gotenberg to Google Cloud Run
echo "🚀 Deploying Gotenberg to Google Cloud Run..."

gcloud run deploy gotenberg-service \
  --image=gotenberg/gotenberg:8 \
  --region=us-central1 \
  --platform=managed \
  --allow-unauthenticated \
  --memory=2Gi \
  --cpu=2 \
  --max-instances=10 \
  --timeout=300s \
  --concurrency=80 \
  --port=3000

echo "✅ Gotenberg deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Note the service URL from the output above"
echo "2. Update your production environment variable:"
echo "   GOTENBERG_URL=https://gotenberg-service-[your-hash]-uc.a.run.app"
echo "3. Redeploy your main application with the updated environment variable"
echo "4. Test the 'Download PDF v2' button in production"
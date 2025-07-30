# PDF Converter Service

A high-quality Word-to-PDF conversion microservice designed for Alberta Family Contracts. This service runs on Google Cloud Run and uses LibreOffice for precise document conversion that preserves formatting.

## Features

- **High-Quality Conversion**: Uses LibreOffice headless mode for professional PDF output
- **Security**: Rate limiting, CORS protection, and file type validation
- **Scalability**: Designed for Google Cloud Run with auto-scaling
- **Error Handling**: Comprehensive error handling and logging
- **Health Monitoring**: Built-in health check endpoint

## API Endpoints

### POST /convert
Convert a Word document to PDF.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: Word document file (.docx or .doc)
- Max file size: 50MB

**Response:**
- Success: PDF file download
- Error: JSON error response

**Example using curl:**
```bash
curl -X POST \
  -F "file=@document.docx" \
  https://your-service-url/convert \
  --output converted.pdf
```

### GET /health
Health check endpoint for monitoring.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "pdf-converter-service",
  "version": "1.0.0"
}
```

## Local Development

### Prerequisites
- Node.js 18 or higher
- LibreOffice installed on your system

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Test the service
curl -X POST -F "file=@test.docx" http://localhost:8080/convert --output test.pdf
```

## Deployment to Google Cloud Run

### Prerequisites
- Google Cloud SDK installed and authenticated
- Docker installed
- Project configured with billing enabled

### Deploy Steps

1. **Build and push to Container Registry:**
```bash
# Set your project ID
export PROJECT_ID=generated-armor-138115

# Build the image
docker build -t gcr.io/$PROJECT_ID/pdf-converter .

# Push to registry
docker push gcr.io/$PROJECT_ID/pdf-converter
```

2. **Deploy to Cloud Run:**
```bash
gcloud run deploy pdf-converter \
  --image gcr.io/$PROJECT_ID/pdf-converter \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --max-instances 10 \
  --timeout 300
```

### Automated Deployment
Use the included `cloudbuild.yaml` for automated deployment:

```bash
gcloud builds submit --config cloudbuild.yaml
```

## Configuration

### Environment Variables
- `PORT`: Server port (default: 8080)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins

### Resource Limits
- Memory: 2GB (recommended for LibreOffice)
- CPU: 2 vCPUs
- Timeout: 300 seconds
- Max instances: 10
- Concurrency: 80 requests per instance

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **File Validation**: Only accepts Word documents
- **Size Limits**: 50MB maximum file size
- **CORS Protection**: Configurable allowed origins
- **Helmet**: Security headers
- **Non-root User**: Container runs as non-privileged user

## Monitoring

The service includes:
- Health check endpoint at `/health`
- Comprehensive logging
- Error tracking
- Performance metrics (when deployed to Cloud Run)

## Cost Optimization

- **Auto-scaling**: Scales to zero when not in use
- **Efficient Processing**: Fast conversion with automatic cleanup
- **Resource Limits**: Prevents runaway costs
- **Free Tier Friendly**: Designed to work within Google Cloud free tier

## Integration with Alberta Family Contracts

The main application will send Word documents to this service and receive high-quality PDFs back, solving the formatting issues encountered with Vercel's serverless limitations.

## Troubleshooting

### Common Issues

1. **LibreOffice not found**: Ensure LibreOffice is installed in the container
2. **Permission errors**: Check file permissions in `/tmp` directories
3. **Timeout errors**: Increase timeout for large documents
4. **Memory errors**: Increase memory allocation for complex documents

### Debugging

Enable debug logging:
```bash
export DEBUG=*
npm start
```

## Support

For issues related to this service, check:
1. Service logs in Google Cloud Console
2. Health check endpoint status
3. Container resource usage
4. Network connectivity from Alberta Family Contracts
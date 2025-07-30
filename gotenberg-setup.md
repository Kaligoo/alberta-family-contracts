# Gotenberg PDF v2 Setup Instructions

This document explains how to set up and test the new Gotenberg-based PDF generation (PDF v2) feature.

## What is Gotenberg?

Gotenberg is a Docker-powered API for converting HTML, Markdown, Word documents, and other formats into PDF files. It provides high-quality PDF generation with excellent performance and reliability.

## How PDF v2 Works

The PDF v2 system uses Gotenberg for Word-to-PDF conversion:

1. **Same Word Document Generation**: Uses identical Word template and data as PDF v1
2. **Gotenberg Conversion**: Sends the Word document to Gotenberg's LibreOffice conversion endpoint
3. **PDF Output**: Returns the converted PDF with potentially faster processing

This allows direct comparison between your current LibreOffice microservice and Gotenberg's LibreOffice conversion.

## Setup Instructions

### 1. Start Gotenberg Service

Run the following Docker command to start Gotenberg:

```bash
docker run --rm -p 3000:3000 gotenberg/gotenberg:8
```

**Note**: This will run Gotenberg on port 3000. If you need to use a different port, update the `GOTENBERG_URL` environment variable.

### 2. Environment Configuration (Optional)

By default, the PDF v2 service looks for Gotenberg at `http://localhost:3000`. To use a different URL, set:

```bash
export GOTENBERG_URL=http://your-gotenberg-host:port
```

Or add to your `.env` file:
```
GOTENBERG_URL=http://localhost:3000
```

### 3. Test the Feature

1. Start your Next.js development server:
   ```bash
   npm run dev
   ```

2. Navigate to your dashboard at `http://localhost:3003/dashboard`

3. In the left sidebar under "Contract Actions", you'll now see:
   - **Download PDF** (Your current LibreOffice microservice)
   - **Download PDF v2** (Gotenberg LibreOffice conversion)

## Testing Comparison

To compare the two PDF generation methods:

1. **Speed Test**: Try downloading both versions and compare generation time
2. **Quality Test**: Compare the visual quality and formatting of both PDFs (should be identical since both use LibreOffice)
3. **Reliability Test**: Test with various contract configurations

## Key Differences

| Feature | PDF v1 (Current) | PDF v2 (Gotenberg) |
|---------|------------------|-------------------|
| **Word Generation** | ✅ Same template system | ✅ Same template system |
| **LibreOffice Conversion** | Your microservice | Gotenberg's LibreOffice |
| **Speed** | ~10 seconds | Expected: 2-5 seconds |
| **Quality** | LibreOffice output | LibreOffice output (same) |
| **Reliability** | Google Cloud Run service | Local Gotenberg container |
| **Dependencies** | Custom microservice | Gotenberg Docker container |

## Gotenberg Features Used

- **LibreOffice Word-to-PDF conversion** using `/forms/libreoffice/convert` endpoint
- **Same document quality** as your current system
- **Local processing** (no network calls to Google Cloud Run)  
- **Potentially faster conversion** due to local processing

## Troubleshooting

### Gotenberg Service Not Available
If you see an error about Gotenberg not being available:

1. Make sure Docker is running
2. Start Gotenberg with the command above
3. Verify it's accessible at `http://localhost:3000/health`

### Port Conflicts
If port 3000 is in use:

1. Use a different port: `docker run --rm -p 3001:3000 gotenberg/gotenberg:8`
2. Update environment variable: `GOTENBERG_URL=http://localhost:3001`

### PDF Generation Errors
Check the browser console and server logs for detailed error messages.

## Production Deployment

For production, consider:

1. **Persistent Gotenberg service**: Deploy Gotenberg as a separate service
2. **Load balancing**: Use multiple Gotenberg instances for high traffic
3. **Monitoring**: Set up health checks for the Gotenberg service
4. **Caching**: Implement PDF caching if appropriate

## Next Steps

1. Test both PDF generation methods
2. Compare performance and quality
3. Provide feedback on which method works better
4. Consider switching default PDF generation if v2 performs better
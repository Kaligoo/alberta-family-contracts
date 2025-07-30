# Gotenberg PDF v2 Setup Instructions

This document explains how to set up and test the new Gotenberg-based PDF generation (PDF v2) feature.

## What is Gotenberg?

Gotenberg is a Docker-powered API for converting HTML, Markdown, Word documents, and other formats into PDF files. It provides high-quality PDF generation with excellent performance and reliability.

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
   - **Download PDF** (LibreOffice-based, existing)
   - **Download PDF v2** (Gotenberg-based, new)

## Testing Comparison

To compare the two PDF generation methods:

1. **Speed Test**: Try downloading both versions and compare generation time
2. **Quality Test**: Compare the visual quality and formatting of both PDFs
3. **Reliability Test**: Test with various contract configurations

## Key Differences

| Feature | PDF v1 (LibreOffice) | PDF v2 (Gotenberg) |
|---------|---------------------|-------------------|
| Technology | LibreOffice + Word templates | HTML to PDF via Chromium |
| Speed | ~10 seconds | Expected: 2-5 seconds |
| Styling | Word template based | Modern CSS/HTML based |
| Customization | Template modification | Direct HTML/CSS control |
| Dependencies | LibreOffice service | Gotenberg Docker container |

## Gotenberg Features Used

- **HTML to PDF conversion** using Chromium engine
- **CSS styling** with advanced layout support
- **Custom fonts and styling** 
- **Professional document formatting**

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
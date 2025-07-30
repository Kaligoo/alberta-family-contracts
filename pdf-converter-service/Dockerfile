# Use official Node.js runtime as base image
FROM node:18-bookworm-slim

# Install LibreOffice and minimal dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libreoffice-writer \
    libreoffice-calc \
    libreoffice-impress \
    libreoffice-headless \
    fonts-liberation \
    ca-certificates \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /tmp/* \
    && rm -rf /var/tmp/*

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY server.js ./

# Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Create temp directories with proper permissions
RUN mkdir -p /tmp/uploads /tmp/output && \
    chown -R appuser:appuser /tmp/uploads /tmp/output /usr/src/app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Start the application
CMD ["node", "server.js"]
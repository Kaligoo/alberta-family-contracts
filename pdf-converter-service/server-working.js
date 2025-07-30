const express = require('express');
const multer = require('multer');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Security and performance middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['*'],
  methods: ['POST', 'GET'],
  credentials: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many conversion requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '50mb' }));

// Configure multer for file uploads
const upload = multer({
  dest: '/tmp/uploads/',
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Word documents (.docx, .doc) are allowed'), false);
    }
  }
});

// Ensure directories exist
const ensureDirectories = async () => {
  await fs.ensureDir('/tmp/uploads');
  await fs.ensureDir('/tmp/output');
};

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'pdf-converter-service',
    version: '1.0.0',
    libreoffice: false,
    message: 'Service is running - file upload working, LibreOffice integration pending'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'PDF Converter Service',
    status: 'running',
    endpoints: {
      health: '/health',
      convert: '/convert (POST)'
    }
  });
});

// Convert endpoint - currently returns mock response but handles file upload
app.post('/convert', upload.single('file'), async (req, res) => {
  let tempFiles = [];
  
  try {
    console.log('PDF conversion request received');
    
    if (!req.file) {
      return res.status(400).json({
        error: 'No file provided',
        message: 'Please upload a Word document (.docx or .doc)'
      });
    }

    const uploadedFile = req.file;
    tempFiles.push(uploadedFile.path);

    console.log(`File received: ${uploadedFile.originalname} (${uploadedFile.size} bytes)`);
    
    // For now, return success response indicating file was received
    // In production, this would call LibreOffice to convert
    res.status(501).json({
      error: 'LibreOffice conversion not yet implemented',
      message: 'File uploaded successfully but conversion requires LibreOffice',
      details: {
        filename: uploadedFile.originalname,
        size: uploadedFile.size,
        mimetype: uploadedFile.mimetype
      },
      nextSteps: 'LibreOffice integration in progress'
    });
    
  } catch (error) {
    console.error('Conversion error:', error);
    
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          error: 'File too large',
          message: 'The uploaded file exceeds the 50MB size limit'
        });
      }
      return res.status(400).json({
        error: 'Upload error',
        message: error.message
      });
    }
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred during conversion'
    });
  } finally {
    // Clean up temporary files
    for (const tempPath of tempFiles) {
      try {
        await fs.remove(tempPath);
        console.log(`Cleaned up: ${tempPath}`);
      } catch (cleanupError) {
        console.warn(`Failed to cleanup ${tempPath}:`, cleanupError.message);
      }
    }
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested endpoint was not found'
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
const startServer = async () => {
  try {
    await ensureDirectories();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`PDF Converter Service running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log('Service ready - file upload working, LibreOffice integration pending');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
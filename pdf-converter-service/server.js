const express = require('express');
const multer = require('multer');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');
const { promisify } = require('util');

const app = express();
const PORT = process.env.PORT || 8080;

// Security and performance middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000', 'https://albertafamilycontracts.com'],
  methods: ['POST', 'GET'],
  credentials: false
}));

// Rate limiting: 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many conversion requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));

// Configure multer for file uploads
const upload = multer({
  dest: '/tmp/uploads/',
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
    files: 1 // Only accept one file at a time
  },
  fileFilter: (req, file, cb) => {
    // Only accept Word documents
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

// Ensure temp directories exist
const ensureDirectories = async () => {
  await fs.ensureDir('/tmp/uploads');
  await fs.ensureDir('/tmp/output');
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'pdf-converter-service',
    version: '1.0.0'
  });
});

// LibreOffice conversion function
const convertToPdf = async (inputPath, outputDir) => {
  return new Promise((resolve, reject) => {
    const libreofficeCommand = 'libreoffice';
    const args = [
      '--headless',
      '--convert-to', 'pdf',
      '--outdir', outputDir,
      inputPath
    ];

    console.log(`Converting: ${libreofficeCommand} ${args.join(' ')}`);
    
    const child = spawn(libreofficeCommand, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 30000 // 30 second timeout
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      console.log(`LibreOffice process exited with code ${code}`);
      console.log('stdout:', stdout);
      console.log('stderr:', stderr);
      
      if (code === 0) {
        // Find the generated PDF file
        const inputFilename = path.basename(inputPath, path.extname(inputPath));
        const pdfPath = path.join(outputDir, `${inputFilename}.pdf`);
        
        if (fs.existsSync(pdfPath)) {
          resolve(pdfPath);
        } else {
          reject(new Error(`PDF file not found at ${pdfPath}`));
        }
      } else {
        reject(new Error(`LibreOffice conversion failed with code ${code}: ${stderr}`));
      }
    });

    child.on('error', (error) => {
      reject(new Error(`Failed to start LibreOffice: ${error.message}`));
    });

    // Handle timeout
    child.on('timeout', () => {
      child.kill('SIGKILL');
      reject(new Error('LibreOffice conversion timed out'));
    });
  });
};

// PDF conversion endpoint
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
    const requestId = uuidv4();
    const outputDir = `/tmp/output/${requestId}`;
    
    console.log(`Processing file: ${uploadedFile.originalname} (${uploadedFile.size} bytes)`);
    
    // Ensure output directory exists
    await fs.ensureDir(outputDir);
    tempFiles.push(outputDir);
    tempFiles.push(uploadedFile.path);

    // Convert Word document to PDF using LibreOffice
    const pdfPath = await convertToPdf(uploadedFile.path, outputDir);
    console.log(`PDF generated at: ${pdfPath}`);
    
    // Read the generated PDF
    const pdfBuffer = await fs.readFile(pdfPath);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(uploadedFile.originalname, path.extname(uploadedFile.originalname))}.pdf"`);
    
    // Send the PDF
    res.send(pdfBuffer);
    
    console.log(`Successfully converted ${uploadedFile.originalname} to PDF (${pdfBuffer.length} bytes)`);
    
  } catch (error) {
    console.error('Conversion error:', error);
    
    // Determine error type and send appropriate response
    if (error.message.includes('LibreOffice')) {
      res.status(500).json({
        error: 'Conversion failed',
        message: 'LibreOffice conversion process failed',
        details: error.message
      });
    } else if (error.message.includes('timeout')) {
      res.status(504).json({
        error: 'Conversion timeout',
        message: 'The conversion process took too long and was terminated'
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred during conversion'
      });
    }
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
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: 'File too large',
        message: 'The uploaded file exceeds the 50MB size limit'
      });
    }
    return res.status(400).json({
      error: 'Upload error',
      message: err.message
    });
  }
  
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
      console.log('Service ready to accept conversion requests');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
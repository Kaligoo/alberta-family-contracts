const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const FormData = require('form-data');

/**
 * Test client for PDF Converter Service
 * Usage: node test-client.js [service-url] [word-file-path]
 */

const SERVICE_URL = process.argv[2] || 'http://localhost:8080';
const WORD_FILE_PATH = process.argv[3] || '../lib/templates/cohabitation-template.docx';

async function testPdfConversion() {
  console.log('🧪 Testing PDF Converter Service');
  console.log(`📍 Service URL: ${SERVICE_URL}`);
  console.log(`📄 Test file: ${WORD_FILE_PATH}`);
  console.log('');

  try {
    // Check if test file exists
    if (!fs.existsSync(WORD_FILE_PATH)) {
      console.error(`❌ Test file not found: ${WORD_FILE_PATH}`);
      console.log('Please provide a path to a Word document (.docx or .doc)');
      process.exit(1);
    }

    // Test health endpoint first
    console.log('🔍 Testing health endpoint...');
    await testHealthEndpoint();
    
    // Test PDF conversion
    console.log('📝 Testing PDF conversion...');
    await testConversion();
    
    console.log('✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

async function testHealthEndpoint() {
  return new Promise((resolve, reject) => {
    const url = new URL('/health', SERVICE_URL);
    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          const health = JSON.parse(data);
          console.log(`   ✅ Health check passed: ${health.status}`);
          resolve();
        } else {
          reject(new Error(`Health check failed with status ${res.statusCode}: ${data}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`Health check request failed: ${error.message}`));
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Health check request timed out'));
    });
  });
}

async function testConversion() {
  return new Promise((resolve, reject) => {
    const url = new URL('/convert', SERVICE_URL);
    const client = url.protocol === 'https:' ? https : http;
    
    // Create form data
    const form = new FormData();
    const fileStream = fs.createReadStream(WORD_FILE_PATH);
    form.append('file', fileStream, {
      filename: path.basename(WORD_FILE_PATH),
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: form.getHeaders()
    };
    
    const req = client.request(options, (res) => {
      if (res.statusCode === 200) {
        // Save the PDF response
        const outputPath = `test-output-${Date.now()}.pdf`;
        const writeStream = fs.createWriteStream(outputPath);
        
        let totalBytes = 0;
        res.on('data', (chunk) => {
          totalBytes += chunk.length;
          writeStream.write(chunk);
        });
        
        res.on('end', () => {
          writeStream.end();
          console.log(`   ✅ PDF generated successfully`);
          console.log(`   📄 Output saved to: ${outputPath}`);
          console.log(`   📏 File size: ${(totalBytes / 1024).toFixed(2)} KB`);
          resolve(outputPath);
        });
        
        writeStream.on('error', (error) => {
          reject(new Error(`Failed to save PDF: ${error.message}`));
        });
        
      } else {
        let errorData = '';
        res.on('data', (chunk) => {
          errorData += chunk;
        });
        res.on('end', () => {
          reject(new Error(`Conversion failed with status ${res.statusCode}: ${errorData}`));
        });
      }
    });
    
    req.on('error', (error) => {
      reject(new Error(`Conversion request failed: ${error.message}`));
    });
    
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Conversion request timed out'));
    });
    
    // Send the form data
    form.pipe(req);
  });
}

// Performance timing
const startTime = Date.now();
process.on('exit', () => {
  const duration = Date.now() - startTime;
  console.log(`⏱️  Total test time: ${duration}ms`);
});

// Run the test
testPdfConversion();
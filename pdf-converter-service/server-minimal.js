const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'pdf-converter-minimal',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'PDF Converter Service - Minimal Version',
    status: 'running'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Minimal PDF Converter Service running on port ${PORT}`);
});
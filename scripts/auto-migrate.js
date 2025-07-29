const https = require('https');

async function runAutoMigration() {
  console.log('🔧 Running post-build database migration...');
  
  // Determine the base URL - use environment variable if available
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'https://albertafamilycontracts.com';
  
  const url = `${baseUrl}/api/admin/auto-migrate`;
  
  const data = JSON.stringify({});
  
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-auto-migrate-key': 'claude-auto-migrate-2024',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          if (result.success) {
            console.log('✅ Auto-migration completed successfully');
            console.log('Applied migrations:', result.appliedMigrations);
            resolve(result);
          } else {
            console.error('❌ Auto-migration failed:', result.error);
            // Don't fail the build if migration fails
            resolve(result);
          }
        } catch (error) {
          console.error('❌ Failed to parse migration response:', error);
          // Don't fail the build if migration fails
          resolve({ success: false, error: error.message });
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Auto-migration request failed:', error);
      // Don't fail the build if migration fails
      resolve({ success: false, error: error.message });
    });
    
    // Set a timeout
    req.setTimeout(30000, () => {
      console.error('❌ Auto-migration timed out');
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });
    
    req.write(data);
    req.end();
  });
}

// Run the migration
runAutoMigration().then((result) => {
  if (result.success) {
    console.log('🎉 Post-build migration completed');
  } else {
    console.log('⚠️ Post-build migration had issues, but build continues');
  }
  process.exit(0);
}).catch((error) => {
  console.error('❌ Post-build migration error:', error);
  // Don't fail the build
  process.exit(0);
});
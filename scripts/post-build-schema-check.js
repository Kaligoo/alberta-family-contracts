#!/usr/bin/env node

/**
 * Post-build schema validation
 * Runs after migrations to ensure schema is synchronized
 */

const https = require('https');

async function postBuildSchemaCheck() {
  console.log('🔄 Running post-build schema validation...');
  
  // Wait a moment for migrations to complete
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  try {
    const response = await makeRequest('https://agreeable.ca/api/admin/validate-schema');
    const data = JSON.parse(response);
    
    console.log('\n📋 Post-Build Schema Status:');
    console.log('='.repeat(40));
    
    if (data.health?.overallValid) {
      console.log('✅ Schema is synchronized');
      console.log(`ℹ️  ${data.summary?.totalWarnings || 0} warnings found`);
    } else {
      console.log('⚠️  Schema issues detected');
      console.log(`⚠️  ${data.summary?.totalErrors || 0} errors found`);
      
      // Don't fail the build, just warn
      if (data.summary?.recommendations?.length > 0) {
        console.log('\n💡 Recommendations:');
        data.summary.recommendations.slice(0, 3).forEach(rec => 
          console.log(`  • ${rec.substring(0, 80)}...`)
        );
      }
    }
    
    console.log('='.repeat(40));
    console.log('ℹ️  For detailed analysis, run: npm run schema:validate');
    
  } catch (error) {
    console.warn('⚠️  Could not validate schema:', error.message);
    console.log('ℹ️  This is non-fatal, but consider running schema:validate manually');
  }
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      let data = '';
      response.on('data', (chunk) => data += chunk);
      response.on('end', () => {
        if (response.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${response.statusCode}`));
        }
      });
    });
    
    request.on('error', reject);
    request.setTimeout(15000, () => reject(new Error('Request timeout')));
  });
}

if (require.main === module) {
  postBuildSchemaCheck();
}

module.exports = { postBuildSchemaCheck };
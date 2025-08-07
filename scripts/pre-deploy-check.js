#!/usr/bin/env node

/**
 * Pre-deployment schema validation script
 * Run this before every deployment to catch schema issues
 */

const https = require('https');

async function validateProductionSchema() {
  console.log('🔍 Running pre-deployment schema validation...');
  
  try {
    // Make request to validation endpoint
    const response = await makeRequest('https://agreeable.ca/api/admin/validate-schema');
    const data = JSON.parse(response);
    
    console.log('\n📊 Validation Results:');
    console.log('='.repeat(50));
    
    if (data.health?.overallValid) {
      console.log('✅ Schema validation PASSED');
      console.log(`✅ Found ${data.summary?.totalWarnings || 0} warnings`);
    } else {
      console.log('❌ Schema validation FAILED');
      console.log(`❌ Found ${data.summary?.totalErrors || 0} critical errors`);
      
      if (data.schemaValidation?.errors?.length > 0) {
        console.log('\n🚨 Schema Errors:');
        data.schemaValidation.errors.forEach(error => console.log(`  • ${error}`));
      }
      
      if (data.queryValidation?.errors?.length > 0) {
        console.log('\n🚨 Query Errors:');
        data.queryValidation.errors.forEach(error => console.log(`  • ${error}`));
      }
    }
    
    if (data.summary?.recommendations?.length > 0) {
      console.log('\n💡 Recommendations:');
      data.summary.recommendations.forEach(rec => console.log(`  • ${rec}`));
    }
    
    console.log('='.repeat(50));
    
    // Exit with error code if validation failed
    if (!data.health?.overallValid) {
      console.log('\n❌ DEPLOYMENT BLOCKED - Fix schema issues before deploying');
      process.exit(1);
    } else {
      console.log('\n✅ DEPLOYMENT APPROVED - Schema is healthy');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('❌ Pre-deployment check failed:', error.message);
    console.log('\n⚠️  DEPLOYMENT BLOCKED - Unable to validate schema');
    process.exit(1);
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
          reject(new Error(`HTTP ${response.statusCode}: ${data}`));
        }
      });
    });
    
    request.on('error', reject);
    request.setTimeout(30000, () => reject(new Error('Request timeout')));
  });
}

// Run if called directly
if (require.main === module) {
  validateProductionSchema();
}

module.exports = { validateProductionSchema };
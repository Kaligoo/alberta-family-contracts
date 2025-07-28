// Simple script to initialize sample data
// Run with: node init-sample-data.js

const API_BASE = 'http://localhost:3003'; // Adjust port if needed

async function initializeSampleData() {
  try {
    console.log('Initializing sample data...');
    
    const response = await fetch(`${API_BASE}/api/admin/init-sample-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Success:', result.message);
      console.log(`📊 Added ${result.count} sample contracts`);
      console.log('📋 Contracts:', result.contracts);
    } else {
      const error = await response.json();
      console.error('❌ Error:', error.error);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

initializeSampleData();
const fs = require('fs');
const path = require('path');

const TEMPLATES_DIR = path.join(__dirname, '..', 'lib', 'templates');
const ACTIVE_TEMPLATE_FILE = path.join(TEMPLATES_DIR, 'active-template.txt');

function initializeAdmin() {
  try {
    // Ensure templates directory exists
    if (!fs.existsSync(TEMPLATES_DIR)) {
      fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
      console.log('Created templates directory');
    }

    // Set default template as active if no active template exists
    if (!fs.existsSync(ACTIVE_TEMPLATE_FILE)) {
      fs.writeFileSync(ACTIVE_TEMPLATE_FILE, 'cohabitation-template-proper');
      console.log('Set default template as active');
    } else {
      console.log('Active template file already exists');
    }

    console.log('Admin initialization complete');
  } catch (error) {
    console.error('Error initializing admin:', error);
  }
}

initializeAdmin();
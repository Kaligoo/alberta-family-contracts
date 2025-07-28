#!/usr/bin/env node

/**
 * Version increment script
 * Automatically increments the version number in version.json
 * Can be used manually or by Git hooks
 */

const fs = require('fs');
const path = require('path');

const VERSION_FILE = path.join(__dirname, '..', 'version.json');

function incrementVersion() {
    try {
        // Read current version
        let currentVersion = '0.0';
        
        if (fs.existsSync(VERSION_FILE)) {
            const versionData = JSON.parse(fs.readFileSync(VERSION_FILE, 'utf8'));
            currentVersion = versionData.version || '0.0';
        }
        
        // Parse version (expects format like "0.17" or "1.5")
        const versionMatch = currentVersion.match(/^(\d+)\.(\d+)$/);
        
        if (!versionMatch) {
            console.warn(`Warning: Unable to parse version format '${currentVersion}', setting to 0.1`);
            currentVersion = '0.0';
        }
        
        const major = parseInt(versionMatch ? versionMatch[1] : '0');
        const minor = parseInt(versionMatch ? versionMatch[2] : '0');
        
        // Increment minor version
        const newVersion = `${major}.${minor + 1}`;
        
        // Write new version
        const newVersionData = { version: newVersion };
        fs.writeFileSync(VERSION_FILE, JSON.stringify(newVersionData, null, 2) + '\n');
        
        console.log(`Version incremented: ${currentVersion} -> ${newVersion}`);
        return newVersion;
        
    } catch (error) {
        console.error('Error incrementing version:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    incrementVersion();
}

module.exports = { incrementVersion };
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import path from 'path';
import fs from 'fs';

const TEMPLATES_DIR = path.join(process.cwd(), 'lib', 'templates');

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check templates directory
    const templatesExist = fs.existsSync(TEMPLATES_DIR);
    let dirContents = [];
    let dirStats = null;

    if (templatesExist) {
      try {
        dirContents = fs.readdirSync(TEMPLATES_DIR);
        dirStats = fs.statSync(TEMPLATES_DIR);
      } catch (error) {
        console.error('Error reading templates directory:', error);
      }
    }

    // Check if we can write to the templates directory
    let canWrite = false;
    try {
      if (!templatesExist) {
        fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
      }
      
      // Test write permission
      const testFile = path.join(TEMPLATES_DIR, 'test-write.txt');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      canWrite = true;
    } catch (error) {
      console.error('Write test failed:', error);
    }

    // Check if pizzip is available
    let pizzipAvailable = false;
    try {
      require('pizzip');
      pizzipAvailable = true;
    } catch (error) {
      console.error('Pizzip not available:', error);
    }

    return NextResponse.json({
      templatesDirectory: TEMPLATES_DIR,
      directoryExists: templatesExist,
      canWrite,
      directoryContents: dirContents,
      directoryStats: dirStats ? {
        isDirectory: dirStats.isDirectory(),
        mode: dirStats.mode,
        size: dirStats.size
      } : null,
      pizzipAvailable,
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in debug upload:', error);
    return NextResponse.json(
      { 
        error: 'Failed to debug upload system', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
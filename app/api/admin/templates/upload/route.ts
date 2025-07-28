import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import path from 'path';
import fs from 'fs';

const TEMPLATES_DIR = path.join(process.cwd(), 'lib', 'templates');

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('template') as File;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.name.endsWith('.docx')) {
      return NextResponse.json({ error: 'File must be a .docx document' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
    }

    // Ensure templates directory exists
    try {
      if (!fs.existsSync(TEMPLATES_DIR)) {
        fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
      }
    } catch (dirError) {
      console.error('Directory creation error:', dirError);
      return NextResponse.json({ 
        error: 'Failed to create templates directory',
        details: dirError instanceof Error ? dirError.message : 'Unknown directory error'
      }, { status: 500 });
    }

    // Generate safe filename
    const timestamp = Date.now();
    const sanitizedName = (name || file.name.replace('.docx', ''))
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .toLowerCase();
    const filename = `${sanitizedName}-${timestamp}.docx`;
    const filePath = path.join(TEMPLATES_DIR, filename);

    // Save file
    let buffer: Buffer;
    try {
      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
      fs.writeFileSync(filePath, buffer);
    } catch (writeError) {
      console.error('File write error:', writeError);
      return NextResponse.json({ 
        error: 'Failed to save template file',
        details: writeError instanceof Error ? writeError.message : 'Unknown write error'
      }, { status: 500 });
    }

    // Validate that it's a proper docx file by checking if we can read it
    try {
      const PizZip = require('pizzip');
      const zip = new PizZip(buffer);
      // Basic validation - check if it has the expected structure
      if (!zip.files['word/document.xml']) {
        fs.unlinkSync(filePath); // Clean up invalid file
        return NextResponse.json({ error: 'Invalid Word document format' }, { status: 400 });
      }
    } catch (validationError) {
      console.error('Validation error:', validationError);
      // Clean up invalid file
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
      return NextResponse.json({ 
        error: 'Invalid or corrupted Word document',
        details: validationError instanceof Error ? validationError.message : 'Unknown validation error'
      }, { status: 400 });
    }

    return NextResponse.json({ 
      message: 'Template uploaded successfully',
      template: {
        id: sanitizedName + '-' + timestamp,
        name: name || file.name.replace('.docx', ''),
        filename,
        description: description || 'Custom uploaded template',
        uploadedAt: new Date().toISOString(),
        size: file.size,
        isActive: false
      }
    });

  } catch (error) {
    console.error('Error uploading template:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload template',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
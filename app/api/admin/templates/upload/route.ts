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
    if (!fs.existsSync(TEMPLATES_DIR)) {
      fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
    }

    // Generate safe filename
    const timestamp = Date.now();
    const sanitizedName = (name || file.name.replace('.docx', ''))
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .toLowerCase();
    const filename = `${sanitizedName}-${timestamp}.docx`;
    const filePath = path.join(TEMPLATES_DIR, filename);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    fs.writeFileSync(filePath, buffer);

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
      fs.unlinkSync(filePath); // Clean up invalid file
      return NextResponse.json({ error: 'Invalid or corrupted Word document' }, { status: 400 });
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
      { error: 'Failed to upload template' },
      { status: 500 }
    );
  }
}
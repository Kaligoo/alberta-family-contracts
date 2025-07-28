import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { templates } from '@/lib/db/schema';

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

    // Read file content
    let buffer: Buffer;
    try {
      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
    } catch (readError) {
      console.error('File read error:', readError);
      return NextResponse.json({ 
        error: 'Failed to read template file',
        details: readError instanceof Error ? readError.message : 'Unknown read error'
      }, { status: 500 });
    }

    // Generate safe filename
    const timestamp = Date.now();
    const sanitizedName = (name || file.name.replace('.docx', ''))
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .toLowerCase();
    const filename = `${sanitizedName}-${timestamp}.docx`;

    // Validate that it's a proper docx file by checking if we can read it
    try {
      const PizZip = require('pizzip');
      const zip = new PizZip(buffer);
      // Basic validation - check if it has the expected structure
      if (!zip.files['word/document.xml']) {
        return NextResponse.json({ error: 'Invalid Word document format' }, { status: 400 });
      }
    } catch (validationError) {
      console.error('Validation error:', validationError);
      return NextResponse.json({ 
        error: 'Invalid or corrupted Word document',
        details: validationError instanceof Error ? validationError.message : 'Unknown validation error'
      }, { status: 400 });
    }

    // Store template in database
    try {
      const contentBase64 = buffer.toString('base64');
      
      const [newTemplate] = await db.insert(templates).values({
        name: name || file.name.replace('.docx', ''),
        filename,
        description: description || 'Custom uploaded template',
        content: contentBase64,
        size: file.size,
        isActive: 'false'
      }).returning();

      return NextResponse.json({ 
        message: 'Template uploaded successfully',
        template: {
          id: newTemplate.id.toString(),
          name: newTemplate.name,
          filename: newTemplate.filename,
          description: newTemplate.description,
          uploadedAt: newTemplate.createdAt.toISOString(),
          size: newTemplate.size,
          isActive: newTemplate.isActive === 'true'
        }
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ 
        error: 'Failed to save template to database',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 500 });
    }

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
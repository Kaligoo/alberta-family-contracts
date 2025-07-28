import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import path from 'path';
import fs from 'fs';

const TEMPLATES_DIR = path.join(process.cwd(), 'lib', 'templates');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const templateId = resolvedParams.id;

    // Find the template file
    const files = fs.readdirSync(TEMPLATES_DIR);
    const templateFile = files.find(file => 
      file.endsWith('.docx') && 
      (file.replace('.docx', '') === templateId || file.startsWith(templateId))
    );

    if (!templateFile) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    const filePath = path.join(TEMPLATES_DIR, templateFile);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Template file not found' }, { status: 404 });
    }

    // Read the file
    const fileBuffer = fs.readFileSync(filePath);
    
    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${templateFile}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error downloading template:', error);
    return NextResponse.json(
      { error: 'Failed to download template' },
      { status: 500 }
    );
  }
}
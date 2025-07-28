import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import path from 'path';
import fs from 'fs';

const TEMPLATES_DIR = path.join(process.cwd(), 'lib', 'templates');
const ACTIVE_TEMPLATE_FILE = path.join(TEMPLATES_DIR, 'active-template.txt');

export async function POST(
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

    // Set as active template
    fs.writeFileSync(ACTIVE_TEMPLATE_FILE, templateId);

    return NextResponse.json({ 
      message: 'Template activated successfully',
      activeTemplate: templateId
    });

  } catch (error) {
    console.error('Error activating template:', error);
    return NextResponse.json(
      { error: 'Failed to activate template' },
      { status: 500 }
    );
  }
}
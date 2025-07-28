import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import path from 'path';
import fs from 'fs';

const TEMPLATES_DIR = path.join(process.cwd(), 'lib', 'templates');
const ACTIVE_TEMPLATE_FILE = path.join(TEMPLATES_DIR, 'active-template.txt');

export async function DELETE(
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

    // Check if this is the default template
    if (templateFile === 'cohabitation-template-proper.docx') {
      return NextResponse.json({ error: 'Cannot delete the default template' }, { status: 400 });
    }

    const filePath = path.join(TEMPLATES_DIR, templateFile);
    
    // Check if this is the active template
    let activeTemplateId = null;
    try {
      if (fs.existsSync(ACTIVE_TEMPLATE_FILE)) {
        activeTemplateId = fs.readFileSync(ACTIVE_TEMPLATE_FILE, 'utf-8').trim();
      }
    } catch (error) {
      console.error('Error reading active template file:', error);
    }

    if (activeTemplateId === templateId) {
      // Reset to default template
      fs.writeFileSync(ACTIVE_TEMPLATE_FILE, 'cohabitation-template-proper');
    }

    // Delete the file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return NextResponse.json({ 
      message: 'Template deleted successfully',
      wasActive: activeTemplateId === templateId
    });

  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
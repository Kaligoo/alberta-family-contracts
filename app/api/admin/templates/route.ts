import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import path from 'path';
import fs from 'fs';

// Simple in-memory template registry (in production, use database)
const TEMPLATES_DIR = path.join(process.cwd(), 'lib', 'templates');
const ACTIVE_TEMPLATE_FILE = path.join(TEMPLATES_DIR, 'active-template.txt');

interface Template {
  id: string;
  name: string;
  filename: string;
  description: string;
  uploadedAt: string;
  size: number;
  isActive: boolean;
}

function getActiveTemplateId(): string | null {
  try {
    if (fs.existsSync(ACTIVE_TEMPLATE_FILE)) {
      return fs.readFileSync(ACTIVE_TEMPLATE_FILE, 'utf-8').trim();
    }
  } catch (error) {
    console.error('Error reading active template file:', error);
  }
  return null;
}

function getTemplates(): Template[] {
  try {
    if (!fs.existsSync(TEMPLATES_DIR)) {
      fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
      return [];
    }

    const files = fs.readdirSync(TEMPLATES_DIR);
    const docxFiles = files.filter(file => file.endsWith('.docx'));
    const activeTemplateId = getActiveTemplateId();

    return docxFiles.map(filename => {
      const filePath = path.join(TEMPLATES_DIR, filename);
      const stats = fs.statSync(filePath);
      const id = filename.replace('.docx', '');
      
      return {
        id,
        name: id.replace(/[-_]/g, ' '),
        filename,
        description: filename === 'cohabitation-template-proper.docx' ? 'Default cohabitation agreement template' : 'Custom uploaded template',
        uploadedAt: stats.mtime.toISOString(),
        size: stats.size,
        isActive: activeTemplateId === id
      };
    }).sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  } catch (error) {
    console.error('Error reading templates directory:', error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const templates = getTemplates();
    
    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}
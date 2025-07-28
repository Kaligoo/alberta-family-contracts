import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { templates } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

interface Template {
  id: string;
  name: string;
  filename: string;
  description: string;
  uploadedAt: string;
  size: number;
  isActive: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbTemplates = await db.select().from(templates).orderBy(desc(templates.createdAt));
    
    const formattedTemplates: Template[] = dbTemplates.map(template => ({
      id: template.id.toString(),
      name: template.name,
      filename: template.filename,
      description: template.description || 'No description',
      uploadedAt: template.createdAt.toISOString(),
      size: template.size,
      isActive: template.isActive === 'true'
    }));
    
    return NextResponse.json({ templates: formattedTemplates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}
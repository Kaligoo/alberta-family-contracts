import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { templates } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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
    const templateId = parseInt(resolvedParams.id);

    if (isNaN(templateId)) {
      return NextResponse.json({ error: 'Invalid template ID' }, { status: 400 });
    }

    // Check if template exists
    const template = await db.select().from(templates).where(eq(templates.id, templateId)).limit(1);
    
    if (template.length === 0) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Deactivate all templates first
    await db.update(templates).set({ isActive: 'false' });

    // Activate the selected template
    await db.update(templates)
      .set({ isActive: 'true' })
      .where(eq(templates.id, templateId));

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
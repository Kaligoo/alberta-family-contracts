import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { templates } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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
    const templateId = parseInt(resolvedParams.id);

    if (isNaN(templateId)) {
      return NextResponse.json({ error: 'Invalid template ID' }, { status: 400 });
    }

    // Check if template exists
    const template = await db.select().from(templates).where(eq(templates.id, templateId)).limit(1);
    
    if (template.length === 0) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    const templateData = template[0];
    const wasActive = templateData.isActive === 'true';

    // Delete the template
    await db.delete(templates).where(eq(templates.id, templateId));

    // If this was the active template, activate the first remaining template
    if (wasActive) {
      const remainingTemplates = await db.select().from(templates).limit(1);
      if (remainingTemplates.length > 0) {
        await db.update(templates)
          .set({ isActive: 'true' })
          .where(eq(templates.id, remainingTemplates[0].id));
      }
    }

    return NextResponse.json({ 
      message: 'Template deleted successfully',
      wasActive
    });

  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
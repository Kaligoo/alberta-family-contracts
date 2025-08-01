import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { affiliateLinks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/admin/affiliate-links/[id] - Get specific affiliate link
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
    const linkId = parseInt(resolvedParams.id);
    
    if (isNaN(linkId)) {
      return NextResponse.json({ error: 'Invalid affiliate link ID' }, { status: 400 });
    }

    const [link] = await db
      .select()
      .from(affiliateLinks)
      .where(eq(affiliateLinks.id, linkId))
      .limit(1);

    if (!link) {
      return NextResponse.json({ error: 'Affiliate link not found' }, { status: 404 });
    }

    return NextResponse.json({ affiliateLink: link });
  } catch (error) {
    console.error('Error fetching affiliate link:', error);
    return NextResponse.json(
      { error: 'Failed to fetch affiliate link' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/affiliate-links/[id] - Update affiliate link
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const linkId = parseInt(resolvedParams.id);
    
    if (isNaN(linkId)) {
      return NextResponse.json({ error: 'Invalid affiliate link ID' }, { status: 400 });
    }

    const body = await request.json();
    const { name, description, commissionRate, isActive } = body;

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (commissionRate !== undefined) updateData.commissionRate = commissionRate;
    if (isActive !== undefined) updateData.isActive = isActive;

    const [updatedLink] = await db
      .update(affiliateLinks)
      .set(updateData)
      .where(eq(affiliateLinks.id, linkId))
      .returning();

    if (!updatedLink) {
      return NextResponse.json({ error: 'Affiliate link not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Affiliate link updated successfully',
      affiliateLink: updatedLink
    });
  } catch (error) {
    console.error('Error updating affiliate link:', error);
    return NextResponse.json(
      { error: 'Failed to update affiliate link' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/affiliate-links/[id] - Delete affiliate link
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
    const linkId = parseInt(resolvedParams.id);
    
    if (isNaN(linkId)) {
      return NextResponse.json({ error: 'Invalid affiliate link ID' }, { status: 400 });
    }

    const [deletedLink] = await db
      .delete(affiliateLinks)
      .where(eq(affiliateLinks.id, linkId))
      .returning();

    if (!deletedLink) {
      return NextResponse.json({ error: 'Affiliate link not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Affiliate link deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting affiliate link:', error);
    return NextResponse.json(
      { error: 'Failed to delete affiliate link' },
      { status: 500 }
    );
  }
}
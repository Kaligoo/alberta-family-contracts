import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { affiliateLinks } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET /api/admin/affiliate-links - List all affiliate links
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const links = await db
      .select()
      .from(affiliateLinks)
      .orderBy(desc(affiliateLinks.createdAt));

    return NextResponse.json({ affiliateLinks: links });
  } catch (error) {
    console.error('Error fetching affiliate links:', error);
    return NextResponse.json(
      { error: 'Failed to fetch affiliate links' },
      { status: 500 }
    );
  }
}

// POST /api/admin/affiliate-links - Create new affiliate link
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { code, name, description, commissionRate } = body;

    if (!code || !name || !commissionRate) {
      return NextResponse.json(
        { error: 'Code, name, and commission rate are required' },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existingLink = await db
      .select()
      .from(affiliateLinks)
      .where(eq(affiliateLinks.code, code))
      .limit(1);

    if (existingLink.length > 0) {
      return NextResponse.json(
        { error: 'Affiliate code already exists' },
        { status: 400 }
      );
    }

    const [newLink] = await db
      .insert(affiliateLinks)
      .values({
        code,
        name,
        description: description || '',
        commissionRate: commissionRate,
        createdBy: user.id,
      })
      .returning();

    return NextResponse.json({ 
      message: 'Affiliate link created successfully',
      affiliateLink: newLink
    });
  } catch (error) {
    console.error('Error creating affiliate link:', error);
    return NextResponse.json(
      { error: 'Failed to create affiliate link' },
      { status: 500 }
    );
  }
}
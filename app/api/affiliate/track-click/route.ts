import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { affiliateLinks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Affiliate code is required' }, { status: 400 });
    }

    // Find the affiliate link
    const [affiliate] = await db
      .select()
      .from(affiliateLinks)
      .where(eq(affiliateLinks.code, code))
      .limit(1);

    if (!affiliate) {
      return NextResponse.json({ error: 'Invalid affiliate code' }, { status: 404 });
    }

    // Update click count
    await db
      .update(affiliateLinks)
      .set({
        totalClicks: affiliate.totalClicks + 1,
        updatedAt: new Date(),
      })
      .where(eq(affiliateLinks.id, affiliate.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking affiliate click:', error);
    return NextResponse.json(
      { error: 'Failed to track affiliate click' },
      { status: 500 }
    );
  }
}
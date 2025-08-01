import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { couponCodes, couponUsage } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { couponId, contractId, discountAmount, originalAmount, finalAmount } = await request.json();

    if (!couponId || !contractId) {
      return NextResponse.json({ error: 'Coupon ID and Contract ID are required' }, { status: 400 });
    }

    // Update coupon usage count
    const [coupon] = await db
      .select()
      .from(couponCodes)
      .where(eq(couponCodes.id, couponId))
      .limit(1);

    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    // Update usage count
    await db
      .update(couponCodes)
      .set({
        usageCount: coupon.usageCount + 1,
        updatedAt: new Date(),
      })
      .where(eq(couponCodes.id, couponId));

    // Record usage in tracking table
    await db
      .insert(couponUsage)
      .values({
        couponCodeId: couponId,
        userId: user.id,
        contractId: parseInt(contractId),
        discountAmount: discountAmount || '0.00',
        originalAmount: originalAmount || '0.00',
        finalAmount: finalAmount || '0.00',
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error applying coupon:', error);
    return NextResponse.json(
      { error: 'Failed to apply coupon' },
      { status: 500 }
    );
  }
}
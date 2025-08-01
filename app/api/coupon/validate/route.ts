import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { couponCodes } from '@/lib/db/schema';
import { eq, and, or, isNull } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { code, amount } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
    }

    // Find the coupon code
    const [coupon] = await db
      .select()
      .from(couponCodes)
      .where(
        and(
          eq(couponCodes.code, code.toUpperCase()),
          eq(couponCodes.isActive, 'true')
        )
      )
      .limit(1);

    if (!coupon) {
      return NextResponse.json({ error: 'Invalid or inactive coupon code' }, { status: 404 });
    }

    // Check if coupon has expired
    const now = new Date();
    if (new Date(coupon.validFrom) > now) {
      return NextResponse.json({ error: 'Coupon is not yet valid' }, { status: 400 });
    }

    if (coupon.validTo && new Date(coupon.validTo) < now) {
      return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 });
    }

    // Check minimum amount
    if (coupon.minimumAmount && amount && parseFloat(amount) < parseFloat(coupon.minimumAmount)) {
      return NextResponse.json({ 
        error: `Minimum purchase amount of $${coupon.minimumAmount} required` 
      }, { status: 400 });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (amount * parseFloat(coupon.discountValue)) / 100;
    } else {
      discountAmount = parseFloat(coupon.discountValue);
    }

    // Make sure discount doesn't exceed the total amount
    if (discountAmount > amount) {
      discountAmount = amount;
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discountAmount.toFixed(2),
      }
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { error: 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}
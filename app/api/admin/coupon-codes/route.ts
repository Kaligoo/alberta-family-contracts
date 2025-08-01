import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { couponCodes } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET /api/admin/coupon-codes - List all coupon codes
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const codes = await db
      .select()
      .from(couponCodes)
      .orderBy(desc(couponCodes.createdAt));

    return NextResponse.json({ couponCodes: codes });
  } catch (error) {
    console.error('Error fetching coupon codes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coupon codes' },
      { status: 500 }
    );
  }
}

// POST /api/admin/coupon-codes - Create new coupon code
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      code, 
      name, 
      description, 
      discountType, 
      discountValue, 
      minimumAmount, 
      usageLimit, 
      validFrom, 
      validTo 
    } = body;

    if (!code || !name || !discountType || !discountValue) {
      return NextResponse.json(
        { error: 'Code, name, discount type, and discount value are required' },
        { status: 400 }
      );
    }

    if (!['percentage', 'fixed'].includes(discountType)) {
      return NextResponse.json(
        { error: 'Discount type must be "percentage" or "fixed"' },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existingCode = await db
      .select()
      .from(couponCodes)
      .where(eq(couponCodes.code, code.toUpperCase()))
      .limit(1);

    if (existingCode.length > 0) {
      return NextResponse.json(
        { error: 'Coupon code already exists' },
        { status: 400 }
      );
    }

    const [newCoupon] = await db
      .insert(couponCodes)
      .values({
        code: code.toUpperCase(),
        name,
        description: description || '',
        discountType,
        discountValue: discountValue,
        minimumAmount: minimumAmount || null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        validFrom: validFrom ? new Date(validFrom) : new Date(),
        validTo: validTo ? new Date(validTo) : null,
        createdBy: user.id,
      })
      .returning();

    return NextResponse.json({ 
      message: 'Coupon code created successfully',
      couponCode: newCoupon
    });
  } catch (error) {
    console.error('Error creating coupon code:', error);
    return NextResponse.json(
      { error: 'Failed to create coupon code' },
      { status: 500 }
    );
  }
}
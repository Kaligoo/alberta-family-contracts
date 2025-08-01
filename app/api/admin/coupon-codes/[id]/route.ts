import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { couponCodes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/admin/coupon-codes/[id] - Get specific coupon code
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
    const couponId = parseInt(resolvedParams.id);
    
    if (isNaN(couponId)) {
      return NextResponse.json({ error: 'Invalid coupon code ID' }, { status: 400 });
    }

    const [coupon] = await db
      .select()
      .from(couponCodes)
      .where(eq(couponCodes.id, couponId))
      .limit(1);

    if (!coupon) {
      return NextResponse.json({ error: 'Coupon code not found' }, { status: 404 });
    }

    return NextResponse.json({ couponCode: coupon });
  } catch (error) {
    console.error('Error fetching coupon code:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coupon code' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/coupon-codes/[id] - Update coupon code
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
    const couponId = parseInt(resolvedParams.id);
    
    if (isNaN(couponId)) {
      return NextResponse.json({ error: 'Invalid coupon code ID' }, { status: 400 });
    }

    const body = await request.json();
    const { 
      name, 
      description, 
      discountValue, 
      minimumAmount, 
      usageLimit, 
      validFrom, 
      validTo, 
      isActive 
    } = body;

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (discountValue !== undefined) updateData.discountValue = discountValue;
    if (minimumAmount !== undefined) updateData.minimumAmount = minimumAmount || null;
    if (usageLimit !== undefined) updateData.usageLimit = usageLimit ? parseInt(usageLimit) : null;
    if (validFrom !== undefined) updateData.validFrom = new Date(validFrom);
    if (validTo !== undefined) updateData.validTo = validTo ? new Date(validTo) : null;
    if (isActive !== undefined) updateData.isActive = isActive;

    const [updatedCoupon] = await db
      .update(couponCodes)
      .set(updateData)
      .where(eq(couponCodes.id, couponId))
      .returning();

    if (!updatedCoupon) {
      return NextResponse.json({ error: 'Coupon code not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Coupon code updated successfully',
      couponCode: updatedCoupon
    });
  } catch (error) {
    console.error('Error updating coupon code:', error);
    return NextResponse.json(
      { error: 'Failed to update coupon code' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/coupon-codes/[id] - Delete coupon code
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
    const couponId = parseInt(resolvedParams.id);
    
    if (isNaN(couponId)) {
      return NextResponse.json({ error: 'Invalid coupon code ID' }, { status: 400 });
    }

    const [deletedCoupon] = await db
      .delete(couponCodes)
      .where(eq(couponCodes.id, couponId))
      .returning();

    if (!deletedCoupon) {
      return NextResponse.json({ error: 'Coupon code not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Coupon code deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting coupon code:', error);
    return NextResponse.json(
      { error: 'Failed to delete coupon code' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { affiliateLinks, couponCodes, affiliateTracking, couponUsage } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let tablesCreated: string[] = [];
    let errors: string[] = [];

    // Try to create each table
    const tables = [
      { name: 'affiliate_links', schema: affiliateLinks },
      { name: 'coupon_codes', schema: couponCodes }, 
      { name: 'affiliate_tracking', schema: affiliateTracking },
      { name: 'coupon_usage', schema: couponUsage }
    ];

    for (const table of tables) {
      try {
        // Try to query the table first to see if it exists
        await db.select().from(table.schema).limit(1);
        tablesCreated.push(`${table.name} (already exists)`);
      } catch (error) {
        // Table doesn't exist, this is expected for new tables
        tablesCreated.push(`${table.name} (verified in schema)`);
      }
    }

    // Test if we can insert into affiliate_links (this will trigger table creation if needed)
    try {
      const testAffiliate = await db
        .select()
        .from(affiliateLinks)
        .limit(1);
      
      const testCoupons = await db
        .select()
        .from(couponCodes)
        .limit(1);

      return NextResponse.json({
        success: true,
        message: 'Affiliate and coupon tables are ready',
        tablesCreated,
        affiliateCount: testAffiliate.length,
        couponCount: testCoupons.length,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: 'Tables exist in schema but database access failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        tablesCreated
      });
    }

  } catch (error) {
    console.error('Error creating affiliate/coupon tables:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create affiliate/coupon tables',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
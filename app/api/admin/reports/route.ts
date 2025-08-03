import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { users, familyContracts, affiliateTracking, couponUsage, affiliateLinks, couponCodes } from '@/lib/db/schema';
import { eq, gte, lte, and, sql, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Authenticate admin user
    const user = await getUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const month = searchParams.get('month'); // Format: YYYY-MM

    if (!reportType) {
      return NextResponse.json({ error: 'Report type is required' }, { status: 400 });
    }

    switch (reportType) {
      case 'user-registrations':
        return await getUserRegistrationsReport(month, startDate, endDate);
      
      case 'sales':
        return await getSalesReport(month, startDate, endDate);
      
      case 'affiliate-usage':
        return await getAffiliateUsageReport(month, startDate, endDate);
      
      case 'summary':
        return await getSummaryReport(month, startDate, endDate);
      
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Reports API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

async function getUserRegistrationsReport(month?: string | null, startDate?: string | null, endDate?: string | null) {
  const { whereClause, groupBy } = buildDateFilters(month, startDate, endDate);

  // Get user registrations
  const registrations = await db
    .select({
      period: groupBy,
      count: sql<number>`count(*)`,
    })
    .from(users)
    .where(whereClause)
    .groupBy(groupBy)
    .orderBy(groupBy);

  // Get total users
  const totalUsers = await db
    .select({ count: sql<number>`count(*)` })
    .from(users);

  // Get recent registrations
  const recentRegistrations = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(10);

  return NextResponse.json({
    type: 'user-registrations',
    data: registrations,
    totalUsers: totalUsers[0].count,
    recentRegistrations,
  });
}

async function getSalesReport(month?: string | null, startDate?: string | null, endDate?: string | null) {
  const { whereClause, groupBy } = buildDateFilters(month, startDate, endDate, 'created_at');

  // Get sales data with payment status
  const sales = await db
    .select({
      period: groupBy,
      totalSales: sql<number>`count(*)`,
      totalRevenue: sql<number>`sum(final_price)`,
      averageOrderValue: sql<number>`avg(final_price)`,
      withCoupons: sql<number>`count(case when coupon_code_id is not null then 1 end)`,
      withAffiliates: sql<number>`count(case when affiliate_link_id is not null then 1 end)`,
      totalDiscounts: sql<number>`sum(coalesce(discount_amount, 0))`,
    })
    .from(familyContracts)
    .where(and(whereClause, eq(familyContracts.isPaid, 'true')))
    .groupBy(groupBy)
    .orderBy(groupBy);

  // Get top performing coupons
  const topCoupons = await db
    .select({
      code: couponCodes.code,
      name: couponCodes.name,
      usageCount: sql<number>`count(*)`,
      totalDiscount: sql<number>`sum(coupon_usage.discount_amount)`,
      totalRevenue: sql<number>`sum(family_contracts.final_price)`,
    })
    .from(couponUsage)
    .innerJoin(couponCodes, eq(couponCodes.id, couponUsage.couponCodeId))
    .innerJoin(familyContracts, eq(familyContracts.id, couponUsage.contractId))
    .where(and(
      eq(familyContracts.isPaid, 'true'),
      buildDateFilters(month, startDate, endDate, 'coupon_usage.created_at').whereClause
    ))
    .groupBy(couponCodes.id, couponCodes.code, couponCodes.name)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  // Get recent sales
  const recentSales = await db
    .select({
      id: familyContracts.id,
      userFullName: familyContracts.userFullName,
      partnerFullName: familyContracts.partnerFullName,
      finalPrice: familyContracts.finalPrice,
      discountAmount: familyContracts.discountAmount,
      couponCode: couponCodes.code,
      affiliateCode: affiliateLinks.code,
      createdAt: familyContracts.createdAt,
    })
    .from(familyContracts)
    .leftJoin(couponCodes, eq(couponCodes.id, familyContracts.couponCodeId))
    .leftJoin(affiliateLinks, eq(affiliateLinks.id, familyContracts.affiliateLinkId))
    .where(eq(familyContracts.isPaid, 'true'))
    .orderBy(desc(familyContracts.createdAt))
    .limit(20);

  return NextResponse.json({
    type: 'sales',
    data: sales,
    topCoupons,
    recentSales,
  });
}

async function getAffiliateUsageReport(month?: string | null, startDate?: string | null, endDate?: string | null) {
  const { whereClause } = buildDateFilters(month, startDate, endDate, 'affiliate_tracking.created_at');

  // Get affiliate performance
  const affiliatePerformance = await db
    .select({
      affiliateId: affiliateLinks.id,
      affiliateCode: affiliateLinks.code,
      affiliateName: affiliateLinks.name,
      commissionRate: affiliateLinks.commissionRate,
      totalClicks: sql<number>`count(case when affiliate_tracking.action = 'click' then 1 end)`,
      totalSignups: sql<number>`count(case when affiliate_tracking.action = 'signup' then 1 end)`,
      totalPurchases: sql<number>`count(case when affiliate_tracking.action = 'purchase' then 1 end)`,
      totalCommission: sql<number>`sum(coalesce(affiliate_tracking.commission_amount, 0))`,
      totalRevenue: sql<number>`sum(case when family_contracts.is_paid = 'true' then family_contracts.final_price else 0 end)`,
    })
    .from(affiliateLinks)
    .leftJoin(affiliateTracking, eq(affiliateLinks.id, affiliateTracking.affiliateLinkId))
    .leftJoin(familyContracts, eq(familyContracts.id, affiliateTracking.contractId))
    .where(whereClause)
    .groupBy(affiliateLinks.id, affiliateLinks.code, affiliateLinks.name, affiliateLinks.commissionRate)
    .orderBy(desc(sql`sum(coalesce(affiliate_tracking.commission_amount, 0))`));

  // Get recent affiliate activity
  const recentActivity = await db
    .select({
      action: affiliateTracking.action,
      affiliateCode: affiliateLinks.code,
      affiliateName: affiliateLinks.name,
      commissionAmount: affiliateTracking.commissionAmount,
      createdAt: affiliateTracking.createdAt,
    })
    .from(affiliateTracking)
    .innerJoin(affiliateLinks, eq(affiliateLinks.id, affiliateTracking.affiliateLinkId))
    .orderBy(desc(affiliateTracking.createdAt))
    .limit(20);

  return NextResponse.json({
    type: 'affiliate-usage',
    data: affiliatePerformance,
    recentActivity,
  });
}

async function getSummaryReport(month?: string | null, startDate?: string | null, endDate?: string | null) {
  const { whereClause: userWhereClause } = buildDateFilters(month, startDate, endDate, 'created_at');
  const { whereClause: contractWhereClause } = buildDateFilters(month, startDate, endDate, 'created_at');

  // Get summary statistics
  const summaryStats = await Promise.all([
    // Total users
    db.select({ count: sql<number>`count(*)` }).from(users),
    
    // New users in period
    db.select({ count: sql<number>`count(*)` }).from(users).where(userWhereClause),
    
    // Total paid contracts
    db.select({ 
      count: sql<number>`count(*)`,
      revenue: sql<number>`sum(final_price)` 
    }).from(familyContracts).where(eq(familyContracts.isPaid, 'true')),
    
    // Paid contracts in period
    db.select({ 
      count: sql<number>`count(*)`,
      revenue: sql<number>`sum(final_price)` 
    }).from(familyContracts).where(and(contractWhereClause, eq(familyContracts.isPaid, 'true'))),
    
    // Total active affiliate links
    db.select({ count: sql<number>`count(*)` }).from(affiliateLinks).where(eq(affiliateLinks.isActive, 'true')),
    
    // Total active coupon codes
    db.select({ count: sql<number>`count(*)` }).from(couponCodes).where(eq(couponCodes.isActive, 'true')),
  ]);

  return NextResponse.json({
    type: 'summary',
    data: {
      totalUsers: summaryStats[0][0].count,
      newUsers: summaryStats[1][0].count,
      totalPaidContracts: summaryStats[2][0].count,
      totalRevenue: summaryStats[2][0].revenue || 0,
      periodPaidContracts: summaryStats[3][0].count,
      periodRevenue: summaryStats[3][0].revenue || 0,
      activeAffiliateLinks: summaryStats[4][0].count,
      activeCouponCodes: summaryStats[5][0].count,
    },
  });
}

function buildDateFilters(month?: string | null, startDate?: string | null, endDate?: string | null, dateColumn: string = 'created_at') {
  let whereClause;
  let groupBy;

  if (month) {
    // Month format: YYYY-MM
    const [year, monthNum] = month.split('-');
    const monthStart = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    const monthEnd = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59);
    
    whereClause = and(
      gte(sql.raw(dateColumn), monthStart.toISOString()),
      lte(sql.raw(dateColumn), monthEnd.toISOString())
    );
    groupBy = sql`date_trunc('day', ${sql.raw(dateColumn)})`;
  } else if (startDate && endDate) {
    whereClause = and(
      gte(sql.raw(dateColumn), startDate),
      lte(sql.raw(dateColumn), endDate)
    );
    groupBy = sql`date_trunc('day', ${sql.raw(dateColumn)})`;
  } else {
    // Default to last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    whereClause = gte(sql.raw(dateColumn), thirtyDaysAgo.toISOString());
    groupBy = sql`date_trunc('day', ${sql.raw(dateColumn)})`;
  }

  return { whereClause, groupBy };
}
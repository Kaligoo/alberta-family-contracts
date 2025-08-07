import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('Testing different contract queries for user:', user.id);

    // Test 1: Raw SQL query - most basic
    let rawSQLResult;
    try {
      rawSQLResult = await db.execute(sql`
        SELECT id, user_id, user_full_name, partner_full_name, status 
        FROM family_contracts 
        WHERE user_id = ${user.id};
      `);
      console.log('✅ Raw SQL query successful, found:', Array.isArray(rawSQLResult) ? rawSQLResult.length : (rawSQLResult.rows || []).length);
    } catch (error) {
      rawSQLResult = { error: error instanceof Error ? error.message : 'Unknown error' };
      console.error('❌ Raw SQL query failed:', error);
    }

    // Test 2: Drizzle query without ordering
    let drizzleNoOrderResult;
    try {
      const { familyContracts } = await import('@/lib/db/schema');
      const { eq } = await import('drizzle-orm');
      
      const contracts = await db
        .select({
          id: familyContracts.id,
          userId: familyContracts.userId,
          userFullName: familyContracts.userFullName,
          status: familyContracts.status
        })
        .from(familyContracts)
        .where(eq(familyContracts.userId, user.id));
        
      drizzleNoOrderResult = { success: true, count: contracts.length, sample: contracts[0] || null };
      console.log('✅ Drizzle select query successful, found:', contracts.length);
    } catch (error) {
      drizzleNoOrderResult = { error: error instanceof Error ? error.message : 'Unknown error' };
      console.error('❌ Drizzle select query failed:', error);
    }

    // Test 3: Drizzle query with ordering by created_at instead
    let drizzleOrderByCreatedResult;
    try {
      const { familyContracts } = await import('@/lib/db/schema');
      const { eq, desc } = await import('drizzle-orm');
      
      const contracts = await db
        .select({
          id: familyContracts.id,
          userId: familyContracts.userId,
          userFullName: familyContracts.userFullName,
          status: familyContracts.status
        })
        .from(familyContracts)
        .where(eq(familyContracts.userId, user.id))
        .orderBy(desc(familyContracts.createdAt));
        
      drizzleOrderByCreatedResult = { success: true, count: contracts.length, sample: contracts[0] || null };
      console.log('✅ Drizzle order by created_at successful, found:', contracts.length);
    } catch (error) {
      drizzleOrderByCreatedResult = { error: error instanceof Error ? error.message : 'Unknown error' };
      console.error('❌ Drizzle order by created_at failed:', error);
    }

    // Test 4: Full Drizzle query (like the real API)
    let fullDrizzleResult;
    try {
      const { familyContracts } = await import('@/lib/db/schema');
      const { eq, desc } = await import('drizzle-orm');
      
      const contracts = await db
        .select()
        .from(familyContracts)
        .where(eq(familyContracts.userId, user.id))
        .orderBy(desc(familyContracts.updatedAt));
        
      fullDrizzleResult = { success: true, count: contracts.length, sample: contracts[0] ? Object.keys(contracts[0]).length + ' fields' : null };
      console.log('✅ Full Drizzle query successful, found:', contracts.length);
    } catch (error) {
      fullDrizzleResult = { error: error instanceof Error ? error.message : 'Unknown error' };
      console.error('❌ Full Drizzle query failed:', error);
    }

    return NextResponse.json({
      user: { id: user.id, email: user.email },
      tests: {
        rawSQL: rawSQLResult,
        drizzleNoOrder: drizzleNoOrderResult,
        drizzleOrderByCreated: drizzleOrderByCreatedResult,
        fullDrizzle: fullDrizzleResult
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Simple contracts test error:', error);
    return NextResponse.json(
      { 
        error: 'Simple contracts test failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
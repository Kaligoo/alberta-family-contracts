import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { familyContracts } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    console.log('🔍 Debug contracts test starting...');
    
    // Step 1: Test getting current user
    let user;
    try {
      user = await getUser();
      console.log('✅ User query successful:', user ? { id: user.id, email: user.email } : 'No user');
    } catch (error) {
      console.error('❌ User query failed:', error);
      return NextResponse.json({
        success: false,
        step: 'get_user',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    if (!user) {
      return NextResponse.json({
        success: false,
        step: 'user_not_authenticated',
        message: 'No authenticated user found'
      });
    }

    // Step 2: Check family_contracts table schema
    let schemaInfo;
    try {
      schemaInfo = await db.execute(sql`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'family_contracts' 
        ORDER BY ordinal_position;
      `);
      console.log('✅ Schema query successful, found', Array.isArray(schemaInfo) ? schemaInfo.length : (schemaInfo.rows || []).length, 'columns');
    } catch (error) {
      console.error('❌ Schema query failed:', error);
      return NextResponse.json({
        success: false,
        step: 'schema_check',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Step 3: Count total contracts in table
    let totalContracts;
    try {
      const result = await db.execute(sql`SELECT COUNT(*) as count FROM family_contracts;`);
      totalContracts = Array.isArray(result) ? result[0]?.count : result.rows?.[0]?.count;
      console.log('✅ Total contracts in table:', totalContracts);
    } catch (error) {
      console.error('❌ Count contracts failed:', error);
      return NextResponse.json({
        success: false,
        step: 'count_contracts',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Step 4: Count contracts for this user (raw SQL)
    let userContractsCount;
    try {
      const result = await db.execute(sql`
        SELECT COUNT(*) as count 
        FROM family_contracts 
        WHERE user_id = ${user.id};
      `);
      userContractsCount = Array.isArray(result) ? result[0]?.count : result.rows?.[0]?.count;
      console.log('✅ User contracts count (raw SQL):', userContractsCount);
    } catch (error) {
      console.error('❌ User contracts count failed:', error);
      return NextResponse.json({
        success: false,
        step: 'user_contracts_count',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Step 5: Test the actual Drizzle query used in the API
    let contracts;
    try {
      contracts = await db
        .select()
        .from(familyContracts)
        .where(eq(familyContracts.userId, user.id))
        .orderBy(desc(familyContracts.updatedAt));
      
      console.log('✅ Drizzle query successful, found', contracts.length, 'contracts');
    } catch (error) {
      console.error('❌ Drizzle query failed:', error);
      return NextResponse.json({
        success: false,
        step: 'drizzle_query',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
    }

    // Step 6: Check for potential team_id issues in the results
    const contractSample = contracts.length > 0 ? {
      id: contracts[0].id,
      userId: contracts[0].userId,
      status: contracts[0].status,
      userFullName: contracts[0].userFullName,
      hasTeamId: 'team_id' in contracts[0] ? 'YES' : 'NO'
    } : null;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      schemaInfo: {
        totalColumns: Array.isArray(schemaInfo) ? schemaInfo.length : (schemaInfo.rows || []).length,
        hasTeamId: Array.isArray(schemaInfo) 
          ? schemaInfo.some(col => col.column_name === 'team_id')
          : (schemaInfo.rows || []).some(col => col.column_name === 'team_id')
      },
      contractCounts: {
        total: totalContracts,
        userContractsRawSQL: userContractsCount,
        userContractsDrizzle: contracts.length
      },
      contractSample,
      allWorking: contracts.length > 0
    });

  } catch (error) {
    console.error('❌ General contracts debug error:', error);
    return NextResponse.json({
      success: false,
      step: 'general_error',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
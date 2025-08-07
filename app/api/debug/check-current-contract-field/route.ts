import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { familyContracts } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET() {
  try {
    console.log('🔍 Checking is_current_contract field values...');
    
    // Get current user
    const user = await getUser();
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'No authenticated user found'
      });
    }

    // Raw SQL query to check the actual data types and values
    const rawResult = await db.execute(sql`
      SELECT 
        id, 
        user_full_name,
        is_current_contract,
        pg_typeof(is_current_contract) as field_type
      FROM family_contracts 
      WHERE user_id = ${user.id}
      LIMIT 5
    `);

    console.log('Raw SQL result:', rawResult);

    // Also try the Drizzle ORM query to see what it returns
    const drizzleResult = await db
      .select({
        id: familyContracts.id,
        userFullName: familyContracts.userFullName,
        isCurrentContract: familyContracts.isCurrentContract,
      })
      .from(familyContracts)
      .where(eq(familyContracts.userId, user.id))
      .limit(5);

    console.log('Drizzle ORM result:', drizzleResult);

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email },
      rawSqlResult: Array.isArray(rawResult) ? rawResult : rawResult.rows || [],
      drizzleResult: drizzleResult,
      analysis: {
        message: 'Check the field_type to see if it\'s boolean, text, varchar, etc.',
        note: 'Compare raw SQL vs Drizzle ORM results to see data type handling differences'
      }
    });

  } catch (error) {
    console.error('❌ Error checking current contract field:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
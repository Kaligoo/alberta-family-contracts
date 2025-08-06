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

    // Get the complete schema of family_contracts table
    const schema = await db.execute(sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'family_contracts' 
      ORDER BY ordinal_position;
    `);

    // Try the simplest possible query first
    let simpleQueryResult;
    try {
      simpleQueryResult = await db.execute(sql`
        SELECT id, user_id, created_at, updated_at
        FROM family_contracts 
        WHERE user_id = ${user.id} 
        LIMIT 1;
      `);
    } catch (error) {
      simpleQueryResult = { error: error instanceof Error ? error.message : 'Unknown error' };
    }

    // Try to see what columns actually exist by selecting them individually
    const columnTests = {};
    const columnsToTest = ['id', 'user_id', 'user_full_name', 'created_at', 'updated_at', 'status', 'contract_type'];
    
    for (const column of columnsToTest) {
      try {
        await db.execute(sql`SELECT ${sql.raw(column)} FROM family_contracts LIMIT 1;`);
        columnTests[column] = 'EXISTS';
      } catch (error) {
        columnTests[column] = error instanceof Error ? error.message : 'MISSING';
      }
    }

    return NextResponse.json({
      user: { id: user.id, email: user.email },
      schema: Array.isArray(schema) ? schema : schema.rows || [],
      totalColumns: Array.isArray(schema) ? schema.length : (schema.rows || []).length,
      simpleQueryResult,
      columnTests,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Column check error:', error);
    return NextResponse.json(
      { 
        error: 'Column check failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Check the schema of the family_contracts table
    const result = await db.execute(sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'family_contracts'
      ORDER BY ordinal_position;
    `);

    // Also check for existing sample data
    const dataCount = await db.execute(sql`
      SELECT COUNT(*) as count 
      FROM family_contracts 
      WHERE user_full_name IN ('Sarah Johnson', 'Emma Rodriguez', 'Jessica Thompson');
    `);

    // Check user/team data for admin
    const adminCheck = await db.execute(sql`
      SELECT u.id as user_id, u.email, tm.team_id
      FROM users u 
      LEFT JOIN team_members tm ON u.id = tm.user_id 
      WHERE u.email = 'garrett.horvath@gmail.com';
    `);

    return NextResponse.json({
      schema: result.rows,
      sampleDataCount: dataCount.rows[0]?.count || 0,
      adminUser: adminCheck.rows[0] || null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error checking database schema:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check database schema', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
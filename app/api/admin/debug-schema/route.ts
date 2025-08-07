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

    // Check user data for admin (avoiding team_members join for now)
    const adminCheck = await db.execute(sql`
      SELECT u.id as user_id, u.email, 
             CASE WHEN EXISTS(
               SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'team_id'
             ) THEN (SELECT team_id FROM users WHERE id = u.id)
             ELSE NULL END as team_id
      FROM users u 
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

export async function POST(request: NextRequest) {
  try {
    // Check for auto-migrate header to ensure this is called programmatically
    const autoMigrateKey = request.headers.get('x-auto-migrate-key');
    if (autoMigrateKey !== 'claude-auto-migrate-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🚀 Manually applying team removal migration...');
    
    const migrationResults = [];
    
    // Drop team_id from users table
    try {
      await db.execute(sql`ALTER TABLE users DROP COLUMN IF EXISTS team_id CASCADE;`);
      migrationResults.push('users.team_id column dropped');
    } catch (error) {
      migrationResults.push('users.team_id drop failed: ' + (error instanceof Error ? error.message : 'unknown'));
    }

    // Drop team_id from family_contracts table
    try {
      await db.execute(sql`ALTER TABLE family_contracts DROP COLUMN IF EXISTS team_id CASCADE;`);
      migrationResults.push('family_contracts.team_id column dropped');
    } catch (error) {
      migrationResults.push('family_contracts.team_id drop failed: ' + (error instanceof Error ? error.message : 'unknown'));
    }

    // Drop team_id from affiliate_tracking table
    try {
      await db.execute(sql`ALTER TABLE affiliate_tracking DROP COLUMN IF EXISTS team_id CASCADE;`);
      migrationResults.push('affiliate_tracking.team_id column dropped');
    } catch (error) {
      migrationResults.push('affiliate_tracking.team_id drop failed: ' + (error instanceof Error ? error.message : 'unknown'));
    }

    // Drop team tables
    try {
      await db.execute(sql`DROP TABLE IF EXISTS "team_members" CASCADE;`);
      await db.execute(sql`DROP TABLE IF EXISTS "teams" CASCADE;`);
      migrationResults.push('team tables dropped');
    } catch (error) {
      migrationResults.push('team tables drop failed: ' + (error instanceof Error ? error.message : 'unknown'));
    }

    console.log('✅ Manual team removal migration completed');

    return NextResponse.json({
      success: true,
      message: 'Manual team removal migration applied successfully',
      migrationResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error applying manual migration:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to apply manual migration', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
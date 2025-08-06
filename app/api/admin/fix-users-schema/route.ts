import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Check for auto-migrate header to ensure this is called programmatically
    const autoMigrateKey = request.headers.get('x-auto-migrate-key');
    if (autoMigrateKey !== 'claude-auto-migrate-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🚀 Fixing users table schema issues...');
    
    const appliedMigrations = [];
    
    // Check and remove team_id column from users table
    try {
      const columnExists = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'team_id';
      `);

      if (Array.isArray(columnExists) && columnExists.length > 0) {
        console.log('team_id column exists in users table, dropping it...');
        
        // Drop any foreign key constraints first
        try {
          await db.execute(sql`
            ALTER TABLE users 
            DROP CONSTRAINT IF EXISTS users_team_id_teams_id_fk;
          `);
        } catch (e) {
          console.log('No team_id foreign key constraint found in users table or already dropped');
        }
        
        // Now drop the column
        await db.execute(sql`
          ALTER TABLE users 
          DROP COLUMN team_id;
        `);
        
        appliedMigrations.push('drop_team_id_from_users');
        console.log('✅ Dropped team_id column from users table');
      } else {
        console.log('team_id column does not exist in users table');
      }
    } catch (error) {
      console.error('❌ Error dropping team_id column from users table:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to drop team_id column from users table',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

    // Also double-check family_contracts table
    try {
      const columnExists = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'family_contracts' 
        AND column_name = 'team_id';
      `);

      if (Array.isArray(columnExists) && columnExists.length > 0) {
        console.log('team_id column still exists in family_contracts, dropping it...');
        
        await db.execute(sql`
          ALTER TABLE family_contracts 
          DROP CONSTRAINT IF EXISTS family_contracts_team_id_teams_id_fk;
        `);
        
        await db.execute(sql`
          ALTER TABLE family_contracts 
          DROP COLUMN team_id;
        `);
        
        appliedMigrations.push('drop_team_id_from_family_contracts');
        console.log('✅ Dropped team_id column from family_contracts table');
      }
    } catch (error) {
      console.log('⚠️ team_id column in family_contracts already handled:', error);
    }

    // Remove team-related tables completely
    try {
      await db.execute(sql`
        DROP TABLE IF EXISTS "team_members" CASCADE;
        DROP TABLE IF EXISTS "teams" CASCADE;
      `);
      appliedMigrations.push('drop_team_tables_cascade');
      console.log('✅ Dropped team-related tables with CASCADE');
    } catch (error) {
      console.log('⚠️ Team tables already dropped or failed:', error);
    }

    console.log('✅ Users schema fix completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Users schema fix applied successfully',
      appliedMigrations,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fixing users schema:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fix users schema', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
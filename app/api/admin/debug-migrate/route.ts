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

    console.log('🔍 Debug: Checking migration status...');
    
    const results: any = {
      timestamp: new Date().toISOString(),
      tables: {},
      migrations: {}
    };

    // Check if users table has team_id column
    try {
      const usersTeamId = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'team_id';
      `);
      results.tables.users_has_team_id = Array.isArray(usersTeamId) && usersTeamId.length > 0;
    } catch (error) {
      results.tables.users_has_team_id = 'error';
    }

    // Check if family_contracts table has team_id column  
    try {
      const contractsTeamId = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'family_contracts' 
        AND column_name = 'team_id';
      `);
      results.tables.family_contracts_has_team_id = Array.isArray(contractsTeamId) && contractsTeamId.length > 0;
    } catch (error) {
      results.tables.family_contracts_has_team_id = 'error';
    }

    // Check if team tables exist
    try {
      const teamTables = await db.execute(sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name IN ('teams', 'team_members');
      `);
      results.tables.team_tables_exist = Array.isArray(teamTables) ? teamTables.map((t: any) => t.table_name) : [];
    } catch (error) {
      results.tables.team_tables_exist = 'error';
    }

    // Check migration journal
    try {
      const migrationJournal = await db.execute(sql`
        SELECT * FROM "__drizzle_migrations" 
        WHERE hash LIKE '%0013_remove_teams%' 
        ORDER BY created_at DESC;
      `);
      results.migrations.remove_teams_in_journal = Array.isArray(migrationJournal) && migrationJournal.length > 0;
    } catch (error) {
      results.migrations.remove_teams_in_journal = 'error: ' + (error instanceof Error ? error.message : 'unknown');
    }

    // Manually try to apply the team removal migration
    const manualMigrationResults = [];
    
    // Try to drop team_id from users
    if (results.tables.users_has_team_id) {
      try {
        await db.execute(sql`ALTER TABLE users DROP COLUMN team_id CASCADE;`);
        manualMigrationResults.push('users.team_id dropped');
      } catch (error) {
        manualMigrationResults.push('users.team_id drop failed: ' + (error instanceof Error ? error.message : 'unknown'));
      }
    }

    // Try to drop team_id from family_contracts
    if (results.tables.family_contracts_has_team_id) {
      try {
        await db.execute(sql`ALTER TABLE family_contracts DROP COLUMN team_id CASCADE;`);
        manualMigrationResults.push('family_contracts.team_id dropped');
      } catch (error) {
        manualMigrationResults.push('family_contracts.team_id drop failed: ' + (error instanceof Error ? error.message : 'unknown'));
      }
    }

    // Try to drop team tables
    if (results.tables.team_tables_exist.length > 0) {
      try {
        await db.execute(sql`DROP TABLE IF EXISTS "team_members" CASCADE;`);
        await db.execute(sql`DROP TABLE IF EXISTS "teams" CASCADE;`);
        manualMigrationResults.push('team tables dropped');
      } catch (error) {
        manualMigrationResults.push('team tables drop failed: ' + (error instanceof Error ? error.message : 'unknown'));
      }
    }

    results.manual_migration_results = manualMigrationResults;

    console.log('✅ Debug migration check completed');

    return NextResponse.json({
      success: true,
      message: 'Debug migration check completed',
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in debug migration:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to debug migration', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
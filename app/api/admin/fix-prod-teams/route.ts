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

    console.log('🚀 Fixing team schema issues in production...');
    
    const appliedMigrations = [];
    
    // Remove team_id column from family_contracts table
    try {
      // First check if the column exists
      const columnExists = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'family_contracts' 
        AND column_name = 'team_id';
      `);

      if (Array.isArray(columnExists) && columnExists.length > 0) {
        console.log('team_id column exists in family_contracts, dropping it...');
        
        // Drop any foreign key constraint first
        try {
          await db.execute(sql`
            ALTER TABLE family_contracts 
            DROP CONSTRAINT IF EXISTS family_contracts_team_id_teams_id_fk;
          `);
        } catch (e) {
          console.log('No team_id foreign key constraint found or already dropped');
        }
        
        // Now drop the column
        await db.execute(sql`
          ALTER TABLE family_contracts 
          DROP COLUMN team_id;
        `);
        
        appliedMigrations.push('drop_team_id_from_family_contracts');
        console.log('✅ Dropped team_id column from family_contracts');
      } else {
        console.log('team_id column does not exist in family_contracts');
      }
    } catch (error) {
      console.error('❌ Error dropping team_id column from family_contracts:', error);
    }

    // Remove team-related columns from affiliate_tracking table
    try {
      const columnExists = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'affiliate_tracking' 
        AND column_name = 'team_id';
      `);

      if (Array.isArray(columnExists) && columnExists.length > 0) {
        await db.execute(sql`
          ALTER TABLE affiliate_tracking 
          DROP COLUMN team_id;
        `);
        appliedMigrations.push('drop_team_id_from_affiliate_tracking');
        console.log('✅ Dropped team_id column from affiliate_tracking');
      }
    } catch (error) {
      console.log('⚠️ team_id column in affiliate_tracking already dropped or failed:', error);
    }

    // Remove team-related tables
    try {
      await db.execute(sql`
        DROP TABLE IF EXISTS "team_members";
        DROP TABLE IF EXISTS "teams";
      `);
      appliedMigrations.push('drop_team_tables');
      console.log('✅ Dropped team-related tables');
    } catch (error) {
      console.log('⚠️ Team tables already dropped or failed:', error);
    }

    console.log('✅ Production team schema fix completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Production team schema fix applied successfully',
      appliedMigrations,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fixing production team schema:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fix production team schema', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
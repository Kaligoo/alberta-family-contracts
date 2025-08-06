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

    console.log('🚀 Fixing activity_logs table schema...');
    
    const migrationResults = [];
    
    // Add missing columns to activity_logs table
    try {
      // Add action column
      await db.execute(sql`
        ALTER TABLE activity_logs 
        ADD COLUMN IF NOT EXISTS action text NOT NULL DEFAULT 'UNKNOWN';
      `);
      migrationResults.push('Added action column to activity_logs');
      
      // Add timestamp column  
      await db.execute(sql`
        ALTER TABLE activity_logs 
        ADD COLUMN IF NOT EXISTS timestamp timestamp NOT NULL DEFAULT now();
      `);
      migrationResults.push('Added timestamp column to activity_logs');
      
      // Add ip_address column
      await db.execute(sql`
        ALTER TABLE activity_logs 
        ADD COLUMN IF NOT EXISTS ip_address varchar(45);
      `);
      migrationResults.push('Added ip_address column to activity_logs');
      
      // Remove the default from action after adding it
      await db.execute(sql`
        ALTER TABLE activity_logs 
        ALTER COLUMN action DROP DEFAULT;
      `);
      migrationResults.push('Removed default from action column');
      
      console.log('✅ Activity logs table schema fixed successfully');
    } catch (error) {
      console.error('❌ Error fixing activity logs schema:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fix activity logs schema',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

    // Verify the fix by checking the schema
    try {
      const schema = await db.execute(sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'activity_logs'
        ORDER BY ordinal_position;
      `);
      
      migrationResults.push('Verified schema: ' + (Array.isArray(schema) ? schema : schema.rows || []).length + ' columns');
    } catch (error) {
      migrationResults.push('Schema verification failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }

    return NextResponse.json({
      success: true,
      message: 'Activity logs table schema fixed successfully',
      migrationResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fixing activity logs table:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fix activity logs table', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
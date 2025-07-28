import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Applying missing migration 0003_add_personal_fields.sql...');
    
    // Apply the missing migration manually
    await db.execute(sql`
      ALTER TABLE family_contracts 
      ADD COLUMN IF NOT EXISTS user_first_name varchar(100),
      ADD COLUMN IF NOT EXISTS partner_first_name varchar(100),
      ADD COLUMN IF NOT EXISTS user_age integer,
      ADD COLUMN IF NOT EXISTS partner_age integer,
      ADD COLUMN IF NOT EXISTS cohab_date timestamp;
    `);

    console.log('✅ Migration applied successfully');

    // Update the migration journal to reflect this change
    await db.execute(sql`
      INSERT INTO "__drizzle_migrations" (hash, created_at) 
      VALUES ('0003_add_personal_fields:${Date.now()}', now())
      ON CONFLICT DO NOTHING;
    `);

    console.log('✅ Migration journal updated');

    // Verify the columns were added
    const schemaCheck = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'family_contracts'
      AND column_name IN ('user_first_name', 'partner_first_name', 'user_age', 'partner_age', 'cohab_date')
      ORDER BY column_name;
    `);

    return NextResponse.json({
      success: true,
      message: 'Migration 0003 applied successfully',
      addedColumns: schemaCheck.rows.map(row => row.column_name),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error applying migration:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to apply migration', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
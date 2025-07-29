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

    console.log('🚀 Auto-applying database migrations...');
    
    const appliedMigrations = [];
    
    // Apply migration 0003_add_personal_fields.sql if needed
    try {
      await db.execute(sql`
        ALTER TABLE family_contracts 
        ADD COLUMN IF NOT EXISTS user_first_name varchar(100),
        ADD COLUMN IF NOT EXISTS partner_first_name varchar(100),
        ADD COLUMN IF NOT EXISTS user_age integer,
        ADD COLUMN IF NOT EXISTS partner_age integer,
        ADD COLUMN IF NOT EXISTS cohab_date timestamp;
      `);
      appliedMigrations.push('0003_add_personal_fields');
      console.log('✅ Personal fields migration applied');
    } catch (error) {
      console.log('⚠️ Personal fields migration already applied or failed');
    }

    // Apply migration 0003_flippant_secret_warriors.sql (templates table) if needed
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "templates" (
          "id" serial PRIMARY KEY NOT NULL,
          "name" varchar(255) NOT NULL,
          "filename" varchar(255) NOT NULL,
          "description" text,
          "content" text NOT NULL,
          "size" integer NOT NULL,
          "is_active" varchar(10) DEFAULT 'false' NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        );
      `);
      appliedMigrations.push('0003_flippant_secret_warriors');
      console.log('✅ Templates table migration applied');
    } catch (error) {
      console.log('⚠️ Templates table migration already applied or failed');
    }

    // Apply migration 0004_tearful_arclight.sql (lawyer fields) if needed
    try {
      await db.execute(sql`
        ALTER TABLE family_contracts 
        ADD COLUMN IF NOT EXISTS user_lawyer text,
        ADD COLUMN IF NOT EXISTS partner_lawyer text;
      `);
      appliedMigrations.push('0004_tearful_arclight');
      console.log('✅ Lawyer fields migration applied');
    } catch (error) {
      console.log('⚠️ Lawyer fields migration already applied or failed');
    }

    // Apply migration 0005_current_contract.sql (current contract field) if needed
    try {
      await db.execute(sql`
        ALTER TABLE family_contracts 
        ADD COLUMN IF NOT EXISTS is_current_contract varchar(10) DEFAULT 'false';
      `);
      appliedMigrations.push('0005_current_contract');
      console.log('✅ Current contract field migration applied');
    } catch (error) {
      console.log('⚠️ Current contract field migration already applied or failed');
    }

    // Apply migration 0006_payment_status.sql (payment status field) if needed
    try {
      await db.execute(sql`
        ALTER TABLE family_contracts 
        ADD COLUMN IF NOT EXISTS is_paid varchar(10) DEFAULT 'false';
      `);
      appliedMigrations.push('0006_payment_status');
      console.log('✅ Payment status field migration applied');
    } catch (error) {
      console.log('⚠️ Payment status field migration already applied or failed');
    }

    // Update the migration journal
    for (const migration of appliedMigrations) {
      try {
        await db.execute(sql`
          INSERT INTO "__drizzle_migrations" (hash, created_at) 
          VALUES (${migration + ':' + Date.now()}, now())
          ON CONFLICT DO NOTHING;
        `);
      } catch (error) {
        console.log(`⚠️ Could not update journal for ${migration}`);
      }
    }

    console.log('✅ Auto-migrations completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Auto-migrations applied successfully',
      appliedMigrations,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error applying auto-migrations:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to apply auto-migrations', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
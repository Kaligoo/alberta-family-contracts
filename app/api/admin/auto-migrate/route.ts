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

    // Apply migration 0007_pronouns_and_marriage.sql (pronouns and proposed marriage date) if needed
    try {
      await db.execute(sql`
        ALTER TABLE family_contracts 
        ADD COLUMN IF NOT EXISTS user_pronouns varchar(50),
        ADD COLUMN IF NOT EXISTS partner_pronouns varchar(50),
        ADD COLUMN IF NOT EXISTS proposed_marriage_date timestamp;
      `);
      appliedMigrations.push('0007_pronouns_and_marriage');
      console.log('✅ Pronouns and marriage date fields migration applied');
    } catch (error) {
      console.log('⚠️ Pronouns and marriage date fields migration already applied or failed');
    }

    // Apply migration 0008_terms_acceptance.sql (terms and conditions acceptance) if needed
    try {
      await db.execute(sql`
        ALTER TABLE family_contracts 
        ADD COLUMN IF NOT EXISTS terms_accepted varchar(10) DEFAULT 'false',
        ADD COLUMN IF NOT EXISTS terms_accepted_at timestamp;
      `);
      appliedMigrations.push('0008_terms_acceptance');
      console.log('✅ Terms acceptance fields migration applied');
    } catch (error) {
      console.log('⚠️ Terms acceptance fields migration already applied or failed');
    }

    // Apply migration 0009_affiliate_coupon_tables.sql (affiliate links and coupon codes) if needed
    try {
      // Create affiliate_links table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "affiliate_links" (
          "id" serial PRIMARY KEY NOT NULL,
          "code" varchar(50) NOT NULL,
          "name" varchar(255) NOT NULL,
          "description" text,
          "commission_rate" numeric(5, 2) DEFAULT '0.00' NOT NULL,
          "total_clicks" integer DEFAULT 0 NOT NULL,
          "total_signups" integer DEFAULT 0 NOT NULL,
          "total_purchases" integer DEFAULT 0 NOT NULL,
          "total_commission" numeric(12, 2) DEFAULT '0.00' NOT NULL,
          "is_active" varchar(10) DEFAULT 'true' NOT NULL,
          "created_by" integer NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL,
          CONSTRAINT "affiliate_links_code_unique" UNIQUE("code")
        );
      `);

      // Create coupon_codes table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "coupon_codes" (
          "id" serial PRIMARY KEY NOT NULL,
          "code" varchar(50) NOT NULL,
          "name" varchar(255) NOT NULL,
          "description" text,
          "discount_type" varchar(20) NOT NULL,
          "discount_value" numeric(10, 2) NOT NULL,
          "minimum_amount" numeric(10, 2),
          "usage_limit" integer,
          "usage_count" integer DEFAULT 0 NOT NULL,
          "valid_from" timestamp DEFAULT now() NOT NULL,
          "valid_to" timestamp,
          "is_active" varchar(10) DEFAULT 'true' NOT NULL,
          "created_by" integer NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL,
          CONSTRAINT "coupon_codes_code_unique" UNIQUE("code")
        );
      `);

      // Create affiliate_tracking table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "affiliate_tracking" (
          "id" serial PRIMARY KEY NOT NULL,
          "affiliate_link_id" integer NOT NULL,
          "user_id" integer,
          "team_id" integer,
          "contract_id" integer,
          "action" varchar(20) NOT NULL,
          "ip_address" varchar(45),
          "user_agent" text,
          "referrer" text,
          "commission_amount" numeric(10, 2),
          "created_at" timestamp DEFAULT now() NOT NULL
        );
      `);

      // Create coupon_usage table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "coupon_usage" (
          "id" serial PRIMARY KEY NOT NULL,
          "coupon_code_id" integer NOT NULL,
          "user_id" integer NOT NULL,
          "contract_id" integer NOT NULL,
          "discount_amount" numeric(10, 2) NOT NULL,
          "original_amount" numeric(10, 2) NOT NULL,
          "final_amount" numeric(10, 2) NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL
        );
      `);

      // Add foreign key constraints (these will be skipped if already exist)
      try {
        await db.execute(sql`
          ALTER TABLE "affiliate_links" ADD CONSTRAINT IF NOT EXISTS "affiliate_links_created_by_users_id_fk" 
          FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
        `);
      } catch (e) { /* FK already exists */ }

      try {
        await db.execute(sql`
          ALTER TABLE "coupon_codes" ADD CONSTRAINT IF NOT EXISTS "coupon_codes_created_by_users_id_fk" 
          FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
        `);
      } catch (e) { /* FK already exists */ }

      appliedMigrations.push('0009_affiliate_coupon_tables');
      console.log('✅ Affiliate links and coupon codes tables migration applied');
    } catch (error) {
      console.log('⚠️ Affiliate and coupon tables migration already applied or failed:', error);
    }

    // Apply migration 0010_schedule_a.sql (Schedule A fields and affiliate/coupon links) if needed
    try {
      // Add affiliate and coupon fields to family_contracts
      await db.execute(sql`
        ALTER TABLE family_contracts 
        ADD COLUMN IF NOT EXISTS affiliate_link_id integer,
        ADD COLUMN IF NOT EXISTS coupon_code_id integer,
        ADD COLUMN IF NOT EXISTS original_price numeric(10, 2),
        ADD COLUMN IF NOT EXISTS discount_amount numeric(10, 2),
        ADD COLUMN IF NOT EXISTS final_price numeric(10, 2);
      `);

      // Add Schedule A income fields
      await db.execute(sql`
        ALTER TABLE family_contracts 
        ADD COLUMN IF NOT EXISTS schedule_income_employment numeric(12, 2),
        ADD COLUMN IF NOT EXISTS schedule_income_ei numeric(12, 2),
        ADD COLUMN IF NOT EXISTS schedule_income_workers_comp numeric(12, 2),
        ADD COLUMN IF NOT EXISTS schedule_income_investment numeric(12, 2),
        ADD COLUMN IF NOT EXISTS schedule_income_pension numeric(12, 2),
        ADD COLUMN IF NOT EXISTS schedule_income_government_assistance numeric(12, 2),
        ADD COLUMN IF NOT EXISTS schedule_income_self_employment numeric(12, 2),
        ADD COLUMN IF NOT EXISTS schedule_income_other numeric(12, 2),
        ADD COLUMN IF NOT EXISTS schedule_income_total_tax_return numeric(12, 2);
      `);

      // Add Schedule A assets fields (using jsonb for compatibility)
      await db.execute(sql`
        ALTER TABLE family_contracts 
        ADD COLUMN IF NOT EXISTS schedule_assets_real_estate jsonb,
        ADD COLUMN IF NOT EXISTS schedule_assets_vehicles jsonb,
        ADD COLUMN IF NOT EXISTS schedule_assets_financial jsonb,
        ADD COLUMN IF NOT EXISTS schedule_assets_pensions jsonb,
        ADD COLUMN IF NOT EXISTS schedule_assets_business jsonb,
        ADD COLUMN IF NOT EXISTS schedule_assets_other jsonb;
      `);

      // Add Schedule A debts fields
      await db.execute(sql`
        ALTER TABLE family_contracts 
        ADD COLUMN IF NOT EXISTS schedule_debts_secured jsonb,
        ADD COLUMN IF NOT EXISTS schedule_debts_unsecured jsonb,
        ADD COLUMN IF NOT EXISTS schedule_debts_other jsonb;
      `);

      appliedMigrations.push('0010_schedule_a');
      console.log('✅ Schedule A and affiliate/coupon fields migration applied');
    } catch (error) {
      console.log('⚠️ Schedule A and affiliate/coupon fields migration already applied or failed:', error);
    }

    // Apply migration 0011_property_separation_type.sql (property separation options) if needed
    try {
      await db.execute(sql`
        ALTER TABLE family_contracts 
        ADD COLUMN IF NOT EXISTS property_separation_type varchar(50);
      `);
      appliedMigrations.push('0011_property_separation_type');
      console.log('✅ Property separation type field migration applied');
    } catch (error) {
      console.log('⚠️ Property separation type field migration already applied or failed:', error);
    }

    // Apply migration 0012_schedule_b.sql (Schedule B - Partner's financial information) if needed
    try {
      // Add Schedule B income fields
      await db.execute(sql`
        ALTER TABLE family_contracts 
        ADD COLUMN IF NOT EXISTS schedule_b_income_employment numeric(12, 2),
        ADD COLUMN IF NOT EXISTS schedule_b_income_ei numeric(12, 2),
        ADD COLUMN IF NOT EXISTS schedule_b_income_workers_comp numeric(12, 2),
        ADD COLUMN IF NOT EXISTS schedule_b_income_investment numeric(12, 2),
        ADD COLUMN IF NOT EXISTS schedule_b_income_pension numeric(12, 2),
        ADD COLUMN IF NOT EXISTS schedule_b_income_government_assistance numeric(12, 2),
        ADD COLUMN IF NOT EXISTS schedule_b_income_self_employment numeric(12, 2),
        ADD COLUMN IF NOT EXISTS schedule_b_income_other numeric(12, 2),
        ADD COLUMN IF NOT EXISTS schedule_b_income_total_tax_return numeric(12, 2);
      `);

      // Add Schedule B assets fields (using jsonb for compatibility)
      await db.execute(sql`
        ALTER TABLE family_contracts 
        ADD COLUMN IF NOT EXISTS schedule_b_assets_real_estate jsonb,
        ADD COLUMN IF NOT EXISTS schedule_b_assets_vehicles jsonb,
        ADD COLUMN IF NOT EXISTS schedule_b_assets_financial jsonb,
        ADD COLUMN IF NOT EXISTS schedule_b_assets_pensions jsonb,
        ADD COLUMN IF NOT EXISTS schedule_b_assets_business jsonb,
        ADD COLUMN IF NOT EXISTS schedule_b_assets_other jsonb;
      `);

      // Add Schedule B debts fields
      await db.execute(sql`
        ALTER TABLE family_contracts 
        ADD COLUMN IF NOT EXISTS schedule_b_debts_secured jsonb,
        ADD COLUMN IF NOT EXISTS schedule_b_debts_unsecured jsonb,
        ADD COLUMN IF NOT EXISTS schedule_b_debts_other jsonb;
      `);

      appliedMigrations.push('0012_schedule_b');
      console.log('✅ Schedule B fields migration applied');
    } catch (error) {
      console.log('⚠️ Schedule B fields migration already applied or failed:', error);
    }

    // Apply migration 0013_remove_teams.sql (remove team-related tables and columns) if needed
    try {
      // Remove team_id column from users table
      await db.execute(sql`
        ALTER TABLE users 
        DROP COLUMN IF EXISTS team_id;
      `);

      // Remove team_id column from family_contracts table
      await db.execute(sql`
        ALTER TABLE family_contracts 
        DROP COLUMN IF EXISTS team_id;
      `);

      // Remove team-related columns from affiliate_tracking table
      await db.execute(sql`
        ALTER TABLE affiliate_tracking 
        DROP COLUMN IF EXISTS team_id;
      `);

      // Remove team-related tables
      await db.execute(sql`
        DROP TABLE IF EXISTS "team_members" CASCADE;
        DROP TABLE IF EXISTS "teams" CASCADE;
      `);

      appliedMigrations.push('0013_remove_teams');
      console.log('✅ Team-related tables and columns removal migration applied');
    } catch (error) {
      console.log('⚠️ Team removal migration already applied or failed:', error);
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
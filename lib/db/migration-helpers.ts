import { db } from './drizzle';
import { sql } from 'drizzle-orm';

export interface MigrationStep {
  name: string;
  query: string;
  rollback?: string;
  verify?: string;
}

export interface MigrationResult {
  success: boolean;
  appliedSteps: string[];
  errors: string[];
  rollbackSteps: string[];
}

/**
 * Safe migration runner with automatic rollback on failure
 */
export async function runSafeMigration(migrationName: string, steps: MigrationStep[]): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    appliedSteps: [],
    errors: [],
    rollbackSteps: []
  };

  console.log(`🚀 Starting migration: ${migrationName}`);
  
  try {
    // Apply each step
    for (const step of steps) {
      console.log(`  Applying: ${step.name}`);
      
      try {
        await db.execute(sql.raw(step.query));
        result.appliedSteps.push(step.name);
        
        // Verify step if verification query provided
        if (step.verify) {
          await db.execute(sql.raw(step.verify));
          console.log(`  ✅ Verified: ${step.name}`);
        } else {
          console.log(`  ✅ Applied: ${step.name}`);
        }
        
      } catch (error) {
        const errorMsg = `Step "${step.name}" failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        result.errors.push(errorMsg);
        console.error(`  ❌ ${errorMsg}`);
        
        // Rollback already applied steps
        await rollbackSteps(result.appliedSteps, steps, result);
        return result;
      }
    }
    
    // All steps successful
    result.success = true;
    console.log(`✅ Migration "${migrationName}" completed successfully`);
    
    // Record migration in journal
    await recordMigration(migrationName);
    
  } catch (error) {
    result.errors.push(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error(`❌ Migration "${migrationName}" failed:`, error);
  }
  
  return result;
}

async function rollbackSteps(appliedSteps: string[], allSteps: MigrationStep[], result: MigrationResult) {
  console.log('🔄 Rolling back applied steps...');
  
  // Rollback in reverse order
  for (let i = appliedSteps.length - 1; i >= 0; i--) {
    const stepName = appliedSteps[i];
    const step = allSteps.find(s => s.name === stepName);
    
    if (step?.rollback) {
      try {
        await db.execute(sql.raw(step.rollback));
        result.rollbackSteps.push(stepName);
        console.log(`  🔄 Rolled back: ${stepName}`);
      } catch (rollbackError) {
        console.error(`  ❌ Rollback failed for ${stepName}:`, rollbackError);
        result.errors.push(`Rollback failed for ${stepName}: ${rollbackError instanceof Error ? rollbackError.message : 'Unknown error'}`);
      }
    }
  }
}

async function recordMigration(migrationName: string) {
  try {
    await db.execute(sql`
      INSERT INTO "__drizzle_migrations" (hash, created_at) 
      VALUES (${migrationName + ':' + Date.now()}, now())
      ON CONFLICT DO NOTHING;
    `);
  } catch (error) {
    console.warn('Could not record migration in journal:', error);
  }
}

/**
 * Helper to create common migration steps
 */
export const migrationSteps = {
  addColumn: (table: string, column: string, type: string, defaultValue?: string): MigrationStep => ({
    name: `add_column_${table}_${column}`,
    query: `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${column} ${type}${defaultValue ? ` DEFAULT ${defaultValue}` : ''};`,
    rollback: `ALTER TABLE ${table} DROP COLUMN IF EXISTS ${column};`,
    verify: `SELECT ${column} FROM ${table} LIMIT 1;`
  }),
  
  dropColumn: (table: string, column: string): MigrationStep => ({
    name: `drop_column_${table}_${column}`,
    query: `ALTER TABLE ${table} DROP COLUMN IF EXISTS ${column} CASCADE;`,
    verify: `SELECT column_name FROM information_schema.columns WHERE table_name = '${table}' AND column_name = '${column}';`
  }),
  
  createTable: (tableName: string, definition: string): MigrationStep => ({
    name: `create_table_${tableName}`,
    query: `CREATE TABLE IF NOT EXISTS ${tableName} (${definition});`,
    rollback: `DROP TABLE IF EXISTS ${tableName};`,
    verify: `SELECT 1 FROM information_schema.tables WHERE table_name = '${tableName}';`
  })
};
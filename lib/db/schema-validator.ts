import { db } from './drizzle';
import { sql } from 'drizzle-orm';
import { familyContracts, users, activityLogs } from './schema';

export interface SchemaValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingColumns: string[];
  extraColumns: string[];
}

export async function validateSchemaSync(): Promise<SchemaValidationResult> {
  const result: SchemaValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    missingColumns: [],
    extraColumns: []
  };

  try {
    // Validate family_contracts table
    await validateTableSchema('family_contracts', familyContracts, result);
    
    // Validate users table
    await validateTableSchema('users', users, result);
    
    // Validate activity_logs table
    await validateTableSchema('activity_logs', activityLogs, result);

    // Set overall validity
    result.isValid = result.errors.length === 0;
    
    return result;
  } catch (error) {
    result.isValid = false;
    result.errors.push(`Schema validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return result;
  }
}

async function validateTableSchema(tableName: string, schemaDefinition: any, result: SchemaValidationResult) {
  try {
    // Get actual table columns from database
    const actualColumns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = ${tableName}
      ORDER BY ordinal_position;
    `);

    const actualColumnNames = (Array.isArray(actualColumns) ? actualColumns : actualColumns.rows || [])
      .map((col: any) => col.column_name);

    // Get expected columns from schema definition
    const expectedColumns = Object.keys(schemaDefinition);

    // Check for missing columns (in schema but not in DB)
    const missing = expectedColumns.filter(col => !actualColumnNames.includes(col));
    if (missing.length > 0) {
      result.errors.push(`Table ${tableName}: Missing columns - ${missing.join(', ')}`);
      result.missingColumns.push(...missing.map(col => `${tableName}.${col}`));
    }

    // Check for extra columns (in DB but not in schema)
    const extra = actualColumnNames.filter(col => !expectedColumns.includes(col));
    if (extra.length > 0) {
      result.warnings.push(`Table ${tableName}: Extra columns (may be legacy) - ${extra.join(', ')}`);
      result.extraColumns.push(...extra.map(col => `${tableName}.${col}`));
    }

    // Test basic query capability
    await db.execute(sql`SELECT COUNT(*) FROM ${sql.raw(tableName)} LIMIT 1;`);
    
  } catch (error) {
    result.errors.push(`Table ${tableName}: ${error instanceof Error ? error.message : 'Validation failed'}`);
  }
}

export async function validateQueryCapability(): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = [];
  
  try {
    // Test critical queries that have failed before
    
    // Test activity log insertion
    await db.execute(sql`
      SELECT user_id, action, timestamp, ip_address 
      FROM activity_logs 
      LIMIT 1;
    `);

    // Test contracts query with explicit field selection
    await db.execute(sql`
      SELECT id, user_id, user_full_name, status, created_at, updated_at 
      FROM family_contracts 
      LIMIT 1;
    `);

  } catch (error) {
    errors.push(`Query validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return { success: errors.length === 0, errors };
}
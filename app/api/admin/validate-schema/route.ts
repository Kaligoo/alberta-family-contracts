import { NextRequest, NextResponse } from 'next/server';
import { validateSchemaSync, validateQueryCapability } from '@/lib/db/schema-validator';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Starting comprehensive schema validation...');
    
    // Run schema validation
    const schemaValidation = await validateSchemaSync();
    
    // Run query capability validation  
    const queryValidation = await validateQueryCapability();
    
    const overallHealth = {
      schemaValid: schemaValidation.isValid,
      queriesValid: queryValidation.success,
      overallValid: schemaValidation.isValid && queryValidation.success
    };

    console.log('Schema validation result:', {
      valid: overallHealth.overallValid,
      errors: [...schemaValidation.errors, ...queryValidation.errors].length
    });

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      health: overallHealth,
      schemaValidation,
      queryValidation,
      summary: {
        totalErrors: schemaValidation.errors.length + queryValidation.errors.length,
        totalWarnings: schemaValidation.warnings.length,
        recommendations: generateRecommendations(schemaValidation, queryValidation)
      }
    });

  } catch (error) {
    console.error('❌ Schema validation error:', error);
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        health: { overallValid: false },
        error: 'Schema validation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function generateRecommendations(schemaValidation: any, queryValidation: any): string[] {
  const recommendations = [];
  
  if (schemaValidation.missingColumns.length > 0) {
    recommendations.push(`Run database migration to add missing columns: ${schemaValidation.missingColumns.join(', ')}`);
  }
  
  if (schemaValidation.extraColumns.length > 0) {
    recommendations.push(`Consider removing unused columns: ${schemaValidation.extraColumns.join(', ')}`);
  }
  
  if (!queryValidation.success) {
    recommendations.push('Critical queries are failing - immediate attention required');
  }
  
  if (schemaValidation.isValid && queryValidation.success) {
    recommendations.push('✅ Database schema is healthy and all queries are working');
  }
  
  return recommendations;
}
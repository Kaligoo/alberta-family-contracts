import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Populating sample data for empty fields...');
    
    // Sample data for empty fields
    const sampleData = {
      userLawyer: 'Smith & Associates Legal Services, 123 Main St, Calgary, AB',
      partnerLawyer: 'Johnson Law Firm, 456 Centre St, Edmonton, AB',
      residenceAddress: '789 Family Avenue, Calgary, AB T2P 1A1',
      residenceOwnership: 'joint',
      expenseSplitType: 'equal',
      additionalClauses: 'Standard cohabitation terms and conditions apply.',
      notes: 'Sample contract for demonstration purposes.'
    };

    // Update contracts with empty fields
    await db.execute(sql`
      UPDATE family_contracts 
      SET 
        user_lawyer = COALESCE(user_lawyer, ${sampleData.userLawyer}),
        partner_lawyer = COALESCE(partner_lawyer, ${sampleData.partnerLawyer}),
        residence_address = COALESCE(residence_address, ${sampleData.residenceAddress}),
        residence_ownership = COALESCE(residence_ownership, ${sampleData.residenceOwnership}),
        expense_split_type = COALESCE(expense_split_type, ${sampleData.expenseSplitType}),
        additional_clauses = COALESCE(additional_clauses, ${sampleData.additionalClauses}),
        notes = COALESCE(notes, ${sampleData.notes}),
        updated_at = now()
      WHERE id IS NOT NULL;
    `);

    console.log('✅ Sample data populated successfully');

    // Get count of updated contracts
    const contractCount = await db.execute(sql`
      SELECT COUNT(*) as count FROM family_contracts;
    `);

    return NextResponse.json({
      success: true,
      message: 'Sample data populated successfully',
      contractsUpdated: contractCount.rows[0]?.count || 0,
      sampleData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error populating sample data:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to populate sample data', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
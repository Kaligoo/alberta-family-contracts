import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { familyContracts } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🧪 Testing set-current API directly...');
    
    const user = await getUser();
    
    if (!user) {
      console.log('❌ No user authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ User authenticated:', user.id);

    const { id } = await params;
    const contractId = parseInt(id);
    
    console.log('Contract ID to set as current:', contractId);

    if (!contractId || isNaN(contractId)) {
      console.log('❌ Invalid contract ID');
      return NextResponse.json({ error: 'Invalid contract ID' }, { status: 400 });
    }

    // Check if contract exists and belongs to user
    const [contract] = await db
      .select()
      .from(familyContracts)
      .where(
        and(
          eq(familyContracts.id, contractId),
          eq(familyContracts.userId, user.id)
        )
      )
      .limit(1);

    if (!contract) {
      console.log('❌ Contract not found or not owned by user');
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    console.log('✅ Contract found:', {
      id: contract.id,
      userFullName: contract.userFullName,
      currentStatus: contract.isCurrentContract
    });

    // Clear any existing current contracts
    console.log('🔄 Clearing existing current contracts...');
    const clearResult = await db
      .update(familyContracts)
      .set({ 
        isCurrentContract: 'false'
      })
      .where(
        and(
          eq(familyContracts.userId, user.id),
          eq(familyContracts.isCurrentContract, 'true')
        )
      );

    console.log('✅ Cleared existing current contracts');

    // Set new current contract
    console.log('🎯 Setting new current contract...');
    const [updatedContract] = await db
      .update(familyContracts)
      .set({ 
        isCurrentContract: 'true',
        updatedAt: new Date()
      })
      .where(
        and(
          eq(familyContracts.id, contractId),
          eq(familyContracts.userId, user.id)
        )
      )
      .returning();

    console.log('✅ Set new current contract:', {
      id: updatedContract.id,
      isCurrentContract: updatedContract.isCurrentContract
    });

    return NextResponse.json({ 
      success: true, 
      contract: updatedContract,
      debug: {
        userId: user.id,
        contractId: contractId,
        originalStatus: contract.isCurrentContract,
        newStatus: updatedContract.isCurrentContract
      }
    });

  } catch (error) {
    console.error('❌ Error in test set-current:', error);
    return NextResponse.json(
      { 
        error: 'Failed to set current contract',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
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
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const contractId = parseInt(id);
    
    if (!contractId || isNaN(contractId)) {
      console.error('Invalid request parameters:', { 
        contractId, 
        rawId: id,
        isNaN: isNaN(contractId)
      });
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // First, verify the contract exists and belongs to the user
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
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    // First, clear any existing current contract for this user
    try {
      console.log('Clearing existing current contracts for user:', user.id);
      
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

      console.log('Clear existing contracts result:', clearResult);

    } catch (clearError) {
      console.error('Error clearing existing current contracts:', clearError);
      return NextResponse.json(
        { error: 'Failed to clear existing current contracts', details: clearError instanceof Error ? clearError.message : 'Unknown error' },
        { status: 500 }
      );
    }

    // Set the selected contract as current
    try {
      const updateResult = await db
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
        );

      console.log('Update result:', updateResult);

      // Verify the update worked by fetching the updated contract
      const [updatedContract] = await db
        .select()
        .from(familyContracts)
        .where(
          and(
            eq(familyContracts.id, contractId),
            eq(familyContracts.userId, user.id)
          )
        )
        .limit(1);

      if (!updatedContract) {
        console.error('Failed to fetch updated contract after update');
        return NextResponse.json(
          { error: 'Failed to verify contract update' },
          { status: 500 }
        );
      }

      console.log('Set contract as current:', {
        contractId,
        userId: user.id,
        isCurrentContract: updatedContract.isCurrentContract,
        success: true
      });

      return NextResponse.json({ 
        success: true, 
        contract: {
          id: updatedContract.id,
          isCurrentContract: updatedContract.isCurrentContract,
          updatedAt: updatedContract.updatedAt
        }
      });

    } catch (updateError) {
      console.error('Error during contract update:', updateError);
      return NextResponse.json(
        { error: 'Database update failed', details: updateError instanceof Error ? updateError.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error setting current contract:', error);
    return NextResponse.json(
      { error: 'Failed to set current contract' },
      { status: 500 }
    );
  }
}
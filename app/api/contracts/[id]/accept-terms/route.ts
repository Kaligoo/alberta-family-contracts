import { NextRequest, NextResponse } from 'next/server';
import { getUser, getUserWithTeam } from '@/lib/db/queries';
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

    const userWithTeam = await getUserWithTeam(user.id);
    const { id } = await params;
    const contractId = parseInt(id);
    
    if (!userWithTeam?.teamId || !contractId || isNaN(contractId)) {
      console.error('Invalid request parameters:', { 
        teamId: userWithTeam?.teamId, 
        contractId, 
        rawId: id,
        isNaN: isNaN(contractId)
      });
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Verify the contract exists and belongs to the user
    const [contract] = await db
      .select()
      .from(familyContracts)
      .where(
        and(
          eq(familyContracts.id, contractId),
          eq(familyContracts.userId, user.id),
          eq(familyContracts.teamId, userWithTeam.teamId)
        )
      )
      .limit(1);

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    // Check if terms are already accepted
    if (contract.termsAccepted === 'true') {
      return NextResponse.json({ 
        success: true, 
        message: 'Terms already accepted',
        acceptedAt: contract.termsAcceptedAt
      });
    }

    // Update contract to mark terms as accepted
    const [updatedContract] = await db
      .update(familyContracts)
      .set({ 
        termsAccepted: 'true',
        termsAcceptedAt: new Date(),
        updatedAt: new Date()
      })
      .where(
        and(
          eq(familyContracts.id, contractId),
          eq(familyContracts.userId, user.id),
          eq(familyContracts.teamId, userWithTeam.teamId)
        )
      )
      .returning();

    console.log('Terms accepted for contract:', {
      contractId,
      userId: user.id,
      teamId: userWithTeam.teamId,
      acceptedAt: updatedContract.termsAcceptedAt
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Terms and conditions accepted successfully',
      acceptedAt: updatedContract.termsAcceptedAt
    });
  } catch (error) {
    console.error('Error accepting terms:', error);
    return NextResponse.json(
      { error: 'Failed to accept terms and conditions' },
      { status: 500 }
    );
  }
}
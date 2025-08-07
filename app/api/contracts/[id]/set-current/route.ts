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

    // First, verify the contract exists and belongs to the user
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

    // First, clear any existing current contract for this user
    await db
      .update(familyContracts)
      .set({ 
        isCurrentContract: 'false'
      })
      .where(
        and(
          eq(familyContracts.userId, user.id),
          eq(familyContracts.teamId, userWithTeam.teamId),
          eq(familyContracts.isCurrentContract, 'true')
        )
      );

    // Set the selected contract as current
    const [updatedContract] = await db
      .update(familyContracts)
      .set({ 
        isCurrentContract: 'true',
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

    console.log('Set contract as current:', {
      contractId,
      userId: user.id,
      teamId: userWithTeam.teamId,
      success: !!updatedContract
    });

    return NextResponse.json({ 
      success: true, 
      contract: updatedContract 
    });
  } catch (error) {
    console.error('Error setting current contract:', error);
    return NextResponse.json(
      { error: 'Failed to set current contract' },
      { status: 500 }
    );
  }
}